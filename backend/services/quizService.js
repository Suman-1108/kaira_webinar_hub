const { SectionQuiz, QuizAttempt } = require('../models/Quiz');
const mongoose = require('mongoose');

const isDbActive = () => mongoose.connection.readyState === 1;

// In-memory fallback if MongoDB is briefly offline
let memQuizzes = [];
let memAttempts = [];

/**
 * Standard question generator for course sections
 */
function generateDefaultQuestionsForSection(courseId, sectionId, sectionTitle) {
  const cleanTitle = (sectionTitle || 'Core Concepts').replace(/^Section\s*\d+:\s*/i, '');
  return [
    {
      questionId: `q_${sectionId}_1`,
      questionText: `What is the primary architectural objective discussed in "${cleanTitle}"?`,
      options: [
        `Establishing robust isolation, state handling, and modular component boundaries`,
        `Directly coupling all database layers into client browser state`,
        `Disabling error boundaries and retry fallbacks to reduce bundle size`,
        `Avoiding asynchronous execution patterns altogether`
      ],
      correctAnswerIndex: 0,
      explanation: `Robust isolation and structured boundary separation are foundational to scalable architecture.`,
      order: 1
    },
    {
      questionId: `q_${sectionId}_2`,
      questionText: `When implementing practical workflows in this section, what is the best practice for state consistency?`,
      options: [
        `Trusting unvalidated client-side state without server-side verification`,
        `Persisting verified state checkpoints and validating inputs on the backend`,
        `Using ephemeral local storage without any recovery mechanism`,
        `Bypassing idempotency keys on payment and transaction events`
      ],
      correctAnswerIndex: 1,
      explanation: `State consistency requires persistent checkpoints, input validation, and authoritative server-side verification.`,
      order: 2
    },
    {
      questionId: `q_${sectionId}_3`,
      questionText: `What is the critical requirement before moving from "${cleanTitle}" to subsequent production phases?`,
      options: [
        `Skipping integration tests to accelerate deployment timelines`,
        `Verifying comprehensive telemetry, security guardrails, and assessment passing criteria`,
        `Removing authentication checks on internal API routes`,
        `Hardcoding production credentials directly in frontend files`
      ],
      correctAnswerIndex: 1,
      explanation: `Production readiness requires verified security guardrails, monitoring telemetry, and validated completion criteria.`,
      order: 3
    }
  ];
}

const quizService = {
  /**
   * Get or create a SectionQuiz for a given course and section
   */
  async getOrCreateSectionQuiz(courseId, sectionId, sectionTitle = '') {
    const cid = String(courseId);
    const sid = String(sectionId);

    if (isDbActive()) {
      try {
        let quiz = await SectionQuiz.findOne({ courseId: cid, sectionId: sid }).lean();
        if (!quiz) {
          const defaultQuestions = generateDefaultQuestionsForSection(cid, sid, sectionTitle);
          const newQuiz = await SectionQuiz.create({
            quizId: `quiz_${cid}_${sid}`,
            courseId: cid,
            sectionId: sid,
            title: `${sectionTitle || 'Section Assessment'} - Knowledge Check`,
            passingScore: 80,
            retryLimit: 10,
            questions: defaultQuestions,
            isPublished: true
          });
          return newQuiz.toObject ? newQuiz.toObject() : newQuiz;
        }
        return quiz;
      } catch (err) {
        console.warn('[Quiz Service] DB lookup error, falling to memory:', err.message);
      }
    }

    // Memory Fallback
    let mem = memQuizzes.find(q => q.courseId === cid && q.sectionId === sid);
    if (!mem) {
      mem = {
        quizId: `quiz_${cid}_${sid}`,
        courseId: cid,
        sectionId: sid,
        title: `${sectionTitle || 'Section Assessment'} - Knowledge Check`,
        passingScore: 80,
        retryLimit: 10,
        questions: generateDefaultQuestionsForSection(cid, sid, sectionTitle),
        isPublished: true,
        createdAt: new Date()
      };
      memQuizzes.push(mem);
    }
    return mem;
  },

  /**
   * Retrieve quiz for student delivery (strictly strips server-side answer keys)
   */
  async getQuizForStudent(courseId, sectionId, sectionTitle = '') {
    const rawQuiz = await this.getOrCreateSectionQuiz(courseId, sectionId, sectionTitle);
    if (!rawQuiz) return null;

    // Sanitize questions: strip correctAnswerIndex and explanation
    const sanitizedQuestions = (rawQuiz.questions || []).map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      options: q.options,
      order: q.order
    }));

    return {
      quizId: rawQuiz.quizId,
      courseId: rawQuiz.courseId,
      sectionId: rawQuiz.sectionId,
      title: rawQuiz.title,
      description: rawQuiz.description,
      passingScore: rawQuiz.passingScore || 80,
      retryLimit: rawQuiz.retryLimit || 10,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions
    };
  },

  /**
   * Authoritatively validate student quiz submission on backend
   */
  async submitQuizAttempt({ userId, userEmail, courseId, sectionId, answers }) {
    const rawQuiz = await this.getOrCreateSectionQuiz(courseId, sectionId);
    if (!rawQuiz) {
      throw new Error('Assessment not found for this section.');
    }

    const questions = rawQuiz.questions || [];
    if (questions.length === 0) {
      throw new Error('Assessment contains no questions.');
    }

    let correctCount = 0;
    const evaluatedAnswers = [];

    // Map submitted answers (supporting both Array and Dictionary formats)
    const submittedMap = new Map();
    if (Array.isArray(answers)) {
      answers.forEach(a => {
        if (a && a.questionId) {
          submittedMap.set(String(a.questionId), Number(a.selectedOption ?? a.selectedOptionIndex));
        }
      });
    } else if (answers && typeof answers === 'object') {
      Object.entries(answers).forEach(([qId, optIdx]) => {
        submittedMap.set(String(qId), Number(optIdx));
      });
    }

    // Evaluate on backend against authoritative correctAnswerIndex
    for (const q of questions) {
      const selected = submittedMap.has(q.questionId) ? submittedMap.get(q.questionId) : -1;
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) correctCount++;

      evaluatedAnswers.push({
        questionId: q.questionId,
        selectedOption: selected,
        isCorrect,
        explanation: q.explanation || ''
      });
    }

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passingScore = rawQuiz.passingScore || 80;
    const passed = score >= passingScore;

    // Count prior attempts to determine attempt number
    let attemptNumber = 1;
    if (isDbActive()) {
      try {
        const count = await QuizAttempt.countDocuments({
          userId: String(userId),
          courseId: String(courseId),
          sectionId: String(sectionId)
        });
        attemptNumber = count + 1;
      } catch (e) {}
    } else {
      const memCount = memAttempts.filter(a => a.userId === String(userId) && a.courseId === String(courseId) && a.sectionId === String(sectionId)).length;
      attemptNumber = memCount + 1;
    }

    const attemptRecord = {
      userId: String(userId),
      userEmail: (userEmail || '').toLowerCase().trim(),
      courseId: String(courseId),
      sectionId: String(sectionId),
      quizId: rawQuiz.quizId,
      answers: evaluatedAnswers.map(a => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect
      })),
      totalQuestions,
      correctCount,
      score,
      passed,
      attemptNumber,
      submittedAt: new Date()
    };

    if (isDbActive()) {
      try {
        await QuizAttempt.create(attemptRecord);
      } catch (err) {
        console.warn('[Quiz Service] Failed to persist QuizAttempt doc:', err.message);
      }
    }
    memAttempts.unshift(attemptRecord);

    return {
      quizId: rawQuiz.quizId,
      courseId: String(courseId),
      sectionId: String(sectionId),
      totalQuestions,
      correctCount,
      score,
      passingScore,
      passed,
      attemptNumber,
      submittedAt: attemptRecord.submittedAt,
      feedback: evaluatedAnswers.map(a => ({
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        explanation: a.explanation
      }))
    };
  },

  /**
   * Get student attempt history for a section quiz
   */
  async getStudentQuizHistory(userId, courseId, sectionId) {
    const uid = String(userId);
    const cid = String(courseId);
    const sid = String(sectionId);

    if (isDbActive()) {
      try {
        return await QuizAttempt.find({ userId: uid, courseId: cid, sectionId: sid })
          .sort({ submittedAt: -1 })
          .lean();
      } catch (e) {}
    }

    return memAttempts.filter(a => a.userId === uid && a.courseId === cid && a.sectionId === sid);
  }
};

module.exports = quizService;
