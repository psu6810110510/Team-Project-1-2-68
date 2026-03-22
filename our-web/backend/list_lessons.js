const axios = require('axios');
const fs = require('fs');

async function check() {
  try {
    const res = await axios.get('https://wd12.pupasoft.com/api/courses');
    const courses = res.data.data;
    const sqlCourse = courses.find(c => c.title.includes('SQL') || c.title.includes('Database'));
    if (!sqlCourse) {
      console.log('Course not found');
      return;
    }
    console.log('Found Course:', sqlCourse.id, sqlCourse.title);
    const lessonsRes = await axios.get(`https://wd12.pupasoft.com/api/courses/${sqlCourse.id}/lessons`);
    fs.writeFileSync('C:/Users/lenovo/.gemini/antigravity/brain/18601011-0861-4601-a22f-bc0115e12b21/lessons_output.json', JSON.stringify(lessonsRes.data, null, 2));
    console.log('Lessons Written successful');
  } catch (err) {
    console.error(err.message);
  }
}
check();
