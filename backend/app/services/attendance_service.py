from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from fastapi import HTTPException

from app.models.attendance import Attendance, AttendanceStatus
from app.models.course import Course
from app.models.student import Student
from app.schemas.attendance import AttendanceMarkRequest, AttendanceSummary, CourseSummary


def mark_attendance(db: Session, payload: AttendanceMarkRequest, marked_by_id: int):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if this date already has records for this course (re-submission / upsert)
    existing_dates = db.query(Attendance.date).filter(
        Attendance.course_id == payload.course_id,
        Attendance.date == payload.date
    ).distinct().count()

    is_new_session = existing_dates == 0

    for entry in payload.records:
        existing = db.query(Attendance).filter(
            and_(
                Attendance.student_id == entry.student_id,
                Attendance.course_id == payload.course_id,
                Attendance.date == payload.date,
            )
        ).first()
        if existing:
            existing.status = entry.status
            existing.marked_by = marked_by_id
        else:
            record = Attendance(
                student_id=entry.student_id,
                course_id=payload.course_id,
                date=payload.date,
                status=entry.status,
                marked_by=marked_by_id,
            )
            db.add(record)

    # Increment total_classes only for new sessions
    if is_new_session:
        course.total_classes += 1

    db.commit()
    return {"detail": "Attendance marked successfully"}


def get_attendance_records(
    db: Session,
    course_id: Optional[int] = None,
    student_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    status: Optional[str] = None,
):
    q = db.query(Attendance)
    if course_id:
        q = q.filter(Attendance.course_id == course_id)
    if student_id:
        q = q.filter(Attendance.student_id == student_id)
    if date_from:
        q = q.filter(Attendance.date >= date_from)
    if date_to:
        q = q.filter(Attendance.date <= date_to)
    if status:
        q = q.filter(Attendance.status == status)
    return q.order_by(Attendance.date.desc()).all()


def get_student_summary(db: Session, student_id: int) -> AttendanceSummary:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get all courses for the student's section
    courses = db.query(Course).filter(Course.section_id == student.section_id).all()

    course_summaries = []
    total_present = 0
    total_late = 0
    total_classes_all = 0

    for course in courses:
        records = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.course_id == course.id
        ).all()

        present = sum(1 for r in records if r.status == AttendanceStatus.present)
        late = sum(1 for r in records if r.status == AttendanceStatus.late)
        absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
        excused = sum(1 for r in records if r.status == AttendanceStatus.excused)

        total_classes = course.total_classes or 1  # avoid division by zero
        percentage = round((present + late) / total_classes * 100, 2)

        course_summaries.append(CourseSummary(
            course_id=course.id,
            course_name=course.name,
            course_code=course.code,
            present=present,
            late=late,
            absent=absent,
            excused=excused,
            total_classes=course.total_classes,
            percentage=percentage,
        ))

        total_present += present
        total_late += late
        total_classes_all += course.total_classes

    overall_pct = round((total_present + total_late) / max(total_classes_all, 1) * 100, 2)

    return AttendanceSummary(
        student_id=student_id,
        overall_percentage=overall_pct,
        courses=course_summaries,
    )


def get_defaulters(db: Session, threshold: float = 75.0):
    students = db.query(Student).all()
    defaulters = []
    for student in students:
        summary = get_student_summary(db, student.id)
        if summary.overall_percentage < threshold:
            defaulters.append({
                "student_id": student.id,
                "roll_no": student.roll_no,
                "overall_percentage": summary.overall_percentage,
                "low_courses": [
                    c for c in summary.courses if c.percentage < threshold
                ],
            })
    return defaulters
