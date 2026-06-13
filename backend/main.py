from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import GenerationRequest, GenerationResponse
from solver import generate_timetable_pipeline

app = FastAPI(title="Timetable Scheduling API V3.1.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.post("/api/generate", response_model=GenerationResponse)
def generate_timetable(req: GenerationRequest):
    return generate_timetable_pipeline(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
