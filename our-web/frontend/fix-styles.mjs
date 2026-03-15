import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

function fix() {
    const content = fs.readFileSync(filePath, 'utf8');
    const isWin = content.includes('\r\n');
    const lines = content.split(/\r?\n/);

    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        // Find style={{ padding: '3px 6px', border: '1px solid #d1d5db', ... width: '132px' }}
        if (lines[i].includes("style={{ padding: '3px 6px'") && lines[i].includes("width: '132px'") && (lines[i-1]?.includes('updateSchedule') || lines[i-5]?.includes('updateSchedule'))) {
            lines[i] = "                              style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem', width: '135px', background: 'white', color: '#374151' }}";
            count++;
        }
    }

    if (count > 0) {
        fs.writeFileSync(filePath + '.fixed', lines.join(isWin ? '\r\n' : '\n'));
        console.log(`Successfully updated ${count} style references.`);
    } else {
        console.log("No style references found matching criteria.");
    }
}

fix();
