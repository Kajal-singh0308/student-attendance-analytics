import client from './client';
import type { AttendanceRecord, AttendanceSummary, AttendanceMarkRequest } from '../types/attendance';

export const markAttendance = (data: AttendanceMarkRequest) =>
  client.post('/attendance/mark', data).then(r => r.data);

export const getAttendanceRecords = (params: {
  course_id?: number;
  student_id?: number;
  date_from?: string;
  date_to?: string;
  status?: string;
}) => client.get<AttendanceRecord[]>('/attendance', { params }).then(r => r.data);

export const getStudentSummary = (studentId: number) =>
  client.get<AttendanceSummary>(`/attendance/summary/${studentId}`).then(r => r.data);

export const getDefaulters = (threshold = 75) =>
  client.get('/attendance/defaulters', { params: { threshold } }).then(r => r.data);
