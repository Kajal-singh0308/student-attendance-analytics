from pydantic import BaseModel
from typing import Optional

class StudentCreate(BaseModel):
    roll_no: str
    user_id: int
    section_id: int

class StudentResponse(BaseModel):
    id: int
    roll_no: str
    user_id: int
    section_id: int

    model_config = {"from_attributes": True}
