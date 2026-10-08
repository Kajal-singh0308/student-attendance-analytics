import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCourses } from '../../api/admin';
import type { Course } from '../../api/admin';

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(all => setCourses(all.filter(c => c.faculty_id === user?.id)))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Faculty Dashboard</h1>
      <p className="text-gray-500 mb-4">Welcome, {user?.name}. You have {courses.length} course(s) assigned.</p>
      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">No courses assigned yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
              <p className="text-xs text-gray-400 font-mono mb-1">{course.code}</p>
              <h3 className="font-semibold text-gray-800">{course.name}</h3>
              <p className="text-sm text-gray-500 mt-2">{course.total_classes} classes conducted</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
