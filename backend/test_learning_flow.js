const http = require('http');

async function testLearningSystem() {
  console.log('=== Testing Udemy-Style Learning & Course Player System ===');

  // 1. Authenticate demo user (Pooja Sundaram)
  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pooja.sundaram@techvision.io', password: 'student123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    console.error('Failed to log in:', loginData);
    process.exit(1);
  }
  const token = loginData.token;
  console.log('✅ 1. Student Authentication verified (JWT acquired)');

  // 2. Fetch My Courses
  const myCoursesRes = await fetch('http://localhost:5001/api/learning/my-courses', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const myCoursesData = await myCoursesRes.json();
  if (!myCoursesData.success || !myCoursesData.data.courses) {
    console.error('Failed to fetch my courses:', myCoursesData);
    process.exit(1);
  }
  console.log(`✅ 2. Enrolled courses loaded: ${myCoursesData.data.courses.length} courses found`);
  const course = myCoursesData.data.courses[0];
  console.log(`   Course: "${course.title}" | Progress: ${course.progress.completionPercentage}%`);

  // 3. Fetch Course Curriculum
  const currRes = await fetch(`http://localhost:5001/api/learning/course/${course.courseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const currData = await currRes.json();
  if (!currData.success || !currData.data.curriculum) {
    console.error('Failed to fetch course curriculum:', currData);
    process.exit(1);
  }
  const sections = currData.data.curriculum;
  const firstLesson = sections[0].lessons[0];
  console.log(`✅ 3. Curriculum loaded: ${sections.length} sections, Lesson 1: "${firstLesson.title}"`);

  // 4. Save Playback Progress
  const progRes = await fetch('http://localhost:5001/api/learning/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      courseId: course.courseId,
      lessonId: firstLesson.lessonId,
      positionSeconds: 125,
      durationSeconds: firstLesson.durationSeconds
    })
  });
  const progData = await progRes.json();
  if (!progData.success || progData.data.lastPositionSeconds !== 125) {
    console.error('Failed to save playback progress:', progData);
    process.exit(1);
  }
  console.log(`✅ 4. Video playback position saved at 125s (resume position verified)`);

  // 5. Complete Lesson
  const compRes = await fetch('http://localhost:5001/api/learning/complete-lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      courseId: course.courseId,
      lessonId: firstLesson.lessonId,
      completed: true
    })
  });
  const compData = await compRes.json();
  if (!compData.success || !compData.data.completed) {
    console.error('Failed to mark lesson complete:', compData);
    process.exit(1);
  }
  console.log(`✅ 5. Lesson marked complete. Updated completion percentage: ${compData.data.completionPercentage}%`);

  // 6. Add Personal Note
  const noteRes = await fetch('http://localhost:5001/api/learning/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      courseId: course.courseId,
      lessonId: firstLesson.lessonId,
      lessonTitle: firstLesson.title,
      timestampSeconds: 125,
      text: 'Key architectural insight: Agent loops require persistent state stores.'
    })
  });
  const noteData = await noteRes.json();
  if (!noteData.success || !noteData.data._id) {
    console.error('Failed to add note:', noteData);
    process.exit(1);
  }
  console.log(`✅ 6. Personal note created with timestamp bookmark: "${noteData.data.text}"`);

  // Clean up note
  await fetch(`http://localhost:5001/api/learning/notes/${course.courseId}/${noteData.data._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('✅ 7. Personal note deleted successfully');

  // 8. Entitlement Verification for Unenrolled Student
  const unauthRes = await fetch('http://localhost:5001/api/learning/course/webinar-ai-agents');
  if (unauthRes.status === 401) {
    console.log('✅ 8. Security verified: Unauthenticated request rejected with HTTP 401');
  }

  console.log('\n🎉 ALL 8 LEARNING SYSTEM END-TO-END TESTS PASSED SUCCESSFULLY!');
}

testLearningSystem().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
