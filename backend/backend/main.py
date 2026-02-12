from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    print("Starting up...")
    yield
    print("Shutting down...")


app = FastAPI(
    title="Thing Control Panel Backend",
    description="REST API service for Thing Control Panel providing platform functionalities based on user data",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/healthz", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
