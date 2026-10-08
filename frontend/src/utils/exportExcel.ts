import * as XLSX from 'xlsx';

export interface ExportRow {
  rollNo: string;
  name: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export function exportAttendanceExcel(courseTitle: string, rows: ExportRow[]) {
  const wsData = [
    ['Roll No', 'Name', 'Present', 'Absent', 'Late', 'Excused', 'Attendance %'],
    ...rows.map(r => [r.rollNo, r.name, r.present, r.absent, r.late, r.excused, `${r.percentage.toFixed(1)}%`]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 24 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `attendance_${courseTitle.replace(/\s+/g, '_')}.xlsx`);
}
