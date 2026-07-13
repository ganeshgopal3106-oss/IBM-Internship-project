import logging
import re
import json
from dataclasses import dataclass
from datetime import date
from typing import Any

import httpx

from app import config

logger = logging.getLogger("moviemind.tmdb")

UNKNOWN_MOVIE_MESSAGE = (
    "I couldn't find reliable information about this movie. "
    "Please check the spelling or try another title."
)

TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
_movie_cache: dict[str, list["MovieCandidate"]] = {}
_genre_cache: dict[int, str] = {}


@dataclass(frozen=True)
class MovieCandidate:
    id: int
    title: str
    release_year: int | None
    overview: str
    poster_url: str | None
    genres: list[str]
    rating: float | None

    @property
    def display_title(self) -> str:
        return f"{self.title} ({self.release_year})" if self.release_year else self.title


def normalize_title(value: str) -> str:
    value = re.sub(r"\(\s*\d{4}\s*\)", " ", value or "")
    value = re.sub(r"\b(19|20)\d{2}\b", " ", value)
    value = re.sub(r"[^a-zA-Z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip().lower()


def extract_year(value: str) -> int | None:
    match = re.search(r"\b((?:19|20)\d{2})\b", value or "")
    return int(match.group(1)) if match else None


async def _load_genres(client: httpx.AsyncClient) -> None:
    if _genre_cache or not config.TMDB_API_KEY:
        return

    response = await client.get(
        "https://api.themoviedb.org/3/genre/movie/list",
        params={"api_key": config.TMDB_API_KEY, "language": "en-US"},
    )
    response.raise_for_status()
    for genre in response.json().get("genres", []):
        _genre_cache[int(genre["id"])] = genre["name"]


def _candidate_from_tmdb(item: dict[str, Any]) -> MovieCandidate:
    release_date = item.get("release_date") or ""
    release_year = int(release_date[:4]) if re.match(r"^\d{4}", release_date) else None
    poster_path = item.get("poster_path")
    genre_ids = item.get("genre_ids") or []
    return MovieCandidate(
        id=int(item["id"]),
        title=item.get("title") or item.get("original_title") or "Untitled",
        release_year=release_year,
        overview=item.get("overview") or "",
        poster_url=f"{TMDB_IMAGE_BASE}{poster_path}" if poster_path else None,
        genres=[_genre_cache.get(int(genre_id), str(genre_id)) for genre_id in genre_ids],
        rating=round(float(item["vote_average"]), 1) if item.get("vote_average") is not None else None,
    )


def _sort_candidates(query: str, requested_year: int | None, items: list[MovieCandidate]) -> list[MovieCandidate]:
    normalized_query = normalize_title(query)

    def score(item: MovieCandidate) -> tuple[int, float, int]:
        title = normalize_title(item.title)
        exact = int(title == normalized_query)
        year_match = int(requested_year is not None and item.release_year == requested_year)
        rating = item.rating or 0.0
        recency = item.release_year or 0
        return (year_match, exact, rating, recency)

    return sorted(items, key=score, reverse=True)


async def search_movies_fallback(query: str, limit: int = 6) -> list[MovieCandidate]:
    cleaned = (query or "").strip()
    if not cleaned or len(cleaned) > 120:
        return []

    cache_key = normalize_title(cleaned) + f":{extract_year(cleaned) or ''}:{limit}:fallback"
    if cache_key in _movie_cache:
        return _movie_cache[cache_key]

    url = f"https://imdb.iamidiotareyoutoo.com/search?q={cleaned}"
    headers = {
        "User-Agent": "MovieMindAI/1.0 (contact@example.com)"
    }
    try:
        async with httpx.AsyncClient(timeout=8.0, headers=headers) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                description = data.get("description", [])
                candidates = []
                for item in description[:limit]:
                    imdb_id = item.get("#IMDB_ID", "")
                    numeric_id = int(re.sub(r"\D", "", imdb_id)) if re.sub(r"\D", "", imdb_id) else 0
                    title = item.get("#TITLE", "Untitled")
                    year = item.get("#YEAR")
                    poster_url = item.get("#IMG_POSTER")
                    actors = item.get("#ACTORS", "")
                    
                    overview = f"Actors: {actors}" if actors else ""
                    
                    candidates.append(MovieCandidate(
                        id=numeric_id,
                        title=title,
                        release_year=year,
                        overview=overview,
                        poster_url=poster_url,
                        genres=[],
                        rating=None
                    ))
                _movie_cache[cache_key] = candidates
                return candidates
    except Exception as exc:
        logger.exception("Fallback FMDB search failed for %r: %s", cleaned, exc)
    return []


async def enrich_movie_with_gemini(movie: MovieCandidate) -> MovieCandidate:
    if movie.overview and not movie.overview.startswith("Actors:") and movie.genres:
        return movie

    if not config.OPENAI_API_KEY:
        return movie

    from app.services.openai_service import get_openai_client
    try:
        client, is_gemini = get_openai_client()
        model = "gemini-2.5-flash" if is_gemini else config.OPENAI_MODEL
        
        prompt = f"""
        Provide movie metadata for "{movie.title}" ({movie.release_year or 'unknown year'}).
        Return raw JSON containing:
        - overview: a short 2-3 sentence plot description.
        - genres: list of string genres.
        - rating: floating point rating out of 10 (e.g. 8.2).
        
        Do not add any markdown, code blocks, or explanations. Only raw JSON.
        """
        
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a movie database API. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=250
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        data = json.loads(content.strip())
        
        return MovieCandidate(
            id=movie.id,
            title=movie.title,
            release_year=movie.release_year,
            overview=data.get("overview", movie.overview),
            poster_url=movie.poster_url,
            genres=data.get("genres", []),
            rating=data.get("rating"),
        )
    except Exception as exc:
        logger.warning("Failed to enrich movie candidate %r with Gemini: %s", movie.title, exc)
        return movie


async def search_movies(query: str, limit: int = 6) -> list[MovieCandidate]:
    cleaned = (query or "").strip()
    if not cleaned or len(cleaned) > 120:
        return []

    if not config.TMDB_API_KEY:
        return await search_movies_fallback(cleaned, limit)

    cache_key = normalize_title(cleaned) + f":{extract_year(cleaned) or ''}:{limit}"
    if cache_key in _movie_cache:
        return _movie_cache[cache_key]

    try:
        async with httpx.AsyncClient(timeout=config.TMDB_TIMEOUT_SECONDS) as client:
            await _load_genres(client)
            response = await client.get(
                "https://api.themoviedb.org/3/search/movie",
                params={
                    "api_key": config.TMDB_API_KEY,
                    "query": cleaned,
                    "language": "en-US",
                    "page": 1,
                    "include_adult": "false",
                    "year": extract_year(cleaned),
                },
            )
            response.raise_for_status()
            results = response.json().get("results", [])[:12]
    except httpx.HTTPError as exc:
        logger.exception("TMDb request failed for %r: %s", cleaned, exc)
        return []

    candidates = [_candidate_from_tmdb(item) for item in results if item.get("id")]
    candidates = _sort_candidates(cleaned, extract_year(cleaned), candidates)[:limit]
    _movie_cache[cache_key] = candidates
    return candidates


async def resolve_movie(query: str) -> tuple[str, MovieCandidate | None, list[MovieCandidate]]:
    candidates = await search_movies(query)
    if not candidates:
        return "unknown", None, []

    requested_year = extract_year(query)
    normalized_query = normalize_title(query)
    exact_matches = [
        item
        for item in candidates
        if normalize_title(item.title) == normalized_query
        and (requested_year is None or item.release_year == requested_year)
    ]

    status = "ok"
    selected = None

    if requested_year and exact_matches:
        selected = exact_matches[0]
    elif len(exact_matches) == 1:
        selected = exact_matches[0]
    else:
        plausible = [
            item
            for item in candidates[:4]
            if normalize_title(item.title) == normalized_query
            or normalized_query in normalize_title(item.title)
            or normalize_title(item.title) in normalized_query
        ]
        distinct_titles = {item.display_title for item in plausible}
        if len(distinct_titles) > 1 and normalized_query in {"batman", "dune", "avatar"}:
            status = "ambiguous"
            selected = None
            candidates = plausible
        else:
            selected = candidates[0]

    if selected:
        selected = await enrich_movie_with_gemini(selected)

    return status, selected, candidates


async def poster_for_title(title: str) -> dict[str, Any]:
    status, movie, matches = await resolve_movie(title)
    if status == "ambiguous":
        return {
            "poster_url": None,
            "status": "ambiguous",
            "message": _clarification_message(matches),
            "matches": [candidate.display_title for candidate in matches[:4]],
        }
    if not movie:
        return {"poster_url": None, "status": "not_found", "message": UNKNOWN_MOVIE_MESSAGE}

    return {
        "poster_url": movie.poster_url,
        "status": "ok",
        "title": movie.title,
        "release_year": movie.release_year,
        "genres": movie.genres,
        "rating": movie.rating,
        "overview": movie.overview,
    }


def _clarification_message(matches: list[MovieCandidate]) -> str:
    options = ", ".join(candidate.display_title for candidate in matches[:4])
    return f"Which movie did you mean? {options}"


def build_movie_context(movie: MovieCandidate) -> str:
    return (
        f"Title: {movie.display_title}\n"
        f"Genres: {', '.join(movie.genres) or 'Unknown'}\n"
        f"TMDb rating: {movie.rating if movie.rating is not None else 'Unknown'}\n"
        f"Overview: {movie.overview or 'No overview available.'}"
    )


def current_year() -> int:
    return date.today().year
