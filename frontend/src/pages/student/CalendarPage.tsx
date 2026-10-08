import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAttendanceRecords } from '../../api/attendance';
import { getStudents } from '../../api/admin';
import type { AttendanceRecord, AttendanceStatus } from '../../types/attendance';

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-400 text-white',
  absent: 'bg-red-400 text-white',
  late: 'bg-yellow-400 text-white',
  excused: 'bg-blue-400 text-white',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    if (!user) return;
    getStudents()
      .then(all => {
        const mine = all.find(s => s.user_id === user.id);
        if (!mine) return [];
        return getAttendanceRecords({ student_id: mine.id });
      })
      .then(r => setRecords(Array.isArray(r) ? r : []))
      .finally(() => setLoading(false));
  }, [user]);

  const byDate: Record<string, AttendanceStatus[]> = {};
  records.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r.status);
  });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function getDayStatus(day: number): AttendanceStatus | null {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const statuses = byDate[key];
    if (!statuses || statuses.length === 0) return null;
    // If any absent, show absent; else show most frequent status
    if (statuses.includes('absent')) return 'absent';
    if (statuses.includes('late')) return 'late';
    if (statuses.includes('excused')) return 'excused';
    return 'present';
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Attendance Calendar</h1>

      {/* Legend */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(s => (
          <span key={s} className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[s]}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">No class</span>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-3 py-1 rounded border hover:bg-gray-50 text-sm">‹ Prev</button>
          <h2 className="font-semibold text-gray-800">{monthName} {year}</h2>
          <button onClick={nextMonth} className="px-3 py-1 rounded border hover:bg-gray-50 text-sm">Next ›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const status = getDayStatus(day);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center rounded text-sm font-medium
                  ${isToday ? 'ring-2 ring-blue-400' : ''}
                  ${status ? STATUS_COLORS[status] : 'bg-gray-50 text-gray-400'}
                `}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
