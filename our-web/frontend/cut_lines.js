const fs = require('fs');
const file = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/CourseDetail.tsx';
const content = fs.readFileSync(file, 'utf8').split('\n');
// Line 489 is index 488
content.splice(488, 75);
fs.writeFileSync(file, content.join('\n'));
console.log('Cut 75 lines successfully');
