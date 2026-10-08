import client from './client';
import type { Student } from './admin';

export const getMyStudentProfile = () =>
  client.get<Student[]>('/admin/students').then(r => {
    // This returns all students; caller filters by user_id
    return r.data;
  });
