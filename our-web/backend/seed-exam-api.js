const http = require('http');

async function seed() {
    console.log('Logging in...');
    
    // Login
    const loginData = JSON.stringify({ email: 'admin@born2code.com', password: 'admin123' });
    const loginResponse = await makeRequest('/auth/login', 'POST', loginData, null);
    const token = JSON.parse(loginResponse).access_token;
    console.log('Got token');

    // Get Courses
    console.log('Fetching courses...');
    const coursesResponse = await makeRequest('/courses', 'GET', null, token);
    const courses = JSON.parse(coursesResponse).data;
    if (courses.length === 0) {
        console.error('No courses found!');
        return;
    }
    const courseId = courses[0].id;
    console.log(`Using course ID: ${courseId}`);

    // Create Exam
    console.log('Creating exam...');
    const examData = JSON.stringify({
        course_id: courseId,
        title: 'แบบทดสอบตัวอย่าง (สำหรับการทดสอบระบบ)',
        description: 'แบบทดสอบนี้ใช้สำหรับทดสอบการทำงานของระบบคลังข้อสอบ',
        type: 'PRETEST',
        total_score: 15
    });
    const examResponse = await makeRequest('/exams', 'POST', examData, token);
    const examId = JSON.parse(examResponse).id;
    console.log(`Created exam ID: ${examId}`);

    // Create Question 1 (Multiple Choice)
    console.log('Creating Question 1 (Multiple Choice)...');
    const q1Data = JSON.stringify({
        question_text: 'ข้อใดคือภาษาโปรแกรมที่ใช้เขียนเว็บ Front-end เบื้องต้นได้ทั้งหมด?',
        type: 'MULTIPLE_CHOICE',
        score_points: 5,
        sequence_order: 1
    });
    const q1Response = await makeRequest(`/exams/${examId}/questions`, 'POST', q1Data, token);
    const q1Id = JSON.parse(q1Response).id;
    
    await makeRequest(`/exams/question/${q1Id}/choices`, 'POST', JSON.stringify({ choice_label: 'A', choice_text: 'HTML, CSS, Java', is_correct: false }), token);
    await makeRequest(`/exams/question/${q1Id}/choices`, 'POST', JSON.stringify({ choice_label: 'B', choice_text: 'HTML, CSS, JavaScript', is_correct: true }), token);
    await makeRequest(`/exams/question/${q1Id}/choices`, 'POST', JSON.stringify({ choice_label: 'C', choice_text: 'Python, C++, Ruby', is_correct: false }), token);
    await makeRequest(`/exams/question/${q1Id}/choices`, 'POST', JSON.stringify({ choice_label: 'D', choice_text: 'PHP, SQL, Go', is_correct: false }), token);

    // Create Question 2 (True/False)
    console.log('Creating Question 2 (True/False)...');
    const q2Data = JSON.stringify({
        question_text: 'React คือ Framework สำหรับพัฒนา Backend ของแอปพลิเคชันใช่หรือไม่?',
        type: 'TRUE_FALSE',
        score_points: 5,
        sequence_order: 2
    });
    const q2Response = await makeRequest(`/exams/${examId}/questions`, 'POST', q2Data, token);
    const q2Id = JSON.parse(q2Response).id;
    
    await makeRequest(`/exams/question/${q2Id}/choices`, 'POST', JSON.stringify({ choice_label: 'T', choice_text: 'จริง (True)', is_correct: false }), token);
    await makeRequest(`/exams/question/${q2Id}/choices`, 'POST', JSON.stringify({ choice_label: 'F', choice_text: 'เท็จ (False)', is_correct: true }), token);

    // Create Question 3 (Essay)
    console.log('Creating Question 3 (Essay)...');
    const q3Data = JSON.stringify({
        question_text: 'จงอธิบายความแตกต่างระหว่าง let และ const ใน JavaScript',
        type: 'ESSAY',
        score_points: 5,
        sequence_order: 3
    });
    await makeRequest(`/exams/${examId}/questions`, 'POST', q3Data, token);

    console.log('Mock exam generation complete! You can now view it in the Admin Dashboard.');
}

function makeRequest(path, method, data, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                resolve(responseData);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) req.write(data);
        req.end();
    });
}

seed();
