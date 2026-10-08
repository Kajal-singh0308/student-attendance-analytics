import { useEffect, useState } from 'react';
import { getSections, createSection } from '../../api/admin';
import type { Section } from '../../api/admin';

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', semester: '', year: new Date().getFullYear() });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => getSections().then(setSections).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createSection(form);
      setShowModal(false);
      setForm({ name: '', semester: '', year: new Date().getFullYear() });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Error');
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Sections</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">+ Add Section</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Semester</th>
              <th className="px-4 py-3 text-left">Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sections.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No sections yet</td></tr>}
            {sections.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.semester}</td>
                <td className="px-4 py-3">{s.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Section</h2>
            {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Section Name (e.g. CS-A)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required placeholder="Semester (e.g. Fall, Spring)" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              <input required type="number" placeholder="Year" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className="w-full border rounded px-3 py-2 text-sm" />
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
