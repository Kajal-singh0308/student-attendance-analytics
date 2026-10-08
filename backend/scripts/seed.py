import sys, os, random
from datetime import date, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import bcrypt
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.section import Section
from app.models.course import Course
from app.models.student import Student
from app.models.attendance import Attendance, AttendanceStatus

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def seed():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # Admin
        admin = User(name="Administrator", email="admin@school.com", hashed_password=hash_pw("admin123"), role=UserRole.admin, is_active=True)
        db.add(admin)
        db.flush()

        # Faculty
        faculties = []
        for i in range(1, 4):
            f = User(name=f"Faculty {i}", email=f"faculty{i}@school.com", hashed_password=hash_pw("faculty123"), role=UserRole.faculty, is_active=True)
            db.add(f)
            db.flush()
            faculties.append(f)

        # Sections
        sec_a = Section(name="CS-A", semester="Fall", year=2024)
        sec_b = Section(name="CS-B", semester="Fall", year=2024)
        db.add_all([sec_a, sec_b])
        db.flush()

        # Courses (6 total)
        courses_data = [
            ("CS101", "Introduction to Programming", faculties[0].id, sec_a.id),
            ("CS102", "Data Structures", faculties[1].id, sec_a.id),
            ("CS103", "Database Systems", faculties[2].id, sec_a.id),
            ("CS201", "Algorithms", faculties[0].id, sec_b.id),
            ("CS202", "Operating Systems", faculties[1].id, sec_b.id),
            ("CS203", "Computer Networks", faculties[2].id, sec_b.id),
        ]
        courses = []
        for code, name, fid, sid in courses_data:
            c = Course(code=code, name=name, faculty_id=fid, section_id=sid, total_classes=0)
            db.add(c)
            db.flush()
            courses.append(c)

        # Students (30 total, 15 per section)
        students = []
        for i in range(1, 31):
            section = sec_a if i <= 15 else sec_b
            u = User(
                name=f"Student {i}",
                email=f"student{i}@school.com",
                hashed_password=hash_pw("student123"),
                role=UserRole.student,
                is_active=True
            )
            db.add(u)
            db.flush()
            s = Student(roll_no=f"CS2024{i:03d}", user_id=u.id, section_id=section.id)
            db.add(s)
            db.flush()
            students.append(s)

        # 90 days of attendance
        today = date.today()
        status_list = list(AttendanceStatus)

        # Track which dates have been used per course to manage total_classes
        course_dates: dict[int, set] = {c.id: set() for c in courses}

        for course in courses:
            section_students = [s for s in students if s.section_id == course.section_id]
            days_conducted = 0

            for day_offset in range(90, 0, -1):
                day = today - timedelta(days=day_offset)
                if day.weekday() >= 5:  # skip weekends
                    continue
                # 80% chance of a class being held on a given weekday
                if random.random() > 0.8:
                    continue

                days_conducted += 1
                course_dates[course.id].add(day)

                for student in section_students:
                    # Make students 1 and 16 (first in each section) be defaulters
                    is_defaulter = student.roll_no in ("CS2024001", "CS2024016")
                    if is_defaulter:
                        # 50% absent, 10% late, 40% present to ensure < 75%
                        status = random.choices(
                            [AttendanceStatus.absent, AttendanceStatus.late, AttendanceStatus.present],
                            weights=[50, 10, 40]
                        )[0]
                    else:
                        # Normal: 80% present, 10% absent, 5% late, 5% excused
                        status = random.choices(
                            status_list,
                            weights=[80, 10, 5, 5]
                        )[0]
                    record = Attendance(
                        student_id=student.id,
                        course_id=course.id,
                        date=day,
                        status=status,
                        marked_by=course.faculty_id,
                    )
                    db.add(record)

            course.total_classes = days_conducted

        db.commit()
        print("[OK] Seed complete!")
        print("  Admin:   admin@school.com / admin123")
        print("  Faculty: faculty1@school.com / faculty123 (also faculty2, faculty3)")
        print("  Student: student1@school.com / student123 (also student2..student30)")
        print("  Defaulters: CS2024001 (student1), CS2024016 (student16)")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
