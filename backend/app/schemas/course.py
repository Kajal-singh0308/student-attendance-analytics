from pydantic import BaseModel
from typing import Optional

class CourseCreate(BaseModel):
    code: str
    name: str
    faculty_id: int
    section_id: int

class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    faculty_id: Optional[int] = None
    section_id: Optional[int] = None

class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    faculty_id: int
    section_id: int
    total_classes: int

    model_config = {"from_attributes": True}
