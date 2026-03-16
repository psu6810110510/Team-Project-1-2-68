import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

function fix() {
    const content = fs.readFileSync(filePath, 'utf8');
    const isWin = content.includes('\r\n');
    const lines = content.split(/\r?\n/);

    let updatedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('{courseForm.onsiteSchedules.map(')) {
            // Find map start
            let mapStart = i;
            // Find map end by counting brackets
            let openBrackets = 1;
            let mapEnd = i;
            
            while (mapEnd < lines.length && openBrackets > 0) {
                mapEnd++;
                if (lines[mapEnd].includes('(')) openBrackets++;
                if (lines[mapEnd].includes(')')) openBrackets--;
                if (lines[mapEnd].includes('}')) openBrackets--; // careful of overlapping map closing
                if (lines[mapEnd].includes('</div>')) {
                    // map body ends with </div> and then closing map container
                }
            }

            // Alternatively, just search for the bottom of the map block using `+ เพิ่มรอบ` or similar layout context
            // In layout, the block ends around line 1622 with `</div>` right before map block closure!
            // Let's use finding `removeSchedule` or map closing tag which is usually a few lines below.
            
            let findEnd = mapStart;
            while (findEnd < lines.length && !lines[findEnd].includes('✕</button>')) {
                findEnd++;
            }
            // Add 3-4 lines for closures
            let blockEnd = findEnd + 3; 

            if (blockEnd < lines.length) {
                const replacement = 
`                        {courseForm.onsiteSchedules.map((schedule, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.78rem', color: '#374151', minWidth: '52px' }}>รอบที่ {rIdx + 1}</span>
                            <div style={{ ...inputContainerStyle, position: 'relative', width: '135px', padding: 0 }}>
                              <div style={{ padding: '8px 10px', fontSize: '0.9rem', color: '#1e293b', paddingRight: '32px' }}>{formatDate(schedule.startDate)}</div>
                              <input
                                type="date"
                                className="onsite-schedule-input"
                                value={schedule.startDate}
                                min={todayStr}
                                max={yearEndStr}
                                onChange={(e) => updateScheduleStart(rIdx, e.target.value)}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                              />
                              <Calendar size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 1 }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ถึง</span>
                            <div style={{ ...inputContainerStyle, position: 'relative', width: '135px', padding: 0 }}>
                              <div style={{ padding: '8px 10px', fontSize: '0.9rem', color: '#1e293b', paddingRight: '32px' }}>{formatDate(schedule.endDate)}</div>
                              <input
                                type="date"
                                className="onsite-schedule-input"
                                value={schedule.endDate}
                                onChange={(e) => updateScheduleEnd(rIdx, e.target.value)}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                              />
                              <Calendar size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 1 }} />
                            </div>
                            {rIdx > 0 && (
                              <button type="button" onClick={() => removeSchedule(rIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.9rem', fontWeight: 'bold', padding: '0 4px' }}>✕</button>
                            )}
                          </div>
                        ))}`;

                lines[mapStart] = replacement;
                for (let j = mapStart + 1; j <= blockEnd; j++) {
                    lines[j] = ""; // Clear buggy lines
                }

                updatedCount++;
                i = blockEnd; 
            }
        }
    }

    if (updatedCount > 0) {
        fs.writeFileSync(filePath + '.fixed', lines.join(isWin ? '\r\n' : '\n'));
        console.log(`Successfully restored ${updatedCount} map blocks.`);
    } else {
        console.log("No map blocks found.");
    }
}

fix();
