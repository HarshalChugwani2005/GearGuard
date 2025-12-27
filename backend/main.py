import asyncio
import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure backend src is on path for uvicorn entry
sys.path.insert(0, str(Path(__file__).parent / "src"))
sys.path.insert(0, str(Path(__file__).parent))

from backend.src.api.endpoints import router
from backend.src.api.simulator import run_simulator
from backend.src.api.auth import auth_router

load_dotenv()

app = FastAPI(title="GearGuard API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")

stop_event = asyncio.Event()
sim_task: asyncio.Task | None = None


@app.on_event("startup")
async def startup():
    global sim_task
    # Start simulator if enabled via env
    sim_task = asyncio.create_task(run_simulator(stop_event))


@app.on_event("shutdown")
async def shutdown():
    stop_event.set()
    if sim_task:
        await sim_task


@app.get("/", tags=["root"])
def root():
    return {"message": "GearGuard Backend is Live"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
