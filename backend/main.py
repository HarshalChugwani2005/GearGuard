import asyncio
import os
from fastapi import FastAPI
from dotenv import load_dotenv
from src.api.endpoints import router
from src.api.simulator import run_simulator

load_dotenv()

app = FastAPI(title="GearGuard API", version="1.0.0")
app.include_router(router, prefix="/api")

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
