import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    let targetIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<span className="info-value"') && lines[i].includes('fontStyle: \'italic\'') && lines[i+1]?.includes('teacherData.description')) {
            targetIndex = i;
            break;
        }
    }

    if (targetIndex !== -1) {
        console.log(`Found target at line ${targetIndex + 1}`);
        
        // lines[targetIndex - 1] should be ") : ("
        // lines[targetIndex] is "<span ..."
        // lines[targetIndex + 1] is "{teacherData.description ...}"
        // lines[targetIndex + 2] is "</span>"

        const replacement = [
            `                    ) : (`,
            `                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flex: 1, width: '100%' }}>`,
            `                        <span className="info-value" style={{ color: '#334155', fontStyle: 'italic', marginTop: '10px', lineHeight: '1.6', flex: 1 }}>`,
            `                          {teacherData.description || 'ยังไม่มีคำอธิบายตัวเองเพิ่มเข้ามา'}`,
            `                        </span>`,
            `                        <button`,
            `                          className="edit-btn"`,
            `                          onClick={() => setIsEditingProfile(true)}`,
            `                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '10px 0 0 10px' }}`,
            `                        >`,
            `                          <Edit3 size={18} />`,
            `                        </button>`,
            `                      </div>`
        ];

        // Replace lines targetIndex - 1 to targetIndex + 2
        lines.splice(targetIndex - 1, 4, ...replacement);

        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log('✅ Replaced inline description with edit button flawlessly!');
    } else {
        console.log('⚠️ Target structure not found! Running manual splice fallback.');
        // Fallback with direct lines from view
        // 1295: ) : (
        // 1296: <span ...
        const start = 1294; // 1295 index (0-indexed)
        if (lines[start].trim() === ') : (' && lines[start+1].includes('<span className="info-value"')) {
             const replacement = [
                `                    ) : (`,
                `                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flex: 1, width: '100%' }}>`,
                `                        <span className="info-value" style={{ color: '#334155', fontStyle: 'italic', marginTop: '10px', lineHeight: '1.6', flex: 1 }}>`,
                `                          {teacherData.description || 'ยังไม่มีคำอธิบายตัวเองเพิ่มเข้ามา'}`,
                `                        </span>`,
                `                        <button`,
                `                          className="edit-btn"`,
                `                          onClick={() => setIsEditingProfile(true)}`,
                `                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '10px 0 0 10px' }}`,
                `                        >`,
                `                          <Edit3 size={18} />`,
                `                        </button>`,
                `                      </div>`
            ];
            lines.splice(start, 4, ...replacement);
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log('✅ Fallback spliced flawlessly!');
        } else {
            console.log('❌ Fallback failed. Structure mismatch.');
        }
    }
} catch (err) {
    console.error('❌ Error executing splice script:', err);
}
