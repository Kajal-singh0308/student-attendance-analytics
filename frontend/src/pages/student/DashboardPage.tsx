import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentSummary } from '../../api/attendance';
import { getStudents } from '../../api/admin';
import type { AttendanceSummary } from '../../types/attendance';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar,
} from 'recharts';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getStudents()
      .then(all => {
        const mine = all.find(s => s.user_id === user.id);
        if (!mine) { setError('Student profile not found.'); setLoading(false); return; }
        return getStudentSummary(mine.id);
      })
      .then(s => { if (s) setSummary(s); })
      .catch(() => setError('Failed to load attendance data.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!summary) return null;

  const defaulterCourses = summary.courses.filter(c => c.percentage < 75);

  const barData = summary.courses.map(c => ({
    name: c.course_code,
    percentage: c.percentage,
  }));

  const gaugeData = [{ name: 'Attendance', value: summary.overall_percentage, fill: summary.overall_percentage >= 75 ? '#22c55e' : '#ef4444' }];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Attendance</h1>

      {/* Alert banner */}
      {defaulterCourses.length > 0 && (
        <div className="mb-5 p-4 bg-red-50 border border-red-300 rounded-lg">
          <p className="font-semibold text-red-700 mb-1">⚠ Low Attendance Warning</p>
          {defaulterCourses.map(c => (
            <p key={c.course_id} className="text-sm text-red-600">
              {c.course_name} ({c.course_code}): <strong>{c.percentage.toFixed(1)}%</strong> — below 75% threshold
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overall gauge */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-sm font-medium text-gray-600 mb-2">Overall Attendance</h2>
          <div className="flex items-center justify-center">
            <RadialBarChart width={200} height={200} cx={100} cy={100} innerRadius={60} outerRadius={90} data={gaugeData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={8} />
            </RadialBarChart>
          </div>
          <p className={`text-center text-3xl font-bold mt-2 ${summary.overall_percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.overall_percentage.toFixed(1)}%
          </p>
        </div>

        {/* Subject breakdown chart */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-sm font-medium text-gray-600 mb-4">Subject-wise Attendance</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
              <ReferenceLine y={75} stroke="orange" strokeDasharray="4 4" />
              <Bar dataKey="percentage">
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.percentage < 75 ? '#ef4444' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Present</th>
              <th className="px-4 py-3 text-left">Absent</th>
              <th className="px-4 py-3 text-left">Late</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Attendance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summary.courses.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No attendance records yet</td></tr>
            )}
            {summary.courses.map(c => (
              <tr key={c.course_id} className={c.percentage < 75 ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-400">{c.course_code}</span>
                  <span className="ml-2">{c.course_name}</span>
                </td>
                <td className="px-4 py-3 text-green-600">{c.present}</td>
                <td className="px-4 py-3 text-red-600">{c.absent}</td>
                <td className="px-4 py-3 text-yellow-600">{c.late}</td>
                <td className="px-4 py-3 text-gray-500">{c.total_classes}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${c.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                    {c.percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
