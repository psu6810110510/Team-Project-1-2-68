import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Home';
import './App.css';
import ForgotPassword from './components/ForgotPassword';
import StudentProfile from './components/StudentProfile';
import TeacherDashboard from './pages/TeacherDashboard';
import Courses from './components/Courses';
import ExamManagement from './pages/ExamManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/exam-management/:courseId" element={<ExamManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
