from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import require_admin
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.section import SectionCreate, SectionUpdate, SectionResponse
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.student import StudentCreate, StudentResponse
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])

# Users
@router.post("/users", response_model=UserResponse)
def create_user(data: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.create_user(db, data)

@router.get("/users", response_model=list[UserResponse])
def list_users(role: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.list_users(db, role)

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.update_user(db, user_id, data)

@router.delete("/users/{user_id}")
def deactivate_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    admin_service.deactivate_user(db, user_id)
    return {"detail": "User deactivated"}

# Sections
@router.post("/sections", response_model=SectionResponse)
def create_section(data: SectionCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.create_section(db, data)

@router.get("/sections", response_model=list[SectionResponse])
def list_sections(db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.list_sections(db)

@router.put("/sections/{section_id}", response_model=SectionResponse)
def update_section(section_id: int, data: SectionUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.update_section(db, section_id, data)

# Courses
@router.post("/courses", response_model=CourseResponse)
def create_course(data: CourseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.create_course(db, data)

@router.get("/courses", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.list_courses(db)

@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, data: CourseUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.update_course(db, course_id, data)

# Students
@router.post("/students", response_model=StudentResponse)
def create_student(data: StudentCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.create_student(db, data.roll_no, data.user_id, data.section_id)

@router.get("/students", response_model=list[StudentResponse])
def list_students(db: Session = Depends(get_db), _=Depends(require_admin)):
    return admin_service.list_students(db)
