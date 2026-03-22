import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/AdminDashboard.tsx';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    // 1. Inject handleDeleteUser method inside AdminDashboard
    // Find a nice place, e.g., after `refreshCourses` definition ending around line 88+
    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const refreshCourses = async') || lines[i].includes('const loadPayments = async')) {
             insertIndex = i;
             break;
        }
    }

    const handlerCode = `
  const handleDeleteUser = async (id: string, role: 'TEACHER' | 'STUDENT') => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      await userAPI.deleteUser(id);
      alert('ลบผู้ใช้สำเร็จ!');
      if (role === 'TEACHER') {
        setTeachers(prev => prev.filter(u => u.id !== id));
      } else {
        setStudents(prev => prev.filter(u => u.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };
`;

    if (insertIndex !== -1) {
        // Insert after the first few blank lines following search to avoid breaking refreshCourses
        lines.splice(insertIndex, 0, handlerCode);
        console.log('✅ Injected handleDeleteUser state handler');
    }

    // 2. Insert Delete triggers in DOM
    for (let i = 0; i < lines.length; i++) {
        // Teacher List Header (around 820)
        if (lines[i].includes('<th style={{ padding: \'12px 0\', fontWeight: \'500\' }}>วันที่สมัคร</th>') && i < 1000) {
            lines.splice(i + 1, 0, `                       <th style={{ padding: '12px 0', fontWeight: '500', textAlign: 'center' }}>จัดการ</th>`);
            console.log(`✅ Appended Teacher Table header at line ${i + 1}`);
        }

        // Teacher List Body (around 832)
        if (lines[i].includes('{new Date(t.created_at).toLocaleDateString') && i < 1000) {
            lines.splice(i + 1, 0, `                        <td style={{ padding: '12px 0', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteUser(t.id, 'TEACHER')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>ลบ</button>
                        </td>`);
            console.log(`✅ Appended Teacher Delete button cell at line ${i + 1}`);
        }

        // Student List Header (around 854)
        if (lines[i].includes('<th style={{ padding: \'12px 0\', fontWeight: \'500\' }}>วันที่สมัคร</th>') && i > 1000) {
            lines.splice(i + 1, 0, `                       <th style={{ padding: '12px 0', fontWeight: '500', textAlign: 'center' }}>จัดการ</th>`);
            console.log(`✅ Appended Student Table header at line ${i + 1}`);
        }

        // Student List Body (around 866)
        if (lines[i].includes('{new Date(s.created_at).toLocaleDateString')) {
            lines.splice(i + 1, 0, `                        <td style={{ padding: '12px 0', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteUser(s.id, 'STUDENT')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>ลบ</button>
                        </td>`);
            console.log(`✅ Appended Student Delete button cell at line ${i + 1}`);
        }
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('✅ AdminDashboard.tsx Splicing Completed!');
} catch (err) {
    console.error('❌ Error executing splice script:', err);
}
