from satapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"status": "recovered"}


@app.get("/health")
def health():
    return {"oka": True}
