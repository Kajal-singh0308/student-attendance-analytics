import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCourses, getStudents } from '../../api/admin';
import { markAttendance } from '../../api/attendance';
import type { Course, Student } from '../../api/admin';
import type { AttendanceStatus } from '../../types/attendance';

const STATUS_CYCLE: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-500 text-white',
  absent: 'bg-red-500 text-white',
  late: 'bg-yellow-500 text-white',
  excused: 'bg-blue-500 text-white',
};
const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'P', absent: 'A', late: 'L', excused: 'E',
};

export default function MarkAttendancePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCourses().then(all => setCourses(all.filter(c => c.faculty_id === user?.id)));
    getStudents().then(setStudents);
  }, [user]);

  const courseStudents = students.filter(s => {
    const course = courses.find(c => c.id === selectedCourse);
    return course && s.section_id === course.section_id;
  });

  useEffect(() => {
    const initial: Record<number, AttendanceStatus> = {};
    courseStudents.forEach(s => { initial[s.id] = 'present'; });
    setStatuses(initial);
  }, [selectedCourse, students]);

  function cycleStatus(studentId: number) {
    const current = statuses[studentId] ?? 'present';
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setStatuses(prev => ({ ...prev, [studentId]: next }));
  }

  async function handleSubmit() {
    if (!selectedCourse) return;
    setSubmitting(true);
    setMessage('');
    try {
      const records = courseStudents.map(s => ({ student_id: s.id, status: statuses[s.id] ?? 'present' }));
      await markAttendance({ course_id: selectedCourse, date, records });
      setMessage('Attendance marked successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail ?? 'Error marking attendance');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h1>
      <div className="bg-white rounded-lg shadow p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm w-56"
          >
            <option value={0}>Select course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {selectedCourse > 0 && (
        <>
          {courseStudents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">No students in this course's section.</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Roll No</th>
                    <th className="px-4 py-3 text-left">Student ID</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courseStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono">{s.roll_no}</td>
                      <td className="px-4 py-3 text-gray-500">{s.user_id}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => cycleStatus(s.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[statuses[s.id] ?? 'present']}`}
                        >
                          {STATUS_LABELS[statuses[s.id] ?? 'present']}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {message && (
            <div className={`mb-3 p-3 rounded text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || courseStudents.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </>
      )}
    </div>
  );
}
