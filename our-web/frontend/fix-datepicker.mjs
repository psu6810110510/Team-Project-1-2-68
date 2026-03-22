import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

function fix() {
    let content = fs.readFileSync(filePath, 'utf8');
    const isWin = content.includes('\r\n');
    const lines = content.split(/\r?\n/);

    // 1. Add Calendar to imports if not already present
    for (let i = 0; i < 30; i++) {
        if (lines[i].includes('Edit2, Check, Bell')) {
            lines[i] = lines[i].replace('Edit2, Check, Bell', 'Edit2, Check, Bell, Calendar');
            console.log("Added Calendar to imports at line", i + 1);
            break;
        }
    }

    // 2. Wrap inputs
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<input') && lines[i+1]?.includes('type="date"') && lines[i+5]?.includes('onsite-schedule-input') === false) {
            // Find endDate or startDate input block
            // We want to insert <div style={{ position: 'relative', display: 'inline-block' }}> BEFORE the <input
            
            let blockEnd = i;
            while (blockEnd < lines.length && !lines[blockEnd].includes('/>')) {
                blockEnd++;
            }

            if (blockEnd < lines.length) {
                // Update styling inline to include class and paddingRight
                for (let j = i; j <= blockEnd; j++) {
                    if (lines[j].includes('style={{')) {
                        lines[j] = lines[j].replace('style={{', "className=\"onsite-schedule-input\" style={{ paddingRight: '32px', ");
                    }
                }

                lines[i] = '                              <div style={{ position: ' + "'relative', display: 'inline-block'" + ' }}>\n' + lines[i];
                lines[blockEnd] = lines[blockEnd] + '\n                              <Calendar size={16} style={{ position: ' + "'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 1" + ' }} />\n                              </div>';
                
                count++;
                i = blockEnd; // skip inside
            }
        }
    }

    if (count > 0) {
        fs.writeFileSync(filePath + '.fixed', lines.join(isWin ? '\r\n' : '\n'));
        console.log(`Successfully wrapped ${count} date inputs with Calendar icon.`);
    } else {
        console.log("No date inputs found matching criteria.");
    }
}

fix();
