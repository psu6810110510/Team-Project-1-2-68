import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

function fix() {
    const content = fs.readFileSync(filePath, 'utf8');
    const isWin = content.includes('\r\n');
    const lines = content.split(/\r?\n/);

    const targetString = "style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}";
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        // If the line is EXACTLY the style definition standing alone
        if (lines[i].trim() === targetString) {
            lines[i] = ""; // Delete it
            count++;
        }
    }

    if (count > 0) {
        fs.writeFileSync(filePath + '.fixed', lines.join(isWin ? '\r\n' : '\n'));
        console.log(`Successfully removed ${count} duplicated style lines.`);
    } else {
        console.log("No duplicated style lines found.");
    }
}

fix();
