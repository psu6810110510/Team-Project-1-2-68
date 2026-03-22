import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    const targetBlock = `) : (
                      <span className="info-value" style={{ color: '#334155', fontStyle: 'italic', marginTop: '10px', lineHeight: '1.6' }}>
                        {teacherData.description || 'ยังไม่มีคำอธิบายตัวเองเพิ่มเข้ามา'}
                      </span>
                    )}`;

    const replacement = `) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flex: 1, width: '100%' }}>
                        <span className="info-value" style={{ color: '#334155', fontStyle: 'italic', marginTop: '10px', lineHeight: '1.6', flex: 1 }}>
                          {teacherData.description || 'ยังไม่มีคำอธิบายตัวเองเพิ่มเข้ามา'}
                        </span>
                        <button
                          className="edit-btn"
                          onClick={() => setIsEditingProfile(true)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '10px 0 0 10px' }}
                        >
                          <Edit3 size={18} />
                        </button>
                      </div>
                    )}`;

    if (content.includes(targetBlock)) {
        content = content.replace(targetBlock, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Added inline edit button for description');
    } else {
        console.log('⚠️ Target block not found in TeacherDashboard.tsx');
    }
} catch (err) {
    console.error('❌ Error fixing TeacherDashboard.tsx:', err);
}
