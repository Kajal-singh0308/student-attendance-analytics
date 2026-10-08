import { useEffect, useState } from 'react';
import { getUsers, createUser, deactivateUser } from '../../api/admin';
import type { User } from '../../types';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'faculty123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => getUsers('faculty').then(setFaculty).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createUser({ ...form, role: 'faculty' });
      setShowModal(false);
      setForm({ name: '', email: '', password: 'faculty123' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Error');
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Faculty</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">+ Add Faculty</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {faculty.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No faculty yet</td></tr>}
            {faculty.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{f.name}</td>
                <td className="px-4 py-3 text-gray-500">{f.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {f.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {f.is_active && <button onClick={() => deactivateUser(f.id).then(load)} className="text-red-500 hover:underline text-xs">Deactivate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Faculty</h2>
            {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
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
