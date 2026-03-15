import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

function fix() {
    let content = fs.readFileSync(filePath, 'utf8');
    const isWin = content.includes('\r\n');
    const lines = content.split(/\r?\n/);

    // 1. Add formatDate helper
    let addedHelper = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const DAY_MAP') && !addedHelper) {
            lines[i] = "  const formatDate = (dateStr: string) => {\n" +
                        "    if (!dateStr) return 'เลือกวันที่';\n" +
                        "    const [year, month, day] = dateStr.split('-');\n" +
                        "    return `${day}/${month}/${year}`;\n" +
                        "  };\n\n" + lines[i];
            addedHelper = true;
            break;
        }
    }

    // 2. Wrap inputs
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        const lineTrim = lines[i].trim();
        // Match the wrapper line
        if (lineTrim.includes("<div style={{ position: 'relative'") && lines[i+1]?.trim() === '<input' && lines[i+2]?.trim()?.includes('type="date"')) {
            
            let blockEnd = i;
            while (blockEnd < lines.length && !lines[blockEnd].includes('</div>')) {
                blockEnd++;
            }

            if (blockEnd < lines.length) {
                // Find input block
                let valueVar = 'schedule.startDate'; // assume start
                // schedule.endDate could be lines[i+2], lines[i+3] or lines[i+4]
                if (lines[i+3].includes('schedule.endDate') || lines[i+4].includes('schedule.endDate') || lines[i+2].includes('schedule.endDate')) {
                    valueVar = 'schedule.endDate';
                }

                lines[i] = "                              <div style={{ ...inputContainerStyle, position: 'relative', width: '135px', padding: 0 }}>";
                lines[i+1] = "                                <div style={{ padding: '8px 10px', fontSize: '0.9rem', color: '#1e293b', paddingRight: '32px' }}>{formatDate(" + valueVar + ")}</div>\n" + lines[i+1];
                
                // update input style to fully transparent absolute
                for (let j = i+1; j <= blockEnd; j++) {
                    if (lines[j].includes('style={{')) {
                        lines[j] = "                                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}";
                    }
                }

                count++;
                i = blockEnd; 
            }
        }
    }

    if (count > 0) {
        fs.writeFileSync(filePath + '.fixed', lines.join(isWin ? '\r\n' : '\n'));
        console.log(`Successfully updated ${count} date inputs to support DD/MM/YYYY formatting transparent overlay.`);
    } else {
        console.log("No wrapped date inputs found matching criteria.");
    }
}

fix();
