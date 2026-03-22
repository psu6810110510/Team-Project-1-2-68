import fs from 'fs';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';

function fix() {
  const content = fs.readFileSync(filePath, 'utf8');
  const isWin = content.includes('\r\n');
  const lines = content.split(/\r?\n/);

  // Line offsets in zero-indexed array can be tricky. Let's find index by match instead!
  let place1Idx = -1;
  let place2Idx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('readOnly') && lines[i+1]?.includes('background: \'#f9fafb\'')) {
      if (place1Idx === -1) {
        place1Idx = i;
      } else {
        place2Idx = i;
        break;
      }
    }
  }

  if (place1Idx !== -1) {
    lines[place1Idx] = '                              onChange={(e) => updateScheduleEnd(rIdx, e.target.value)}';
    lines[place1Idx+1] = "                              style={{ padding: '3px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.78rem', width: '132px' }}";
    console.log(`Fixed Place 1 at line ${place1Idx + 1}`);
  }

  if (place2Idx !== -1) {
    lines[place2Idx] = '                              onChange={(e) => updateScheduleEnd(rIdx, e.target.value)}';
    lines[place2Idx+1] = "                              style={{ padding: '3px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.78rem', width: '132px' }}";
    console.log(`Fixed Place 2 at line ${place2Idx + 1}`);
  }

  fs.writeFileSync(filePath + '.fixed', lines.join(isWin ? '\r\n' : '\n'));
  console.log("Wrote fix to TeacherDashboard.tsx.fixed");
}

fix();
