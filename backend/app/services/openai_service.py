import logging
from collections.abc import AsyncIterator
from typing import Any

from openai import APIConnectionError, APIError, APITimeoutError, AuthenticationError, AsyncOpenAI, OpenAIError, RateLimitError

from app import config

logger = logging.getLogger("moviemind.openai")

USER_FRIENDLY_OPENAI_ERROR = (
    "MovieMind AI is having trouble reaching the AI service right now. "
    "Please try again in a moment."
)
OPENAI_KEY_SETUP_ERROR = (
    "MovieMind AI is configured with a non-OpenAI API key. "
    "Set OPENAI_API_KEY to a valid OpenAI API key that starts with sk- to use gpt-4o-mini."
)

_client: AsyncOpenAI | None = None
_is_gemini: bool = False
_is_nvidia: bool = False


def get_openai_client() -> tuple[AsyncOpenAI, bool, bool]:
    global _client, _is_gemini, _is_nvidia
    if not config.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    if _client is None:
        key = config.OPENAI_API_KEY
        if key.startswith(("AQ.", "AIza")):
            _is_gemini = True
            _is_nvidia = False
            _client = AsyncOpenAI(
                api_key=key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                timeout=config.OPENAI_TIMEOUT_SECONDS,
                max_retries=1,
            )
        elif key.startswith("nvapi-"):
            _is_gemini = False
            _is_nvidia = True
            _client = AsyncOpenAI(
                api_key=key,
                base_url="https://integrate.api.nvidia.com/v1",
                timeout=config.OPENAI_TIMEOUT_SECONDS,
                max_retries=1,
            )
        else:
            _is_gemini = False
            _is_nvidia = False
            _client = AsyncOpenAI(
                api_key=key,
                timeout=config.OPENAI_TIMEOUT_SECONDS,
                max_retries=1,
            )
    return _client, _is_gemini, _is_nvidia


def _event_text_delta(event: Any) -> str:
    event_type = getattr(event, "type", "")
    if event_type == "response.output_text.delta":
        return getattr(event, "delta", "") or ""
    if event_type == "response.refusal.delta":
        return getattr(event, "delta", "") or ""
    return ""


async def stream_response(instructions: str, user_input: str) -> AsyncIterator[str]:
    """
    Stream plain text deltas from the OpenAI Responses API, Gemini Chat Completions, or NVIDIA API.
    The frontend consumes this as text/plain; errors are returned as readable text.
    """
    try:
        client, is_gemini, is_nvidia = get_openai_client()
        emitted = False

        if is_gemini or is_nvidia:
            model = config.OPENAI_MODEL
            if is_nvidia:
                if not model or not model.startswith("nvidia/"):
                    model = "nvidia/nemotron-3-ultra-550b-a55b"
            else:
                if not model or not model.startswith("gemini"):
                    model = "gemini-2.5-flash"

            kwargs = {
                "model": model,
                "messages": [
                    {"role": "system", "content": instructions},
                    {"role": "user", "content": user_input},
                ],
                "temperature": 1.0 if is_nvidia else 0.4,
                "max_tokens": 16384 if is_nvidia else 1200,
                "stream": True,
            }
            if is_nvidia:
                kwargs["top_p"] = 0.95
                kwargs["extra_body"] = {
                    "chat_template_kwargs": {"enable_thinking": True},
                    "reasoning_budget": 16384,
                }

            stream = await client.chat.completions.create(**kwargs)


            async for chunk in stream:
                if not chunk.choices:
                    continue
                # Stream reasoning content first if available
                reasoning = getattr(chunk.choices[0].delta, "reasoning_content", None)
                if reasoning:
                    emitted = True
                    yield reasoning
                text = chunk.choices[0].delta.content or ""
                if text:
                    emitted = True
                    yield text
        else:
            stream = await client.responses.create(
                model=config.OPENAI_MODEL,
                instructions=instructions,
                input=user_input,
                temperature=0.4,
                max_output_tokens=1200,
                stream=True,
            )

            async for event in stream:
                text = _event_text_delta(event)
                if text:
                    emitted = True
                    yield text

        if not emitted:
            logger.warning("AI stream completed without text output.")
            yield USER_FRIENDLY_OPENAI_ERROR
    except RuntimeError as exc:
        logger.error("AI configuration error: %s", exc)
        yield str(exc) if str(exc) else "MovieMind AI is not configured yet. Please set OPENAI_API_KEY on the server."
    except AuthenticationError:
        logger.error("AI authentication failed. Check API key.")
        yield "MovieMind AI could not authenticate. Please check your API key on the server."
    except RateLimitError:
        logger.warning("AI rate limit reached.")
        yield "MovieMind AI reached the current rate limit. Please try again shortly."
    except APITimeoutError:
        logger.warning("AI request timed out.")
        yield "MovieMind AI timed out. Please try again."
    except APIConnectionError:
        logger.warning("AI connection failed.")
        yield USER_FRIENDLY_OPENAI_ERROR
    except (APIError, OpenAIError) as exc:
        logger.error("AI API error type=%s status=%s", type(exc).__name__, getattr(exc, "status_code", None))
        yield USER_FRIENDLY_OPENAI_ERROR
    except Exception as exc:
        logger.exception("Unexpected AI streaming error: %s", exc)
        yield USER_FRIENDLY_OPENAI_ERROR
