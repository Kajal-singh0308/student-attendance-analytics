import client from './client';
import type { User } from '../types';

export interface Section {
  id: number;
  name: string;
  semester: string;
  year: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  faculty_id: number;
  section_id: number;
  total_classes: number;
}

export interface Student {
  id: number;
  roll_no: string;
  user_id: number;
  section_id: number;
}

// Users
export const getUsers = (role?: string) =>
  client.get<User[]>('/admin/users', { params: role ? { role } : {} }).then(r => r.data);
export const createUser = (data: { name: string; email: string; password: string; role: string }) =>
  client.post<User>('/admin/users', data).then(r => r.data);
export const updateUser = (id: number, data: Partial<{ name: string; email: string; is_active: boolean }>) =>
  client.put<User>(`/admin/users/${id}`, data).then(r => r.data);
export const deactivateUser = (id: number) =>
  client.delete(`/admin/users/${id}`).then(r => r.data);

// Sections
export const getSections = () =>
  client.get<Section[]>('/admin/sections').then(r => r.data);
export const createSection = (data: { name: string; semester: string; year: number }) =>
  client.post<Section>('/admin/sections', data).then(r => r.data);
export const updateSection = (id: number, data: Partial<{ name: string; semester: string; year: number }>) =>
  client.put<Section>(`/admin/sections/${id}`, data).then(r => r.data);

// Courses
export const getCourses = () =>
  client.get<Course[]>('/admin/courses').then(r => r.data);
export const createCourse = (data: { code: string; name: string; faculty_id: number; section_id: number }) =>
  client.post<Course>('/admin/courses', data).then(r => r.data);
export const updateCourse = (id: number, data: Partial<{ code: string; name: string; faculty_id: number; section_id: number }>) =>
  client.put<Course>(`/admin/courses/${id}`, data).then(r => r.data);

// Students
export const getStudents = () =>
  client.get<Student[]>('/admin/students').then(r => r.data);
export const createStudent = (data: { roll_no: string; user_id: number; section_id: number }) =>
  client.post<Student>('/admin/students', data).then(r => r.data);
