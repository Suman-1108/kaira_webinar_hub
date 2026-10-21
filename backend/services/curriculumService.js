/**
 * Curriculum Service
 * Generates and manages structured sections and lessons for courses/webinars.
 */

const DEFAULT_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
];

const buildCurriculumForWebinar = (webinar) => {
  if (webinar.curriculum && webinar.curriculum.length > 0) {
    return webinar.curriculum;
  }

  const coursePrefix = (webinar.id || webinar.slug || 'course').replace(/[^a-zA-Z0-9]/g, '_');
  const agenda = webinar.agenda && webinar.agenda.length > 0 ? webinar.agenda : [
    { title: "Section 1: Architecture & Foundations", duration: "30 mins", points: ["Core fundamentals", "Environment setup", "Architecture overview"] },
    { title: "Section 2: Hands-On Implementation", duration: "45 mins", points: ["Step-by-step coding", "State handling", "Performance optimizations"] },
    { title: "Section 3: Production Deployment & Best Practices", duration: "35 mins", points: ["Security auditing", "Production build", "Monitoring & logging"] }
  ];

  let globalLessonOrder = 1;

  const sections = agenda.map((item, secIdx) => {
    const secId = `sec_${coursePrefix}_${secIdx + 1}`;
    const points = item.points && item.points.length > 0 
      ? item.points 
      : ["Introduction & Theory", "Interactive Code Demo", "Real-world Edge Cases", "Review & Practice"];

    const lessons = points.map((pt, lesIdx) => {
      const lesId = `les_${coursePrefix}_${secIdx + 1}_${lesIdx + 1}`;
      const videoIndex = (secIdx * 3 + lesIdx) % DEFAULT_VIDEOS.length;
      const durationMins = 4 + ((secIdx + lesIdx) % 8);
      const durationSeconds = durationMins * 60;

      const lesson = {
        lessonId: lesId,
        title: `${globalLessonOrder}. ${pt}`,
        duration: `${durationMins} mins`,
        durationSeconds,
        videoUrl: webinar.promoVideoUrl && lesIdx === 0 ? webinar.promoVideoUrl : DEFAULT_VIDEOS[videoIndex],
        order: globalLessonOrder,
        resources: [
          {
            title: `${pt} - Reference Slides.pdf`,
            url: `https://meet.kairahub.live/downloads/${lesId}/slides.pdf`,
            type: 'slides'
          },
          {
            title: `${pt} - GitHub Code Repository`,
            url: `https://github.com/kairahub-open/${coursePrefix}`,
            type: 'code'
          }
        ]
      };
      globalLessonOrder++;
      return lesson;
    });

    return {
      sectionId: secId,
      title: item.title.startsWith('Section') ? item.title : `Section ${secIdx + 1}: ${item.title}`,
      order: secIdx + 1,
      duration: item.duration || `${lessons.reduce((acc, l) => acc + parseInt(l.duration), 0)} mins`,
      lessons
    };
  });

  return sections;
};

const getTrackableLessons = (sections) => {
  const lessons = [];
  if (!sections || !Array.isArray(sections)) return lessons;
  for (const sec of sections) {
    if (sec.lessons && Array.isArray(sec.lessons)) {
      for (const les of sec.lessons) {
        lessons.push(les);
      }
    }
  }
  return lessons;
};

module.exports = {
  buildCurriculumForWebinar,
  getTrackableLessons
};
