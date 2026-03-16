import fs from 'fs';

const teacherPath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/TeacherDashboard.tsx';
const studentPath = 'd:/Team-Project-1-2-68/our-web/frontend/src/components/StudentProfile.tsx';

// 1. Fix TeacherDashboard.tsx
try {
    let content = fs.readFileSync(teacherPath, 'utf8');
    
    // Replace defaultTeacherData image
    const search1 = `image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&h=200',`;
    const replace1 = `image: '',`;
    
    // Replace line 91 logic
    const search2 = `if (userObj.image) initialData.image = userObj.image;`;
    const replace2 = `if (userObj.image !== undefined) initialData.image = userObj.image || '';`;

    if (content.includes(search1)) {
        content = content.replace(search1, replace1);
        console.log('✅ Replaced defaultTeacherData image');
    }
    if (content.includes(search2)) {
        content = content.replace(search2, replace2);
        console.log('✅ Replaced userObj.image condition');
    }

    fs.writeFileSync(teacherPath, content, 'utf8');
} catch (err) {
    console.error('❌ Error fixing TeacherDashboard.tsx:', err);
}

// 2. Fix StudentProfile.tsx
try {
    let content = fs.readFileSync(studentPath, 'utf8');
    
    // Replace userData image
    const search3 = `image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200',`;
    const replace3 = `image: '',`;
    
    // Replace line 97 logic
    const search4 = `image: userObj.image || prev.image`;
    const replace4 = `image: userObj.image || ''`;

    if (content.includes(search3)) {
        content = content.replace(search3, replace3);
        console.log('✅ Replaced userData default image');
    }
    if (content.includes(search4)) {
        content = content.replace(search4, replace4);
        console.log('✅ Replaced student userObj.image condition');
    }

    fs.writeFileSync(studentPath, content, 'utf8');
} catch (err) {
    console.error('❌ Error fixing StudentProfile.tsx:', err);
}
