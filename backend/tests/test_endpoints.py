import pytest
from fastapi.testclient import TestClient

from app import main
from app.services.tmdb_service import UNKNOWN_MOVIE_MESSAGE, MovieCandidate


client = TestClient(main.app)


MOVIES = {
    "interstellar": MovieCandidate(1, "Interstellar", 2014, "Space, time, and family.", "https://example.com/interstellar.jpg", ["Science Fiction", "Drama"], 8.4),
    "inception": MovieCandidate(2, "Inception", 2010, "Dream heist thriller.", "https://example.com/inception.jpg", ["Science Fiction", "Action"], 8.4),
    "tenet": MovieCandidate(3, "Tenet", 2020, "Time inversion espionage.", None, ["Action", "Science Fiction"], 7.2),
    "the batman": MovieCandidate(4, "The Batman", 2022, "A young Batman investigates corruption.", "https://example.com/the-batman.jpg", ["Crime"], 7.7),
    "batman begins": MovieCandidate(5, "Batman Begins", 2005, "Bruce Wayne becomes Batman.", None, ["Action"], 7.7),
    "parasite": MovieCandidate(6, "Parasite", 2019, "Class tension thriller.", None, ["Drama", "Thriller"], 8.5),
    "your name": MovieCandidate(7, "Your Name.", 2016, "Two teens mysteriously swap bodies.", None, ["Animation", "Romance"], 8.5),
    "avengers endgame": MovieCandidate(8, "Avengers: Endgame", 2019, "The Avengers make a final stand.", None, ["Action"], 8.3),
    "the dark knight": MovieCandidate(9, "The Dark Knight", 2008, "Batman faces the Joker.", None, ["Action", "Crime"], 8.5),
    "dune": MovieCandidate(10, "Dune", 2021, "Paul Atreides journeys to Arrakis.", None, ["Science Fiction"], 7.8),
    "avatar": MovieCandidate(11, "Avatar", 2009, "A marine enters the world of Pandora.", None, ["Science Fiction"], 7.6),
}


async def fake_stream_response(instructions: str, user_input: str):
    yield "OK: "
    yield user_input[:80]


async def fake_resolve_movie(query: str):
    normalized = query.lower().replace("(", "").replace(")", "").replace("2022", "").strip()
    normalized = " ".join(normalized.split())
    if normalized == "batman":
        return "ambiguous", None, [MOVIES["the batman"], MOVIES["batman begins"]]
    movie = MOVIES.get(normalized)
    if movie:
        return "ok", movie, [movie]
    return "unknown", None, []


@pytest.fixture(autouse=True)
def patch_services(monkeypatch):
    monkeypatch.setattr(main, "stream_response", fake_stream_response)
    monkeypatch.setattr(main, "resolve_movie", fake_resolve_movie)


def stream_text(response):
    return response.text


def test_health_json():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.parametrize("path,payload", [
    ("/chat", {"prompt": "Tell me about Interstellar", "history": []}),
    ("/recommend", {"mood": "happy", "genre": "Sci-Fi", "language": "English", "runtime": "under 2 hours", "actor": "Tom Cruise"}),
    ("/review", {"movie": "Interstellar"}),
    ("/explain", {"movie": "Tenet", "mode": "full"}),
    ("/compare", {"movie_a": "Inception", "movie_b": "The Dark Knight"}),
    ("/watchlist", {"favorite_movies": "Interstellar, Inception", "favorite_actor": "Christopher Nolan", "favorite_genre": "Sci-Fi"}),
])
def test_streaming_endpoints_return_text(path, payload):
    response = client.post(path, json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    assert stream_text(response)


@pytest.mark.parametrize("movie", [
    "Interstellar",
    "Inception",
    "Tenet",
    "The Batman (2022)",
    "Batman Begins",
    "Parasite",
    "Your Name",
    "Avengers Endgame",
    "The Dark Knight",
    "Dune",
    "Avatar",
])
def test_known_movie_titles_resolve_for_review(movie):
    response = client.post("/review", json={"movie": movie})
    assert response.status_code == 200
    assert UNKNOWN_MOVIE_MESSAGE not in stream_text(response)


def test_ambiguous_title_asks_for_clarification():
    response = client.post("/review", json={"movie": "Batman"})
    assert response.status_code == 200
    assert "Which movie did you mean?" in stream_text(response)


def test_unknown_title_returns_standard_message():
    response = client.post("/review", json={"movie": "zzzz not a movie"})
    assert response.status_code == 200
    assert stream_text(response) == UNKNOWN_MOVIE_MESSAGE


def test_validation_error_returns_json():
    response = client.post("/review", json={"movie": ""})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_poster_returns_json(monkeypatch):
    async def fake_poster_for_title(title: str):
        return {"poster_url": "https://example.com/poster.jpg", "status": "ok"}

    monkeypatch.setattr(main, "poster_for_title", fake_poster_for_title)
    response = client.get("/poster?title=Interstellar")
    assert response.status_code == 200
    assert response.json()["poster_url"].endswith("poster.jpg")
