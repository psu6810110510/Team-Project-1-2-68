import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

function check() {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const matches = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const formatDate') || lines[i].includes('formatDate =')) {
            matches.push({ line: i + 1, text: lines[i].trim() });
        }
    }

    console.log(`Found ${matches.length} matches:`);
    matches.forEach(m => console.log(`[Line ${m.line}] ${m.text}`));
}

check();
