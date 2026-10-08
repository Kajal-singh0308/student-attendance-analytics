from pydantic import BaseModel
from typing import Optional

class SectionCreate(BaseModel):
    name: str
    semester: str
    year: int

class SectionUpdate(BaseModel):
    name: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[int] = None

class SectionResponse(BaseModel):
    id: int
    name: str
    semester: str
    year: int

    model_config = {"from_attributes": True}
