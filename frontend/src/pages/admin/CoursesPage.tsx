import { useEffect, useState } from 'react';
import { getCourses, getSections, getUsers, createCourse } from '../../api/admin';
import type { Course, Section } from '../../api/admin';
import type { User } from '../../types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', faculty_id: 0, section_id: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([getCourses(), getSections(), getUsers('faculty')])
    .then(([c, s, f]) => { setCourses(c); setSections(s); setFaculty(f); })
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createCourse(form);
      setShowModal(false);
      setForm({ code: '', name: '', faculty_id: 0, section_id: 0 });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Error');
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">+ Add Course</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Faculty</th>
              <th className="px-4 py-3 text-left">Section</th>
              <th className="px-4 py-3 text-left">Classes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No courses yet</td></tr>}
            {courses.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{faculty.find(f => f.id === c.faculty_id)?.name ?? '—'}</td>
                <td className="px-4 py-3">{sections.find(s => s.id === c.section_id)?.name ?? '—'}</td>
                <td className="px-4 py-3">{c.total_classes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Course</h2>
            {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Course Code (e.g. CS101)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required placeholder="Course Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <select required value={form.faculty_id} onChange={e => setForm({...form, faculty_id: Number(e.target.value)})} className="w-full border rounded px-3 py-2 text-sm">
                <option value={0}>Select Faculty</option>
                {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select required value={form.section_id} onChange={e => setForm({...form, section_id: Number(e.target.value)})} className="w-full border rounded px-3 py-2 text-sm">
                <option value={0}>Select Section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name} — {s.semester} {s.year}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded text-sm">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
