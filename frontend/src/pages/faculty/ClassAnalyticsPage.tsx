import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCourses, getStudents, getUsers } from '../../api/admin';
import { getStudentSummary } from '../../api/attendance';
import type { Course, Student } from '../../api/admin';
import type { User } from '../../types';
import type { CourseSummary } from '../../types/attendance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { exportAttendancePDF } from '../../utils/exportPdf';
import { exportAttendanceExcel } from '../../utils/exportExcel';
import type { ExportRow } from '../../utils/exportPdf';

interface StudentRow {
  student: Student;
  user: User | undefined;
  summary: CourseSummary | undefined;
}

export default function ClassAnalyticsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCourses().then(all => setCourses(all.filter(c => c.faculty_id === user?.id)));
  }, [user]);

  useEffect(() => {
    if (!selectedCourse) return;
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;
    setLoading(true);
    Promise.all([getStudents(), getUsers()])
      .then(async ([allStudents, allUsers]) => {
        const sectionStudents = allStudents.filter(s => s.section_id === course.section_id);
        const rowData: StudentRow[] = await Promise.all(
          sectionStudents.map(async (s) => {
            let summary: CourseSummary | undefined;
            try {
              const fullSummary = await getStudentSummary(s.id);
              summary = fullSummary.courses.find(c => c.course_id === selectedCourse);
            } catch { /* student might have no records */ }
            return { student: s, user: allUsers.find(u => u.id === s.user_id), summary };
          })
        );
        setRows(rowData);
      })
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const chartData = rows.map(r => ({
    name: r.student.roll_no,
    percentage: r.summary?.percentage ?? 0,
  }));

  function buildExportRows(): ExportRow[] {
    return rows.map(r => ({
      rollNo: r.student.roll_no,
      name: r.user?.name ?? '—',
      present: r.summary?.present ?? 0,
      absent: r.summary?.absent ?? 0,
      late: r.summary?.late ?? 0,
      excused: r.summary?.excused ?? 0,
      percentage: r.summary?.percentage ?? 0,
    }));
  }

  const selectedCourseObj = courses.find(c => c.id === selectedCourse);

  function handleExportPDF() {
    exportAttendancePDF(
      selectedCourseObj ? `${selectedCourseObj.code} - ${selectedCourseObj.name}` : 'Course',
      `Section ${selectedCourseObj?.section_id ?? ''}`,
      buildExportRows()
    );
  }

  function handleExportExcel() {
    exportAttendanceExcel(
      selectedCourseObj ? `${selectedCourseObj.code}_${selectedCourseObj.name}` : 'Course',
      buildExportRows()
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Class Analytics</h1>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm w-64"
          >
            <option value={0}>Select course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        {selectedCourse > 0 && rows.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
            >
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              Export Excel
            </button>
          </div>
        )}
      </div>

      {selectedCourse > 0 && !loading && rows.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <h2 className="text-sm font-medium text-gray-600 mb-4">Attendance % by Student</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
                <ReferenceLine y={75} stroke="orange" strokeDasharray="4 4" label={{ value: '75%', position: 'right', fontSize: 11 }} />
                <Bar dataKey="percentage">
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.percentage < 75 ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Present</th>
                  <th className="px-4 py-3 text-left">Absent</th>
                  <th className="px-4 py-3 text-left">Late</th>
                  <th className="px-4 py-3 text-left">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(r => {
                  const pct = r.summary?.percentage ?? 0;
                  const isDefaulter = pct < 75;
                  return (
                    <tr key={r.student.id} className={isDefaulter ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 font-mono">{r.student.roll_no}</td>
                      <td className="px-4 py-3">{r.user?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-green-600">{r.summary?.present ?? 0}</td>
                      <td className="px-4 py-3 text-red-600">{r.summary?.absent ?? 0}</td>
                      <td className="px-4 py-3 text-yellow-600">{r.summary?.late ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${isDefaulter ? 'text-red-600' : 'text-green-600'}`}>
                          {pct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {loading && <div className="text-gray-500">Loading analytics...</div>}
      {selectedCourse > 0 && !loading && rows.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">No students found for this course.</div>
      )}
    </div>
  );
}
