from fastapi import FastAPI
from dotenv import load_dotenv
from src.api.endpoints import router

load_dotenv()

app = FastAPI(title="GearGuard API", version="1.0.0")
app.include_router(router, prefix="/api")


@app.get("/", tags=["root"])
def root():
    return {"message": "GearGuard Backend is Live"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
