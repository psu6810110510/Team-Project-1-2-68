import fs from 'fs';

const teacherPath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';
const studentPath = 'd:/Team-Project-1-2-68/our-web/frontend/src/components/StudentProfile.tsx';

// 1. Fix TeacherDashboard.tsx
try {
    let content = fs.readFileSync(teacherPath, 'utf8');
    
    // Find target block around line 1187-1188
    const searchStr = `<img src={teacherData.image} alt="Profile" className="sidebar-avatar" style={{ objectFit: 'cover', width: '120px', height: '120px', borderRadius: '50%' }} />`;
    
    const replacementStr = `{teacherData.image ? (
                <img src={teacherData.image} alt="Profile" className="sidebar-avatar" style={{ objectFit: 'cover', width: '120px', height: '120px', borderRadius: '50%' }} />
              ) : (
                <div className="sidebar-avatar" style={{ 
                  width: '120px', height: '120px', borderRadius: '50%', 
                  background: '#f1f5f9', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', color: '#64748b', border: '4px solid #e2e8f0' 
                }}>
                  <User size={64} />
                </div>
              )}`;

    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replacementStr);
        fs.writeFileSync(teacherPath, content, 'utf8');
        console.log('✅ Fixed TeacherDashboard.tsx');
    } else {
        console.log('⚠️ Target string not found in TeacherDashboard.tsx');
    }
} catch (err) {
    console.error('❌ Error fixing TeacherDashboard.tsx:', err);
}

// 2. Fix StudentProfile.tsx
try {
    let content = fs.readFileSync(studentPath, 'utf8');
    
    const searchStr = `<img src={userData.image} alt="Profile" className="sidebar-avatar" style={{ objectFit: 'cover', cursor: 'pointer' }} onClick={() => setExpandedImage(userData.image)} />`;
    
    const replacementStr = `{userData.image ? (
                <img src={userData.image} alt="Profile" className="sidebar-avatar" style={{ objectFit: 'cover', cursor: 'pointer' }} onClick={() => setExpandedImage(userData.image)} />
              ) : (
                <div className="sidebar-avatar" style={{ 
                  background: '#f1f5f9', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', color: '#64748b', cursor: 'pointer',
                  width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #e2e8f0'
                }}>
                  <User size={48} />
                </div>
              )}`;

    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replacementStr);
        fs.writeFileSync(studentPath, content, 'utf8');
        console.log('✅ Fixed StudentProfile.tsx');
    } else {
        console.log('⚠️ Target string not found in StudentProfile.tsx');
    }
} catch (err) {
    console.error('❌ Error fixing StudentProfile.tsx:', err);
}
