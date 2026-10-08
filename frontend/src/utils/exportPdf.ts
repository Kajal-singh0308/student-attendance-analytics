import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportRow {
  rollNo: string;
  name: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export function exportAttendancePDF(courseTitle: string, sectionName: string, rows: ExportRow[]) {
  const doc = new jsPDF();
  const exportDate = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(16);
  doc.text('Attendance Report', 14, 18);
  doc.setFontSize(11);
  doc.text(`Course: ${courseTitle}`, 14, 28);
  doc.text(`Section: ${sectionName}`, 14, 35);
  doc.text(`Exported: ${exportDate}`, 14, 42);

  // Table
  autoTable(doc, {
    startY: 50,
    head: [['Roll No', 'Name', 'Present', 'Absent', 'Late', 'Excused', 'Attendance %']],
    body: rows.map(r => [
      r.rollNo,
      r.name,
      r.present,
      r.absent,
      r.late,
      r.excused,
      `${r.percentage.toFixed(1)}%`,
    ]),
    didParseCell(data) {
      if (data.section === 'body') {
        const pct = rows[data.row.index]?.percentage ?? 100;
        if (pct < 75) {
          data.cell.styles.fillColor = [255, 220, 220];
          data.cell.styles.textColor = [180, 0, 0];
        }
      }
    },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 212], textColor: 255 },
  });

  doc.save(`attendance_${courseTitle.replace(/\s+/g, '_')}.pdf`);
}
