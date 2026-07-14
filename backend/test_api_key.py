import asyncio
import sys
from app import config
from app.services.openai_service import stream_response

async def main():
    print(f"Testing OpenAI key: {config.OPENAI_API_KEY[:15]}...")
    print(f"Model: {config.OPENAI_MODEL}")
    
    instructions = "You are a helpful assistant."
    user_input = "Hello, reply with only 'Key is working!'"
    
    print("Sending stream request...")
    try:
        response_chunks = []
        async for chunk in stream_response(instructions, user_input):
            print(f"Received chunk: {repr(chunk)}")
            response_chunks.append(chunk)
        
        full_response = "".join(response_chunks)
        print(f"Full response: {full_response}")
        
        if "Key is working" in full_response or "MovieMind AI" not in full_response:
            print("SUCCESS: Key is responding correctly!")
            sys.exit(0)
        else:
            print("FAILURE: Did not receive expected output. Might be configured incorrectly.")
            sys.exit(1)
            
    except Exception as e:
        print(f"Exception encountered: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
