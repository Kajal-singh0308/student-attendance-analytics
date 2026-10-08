import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import StudentsPage from './pages/admin/StudentsPage';
import FacultyPage from './pages/admin/FacultyPage';
import CoursesPage from './pages/admin/CoursesPage';
import SectionsPage from './pages/admin/SectionsPage';
import FacultyLayout from './components/layout/FacultyLayout';
import FacultyDashboardPage from './pages/faculty/DashboardPage';
import MarkAttendancePage from './pages/faculty/MarkAttendancePage';
import ClassAnalyticsPage from './pages/faculty/ClassAnalyticsPage';
import StudentLayout from './components/layout/StudentLayout';
import StudentDashboardPage from './pages/student/DashboardPage';
import CalendarPage from './pages/student/CalendarPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="faculty" element={<FacultyPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="sections" element={<SectionsPage />} />
            </Route>
          </Route>

          {/* Faculty routes */}
          <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<FacultyDashboardPage />} />
              <Route path="mark" element={<MarkAttendancePage />} />
              <Route path="analytics" element={<ClassAnalyticsPage />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="calendar" element={<CalendarPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
