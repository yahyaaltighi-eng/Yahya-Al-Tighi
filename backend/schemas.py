from pydantic import BaseModel
from typing import List, Dict, Optional

class Subject(BaseModel):
    name: str
    hours: int

class SchoolClass(BaseModel):
    id: str
    name: str
    rooms: int
    periodsPerDay: int
    subjects: List[Subject]

class Teacher(BaseModel):
    id: str
    name: str
    subject: str
    maxLoad: int
    maxPerDay: int
    minPerDay: int
    freeDays: List[str]
    blockedSlots: Dict[str, List[int]] = {}

class Settings(BaseModel):
    workDays: List[str]

class GenerationRequest(BaseModel):
    settings: Settings
    classes: List[SchoolClass]
    teachers: List[Teacher]

class TimetableEntry(BaseModel):
    day: str
    period: int
    subject: str
    teacher: str
    class_id: str

class GenerationResponse(BaseModel):
    status: str
    top_solutions: List[Dict]
    diagnostics: Optional[Dict] = None
