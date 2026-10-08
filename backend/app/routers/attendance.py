from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user, require_admin_or_faculty, require_admin
from app.models.user import User, UserRole
from app.models.student import Student
from app.schemas.attendance import AttendanceMarkRequest, AttendanceRecord, AttendanceSummary
from app.services import attendance_service
from fastapi import HTTPException

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/mark")
def mark_attendance(
    payload: AttendanceMarkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_faculty),
):
    return attendance_service.mark_attendance(db, payload, current_user.id)


@router.get("", response_model=List[AttendanceRecord])
def get_records(
    course_id: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Students can only see their own records
    if current_user.role == UserRole.student:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        student_id = student.id  # force filter to own records
    return attendance_service.get_attendance_records(db, course_id, student_id, date_from, date_to, status)


@router.get("/summary/{student_id}", response_model=AttendanceSummary)
def get_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Students can only see their own summary
    if current_user.role == UserRole.student:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or student.id != student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    return attendance_service.get_student_summary(db, student_id)


@router.get("/defaulters")
def get_defaulters(
    threshold: float = Query(75.0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin_or_faculty),
):
    return attendance_service.get_defaulters(db, threshold)
