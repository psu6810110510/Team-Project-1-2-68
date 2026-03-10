import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Home';
import './App.css';
import ForgotPassword from './components/ForgotPassword';
import StudentProfile from './components/StudentProfile';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Courses from './components/Courses';
import ExamManagement from './pages/ExamManagement';

// --- Import ของฝั่ง biw ---
import CourseLearning from './pages/CourseLearning';

// --- Import ของฝั่ง main ---
import TeacherProfile from './components/TeacherProfile';
import Cart from './components/Cart';
import './styles/TeacherProfile.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* เส้นทางพื้นฐานที่มีเหมือนกันทั้งสองฝั่ง */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/exam-management/:courseId" element={<ExamManagement />} />
          
          {/* เส้นทางที่เพิ่มมาจากฝั่ง biw */}
          <Route path="/learning/:courseId" element={<CourseLearning />} />
          
          {/* เส้นทางที่เพิ่มมาจากฝั่ง main */}
          <Route path="/teacher-profile" element={<TeacherProfile />} />
          <Route path="/instructors" element={<TeacherProfile />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;