import bcrypt
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.section import Section
from app.models.course import Course
from app.models.student import Student
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.section import SectionCreate, SectionUpdate
from app.schemas.course import CourseCreate, CourseUpdate
from fastapi import HTTPException

# --- Users ---
def create_user(db: Session, data: UserCreate) -> User:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(name=data.name, email=data.email, hashed_password=hashed, role=data.role, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    # If student role, create Student record
    if data.role == UserRole.student:
        pass  # Student record created separately via /admin/students
    return user

def list_users(db: Session, role: str = None):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.all()

def update_user(db: Session, user_id: int, data: UserUpdate) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(user, field, val)
    db.commit()
    db.refresh(user)
    return user

def deactivate_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()

# --- Sections ---
def create_section(db: Session, data: SectionCreate) -> Section:
    section = Section(**data.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section

def list_sections(db: Session):
    return db.query(Section).all()

def update_section(db: Session, section_id: int, data: SectionUpdate) -> Section:
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(section, field, val)
    db.commit()
    db.refresh(section)
    return section

# --- Courses ---
def create_course(db: Session, data: CourseCreate) -> Course:
    if db.query(Course).filter(Course.code == data.code).first():
        raise HTTPException(status_code=400, detail="Course code already exists")
    course = Course(**data.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

def list_courses(db: Session):
    return db.query(Course).all()

def update_course(db: Session, course_id: int, data: CourseUpdate) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(course, field, val)
    db.commit()
    db.refresh(course)
    return course

# --- Students ---
def create_student(db: Session, roll_no: str, user_id: int, section_id: int) -> Student:
    if db.query(Student).filter(Student.roll_no == roll_no).first():
        raise HTTPException(status_code=400, detail="Roll number already exists")
    student = Student(roll_no=roll_no, user_id=user_id, section_id=section_id)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

def list_students(db: Session):
    return db.query(Student).all()
