export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: number;
  student_id: number;
  course_id: number;
  date: string;
  status: AttendanceStatus;
  marked_by: number;
  created_at: string;
}

export interface StudentStatusEntry {
  student_id: number;
  status: AttendanceStatus;
}

export interface AttendanceMarkRequest {
  course_id: number;
  date: string;
  records: StudentStatusEntry[];
}

export interface CourseSummary {
  course_id: number;
  course_name: string;
  course_code: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  total_classes: number;
  percentage: number;
}

export interface AttendanceSummary {
  student_id: number;
  overall_percentage: number;
  courses: CourseSummary[];
}
