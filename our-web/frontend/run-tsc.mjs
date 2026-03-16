import { execSync } from 'child_process';
import fs from 'fs';

try {
    const output = execSync('npx tsc --noEmit src/pages/TeacherDashboard.tsx', { stdio: 'pipe' });
    console.log("Success with no errors!");
    fs.writeFileSync('tsc_errors.txt', output.toString());
} catch (error) {
    console.log("Failed with errors:");
    const fullError = error.stdout ? error.stdout.toString() : "";
    const stderr = error.stderr ? error.stderr.toString() : "";
    fs.writeFileSync('tsc_errors.txt', fullError + '\n\n' + stderr);
    console.log(fullError || stderr);
}
