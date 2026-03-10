import React, { useState, useEffect } from 'react';
import '../styles/TeacherProfile.css';
import Footer from './Footer';

interface Teacher {
  id: number;
  name: string;
  bachelorDegree: string;
  masterDegree?: string;
  doctorateDegree?: string;
  expertise: string;
  profileImage?: string;
}

const TeacherProfile: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetch('/api/teachers')
      .then((response) => response.json())
      .then((data) => setTeachers(data))
      .catch((error) => console.error('Error fetching teachers:', error));
  }, []);

  return (
    <div className="page-container">
      <h1>Teacher Profiles</h1>
      <div className="teacher-list">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="teacher-card">
            {teacher.profileImage && (
              <img src={teacher.profileImage} alt={`${teacher.name}'s profile`} />
            )}
            <h2>{teacher.name}</h2>
            <p><strong>Bachelor's Degree:</strong> {teacher.bachelorDegree}</p>
            {teacher.masterDegree && (
              <p><strong>Master's Degree:</strong> {teacher.masterDegree}</p>
            )}
            {teacher.doctorateDegree && (
              <p><strong>Doctorate Degree:</strong> {teacher.doctorateDegree}</p>
            )}
            <p><strong>Expertise:</strong> {teacher.expertise}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default TeacherProfile;