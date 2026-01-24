from contextlib import asynccontextmanager
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    # starup
    print("DEFM API stating up...")
    yield
    # shutdown
    print("DEFM API shutting down...")
