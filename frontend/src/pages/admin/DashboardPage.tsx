import { useEffect, useState } from 'react';
import { getUsers, getCourses } from '../../api/admin';

interface StatCardProps { label: string; value: string | number; color: string; }
function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg p-5 shadow border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUsers('student'),
      getUsers('faculty'),
      getCourses(),
    ]).then(([students, faculty, courses]) => {
      setStats({ students: students.length, faculty: faculty.length, courses: courses.length });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={stats.students} color="border-blue-500" />
        <StatCard label="Total Faculty" value={stats.faculty} color="border-green-500" />
        <StatCard label="Total Courses" value={stats.courses} color="border-purple-500" />
      </div>
    </div>
  );
}
