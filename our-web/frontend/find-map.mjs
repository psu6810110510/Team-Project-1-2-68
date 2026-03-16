import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/AdminDashboard.tsx';

function check() {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const matches = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('.map')) {
            matches.push(`[Line ${i + 1}] ${lines[i].trim()}`);
        }
    }

    fs.writeFileSync('d:/Team-Project-1-2-68/our-web/frontend/map-matches.txt', matches.join('\n'), 'utf8');
    console.log(`Saved ${matches.length} matches to map-matches.txt`);
}

check();
