import { useEffect, useState } from 'react';
import { getStudents, getUsers, getSections, createUser, createStudent, deactivateUser } from '../../api/admin';
import type { Student, Section } from '../../api/admin';
import type { User } from '../../types';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'student123', roll_no: '', section_id: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([getStudents(), getUsers(), getSections()]).then(([s, u, sec]) => {
    setStudents(s); setUsers(u); setSections(sec);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const getUserName = (user_id: number) => users.find(u => u.id === user_id)?.name ?? '—';

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const newUser = await createUser({ name: form.name, email: form.email, password: form.password, role: 'student' });
      await createStudent({ roll_no: form.roll_no, user_id: newUser.id, section_id: form.section_id });
      setShowModal(false);
      setForm({ name: '', email: '', password: 'student123', roll_no: '', section_id: 0 });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Error creating student');
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Students</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">+ Add Student</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Roll No</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Section</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No students yet</td></tr>
            )}
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{s.roll_no}</td>
                <td className="px-4 py-3">{getUserName(s.user_id)}</td>
                <td className="px-4 py-3">{sections.find(sec => sec.id === s.section_id)?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deactivateUser(s.user_id).then(load)} className="text-red-500 hover:underline text-xs">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Student</h2>
            {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required placeholder="Roll Number" value={form.roll_no} onChange={e => setForm({...form, roll_no: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <select required value={form.section_id} onChange={e => setForm({...form, section_id: Number(e.target.value)})} className="w-full border rounded px-3 py-2 text-sm">
                <option value={0}>Select Section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name} — {s.semester} {s.year}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
