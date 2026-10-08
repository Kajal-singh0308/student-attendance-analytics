from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from app.models.attendance import AttendanceStatus

class StudentStatusEntry(BaseModel):
    student_id: int
    status: AttendanceStatus

class AttendanceMarkRequest(BaseModel):
    course_id: int
    date: date
    records: List[StudentStatusEntry]

class AttendanceRecord(BaseModel):
    id: int
    student_id: int
    course_id: int
    date: date
    status: AttendanceStatus
    marked_by: int
    created_at: datetime

    model_config = {"from_attributes": True}

class CourseSummary(BaseModel):
    course_id: int
    course_name: str
    course_code: str
    present: int
    late: int
    absent: int
    excused: int
    total_classes: int
    percentage: float

class AttendanceSummary(BaseModel):
    student_id: int
    overall_percentage: float
    courses: List[CourseSummary]
