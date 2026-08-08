import { NextResponse } from "next/server";
import {
  getSession,
  saveSession,
  InterviewSession,
  InterviewTurn,
  QuestionEvaluationReportItem,
  InterviewFeedbackReport,
} from "@/lib/interview-session";
import { evaluateCandidateAnswer } from "@/lib/interview-evaluator";
import {
  getCandidateCompletedDays,
  determineNextTurn,
} from "@/lib/interview-controller";
import { CandidateProfile } from "@/types/profile";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing required parameter: sessionId" },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: `Session not found for sessionId: ${sessionId}` },
      { status: 404 }
    );
  }

  if (!session.feedback) {
    // If feedback has not been generated yet, finalize session
    const feedback = finalizeSession(session);
    return NextResponse.json({ feedback, candidate: session.candidate });
  }

  return NextResponse.json({
    feedback: session.feedback,
    candidate: session.candidate,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, candidate, message, action } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing required parameter: sessionId" },
        { status: 400 }
      );
    }

    let session = getSession(sessionId);

    // 1. START INTERVIEW SESSION (First Request)
    if (!session || (candidate && (!message || message.trim() === "") && action !== "skip" && action !== "end_early")) {
      const activeCandidate: CandidateProfile = candidate || body;
      if (!activeCandidate || !activeCandidate.member) {
        return NextResponse.json(
          { error: "Missing candidate object for session initialization" },
          { status: 400 }
        );
      }

      const completedDays = getCandidateCompletedDays(activeCandidate);
      const totalPlanned = Math.floor(Math.random() * 5) + 8; // 8, 9, 10, 11, or 12

      session = {
        sessionId,
        candidate: activeCandidate,
        completedDays,
        turns: [],
        mainQuestionNumber: 1,
        totalPlannedMainQuestions: totalPlanned,
        followUpCount: 0,
        isDone: false,
        createdAt: Date.now(),
      };

      const turn1Decision = await determineNextTurn(
        activeCandidate,
        completedDays,
        [],
        1,
        0,
        totalPlanned
      );

      const turn1Record: InterviewTurn = {
        id: "main-1",
        type: "MAIN_QUESTION",
        mainQuestionNumber: 1,
        curriculumDay: turn1Decision.day,
        curriculumTopic: turn1Decision.topic,
        curriculumObjective: turn1Decision.objective,
        question: turn1Decision.interviewerText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (!session) {
        return NextResponse.json(
          { error: "Failed to initialize interview session." },
          { status: 500 }
        );
      }

      session.turns.push(turn1Record);
      saveSession(session);

      return NextResponse.json({
        reply: turn1Decision.interviewerText,
        done: false,
        questionNumber: 1,
        totalQuestions: totalPlanned,
        isFollowUp: false,
        day: turn1Decision.day,
        topic: turn1Decision.topic,
        objective: turn1Decision.objective,
      });
    }

    // 2. CHECK IF ACTION IS END EARLY
    if (action === "end_early") {
      const feedback = finalizeSession(session);
      return NextResponse.json({
        reply: "Interview ended early upon candidate request.",
        done: true,
        feedback,
      });
    }

    // 3. CHECK IF SESSION IS ALREADY DONE
    if (session.isDone) {
      return NextResponse.json({
        reply: "Interview has already been completed.",
        done: true,
        feedback: session.feedback,
      });
    }

    // 4. STAGE 1: ANSWER EVALUATOR
    const currentTurn = session.turns[session.turns.length - 1];
    const isSkipped = action === "skip";
    const answerText = isSkipped ? "[Skipped by candidate]" : message || "";

    let evalResult;
    if (currentTurn) {
      currentTurn.answer = answerText;

      const dayInfo =
        session.completedDays.find((d) => d.day === currentTurn.curriculumDay) ||
        session.completedDays[0];

      evalResult = await evaluateCandidateAnswer(
        currentTurn.question,
        answerText,
        dayInfo,
        session.candidate,
        session.turns,
        session.followUpCount,
        isSkipped,
        currentTurn.curriculumObjective
      );

      currentTurn.evaluation = evalResult;

      if (currentTurn.type === "FOLLOW_UP") {
        const parentTurn = session.turns.find(
          (t) =>
            t.type === "MAIN_QUESTION" &&
            t.mainQuestionNumber === currentTurn.mainQuestionNumber
        );

        if (parentTurn) {
          const parentExpected = parentTurn.evaluation?.expected_answer || evalResult.expected_answer;
          if (evalResult.verdict === "correct" || evalResult.verdict === "partially_correct") {
            parentTurn.evaluation = {
              ...evalResult,
              verdict: "partially_correct",
              expected_answer: parentExpected,
            };
          } else {
            parentTurn.evaluation = {
              ...evalResult,
              verdict: "incorrect",
              expected_answer: parentExpected,
            };
          }
        }
      }
    }

    // 5. STAGE 2 & 3: INTERVIEW CONTROLLER & QUESTION GENERATION
    const nextDecision = await determineNextTurn(
      session.candidate,
      session.completedDays,
      session.turns,
      session.mainQuestionNumber,
      session.followUpCount,
      session.totalPlannedMainQuestions,
      evalResult
    );

    if (nextDecision.isCompleted) {
      const feedback = finalizeSession(session);
      return NextResponse.json({
        reply: nextDecision.interviewerText,
        done: true,
        feedback,
      });
    }

    // Update session state pointers
    if (nextDecision.type === "FOLLOW_UP") {
      session.followUpCount += 1;
    } else {
      session.mainQuestionNumber = nextDecision.mainQuestionNumber;
      session.followUpCount = 0;
    }

    // Record new turn
    const newTurnRecord: InterviewTurn = {
      id:
        nextDecision.type === "MAIN_QUESTION"
          ? `main-${nextDecision.mainQuestionNumber}`
          : `followup-${nextDecision.subQuestionCode}`,
      type: nextDecision.type,
      mainQuestionNumber: nextDecision.mainQuestionNumber,
      subQuestionCode: nextDecision.subQuestionCode,
      parentMainQuestionId:
        nextDecision.type === "FOLLOW_UP"
          ? `main-${nextDecision.mainQuestionNumber}`
          : undefined,
      curriculumDay: nextDecision.day,
      curriculumTopic: nextDecision.topic,
      curriculumObjective: nextDecision.objective,
      question: nextDecision.interviewerText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    session.turns.push(newTurnRecord);
    saveSession(session);

    return NextResponse.json({
      reply: nextDecision.interviewerText,
      done: false,
      questionNumber: session.mainQuestionNumber,
      totalQuestions: session.totalPlannedMainQuestions,
      isFollowUp: nextDecision.type === "FOLLOW_UP",
      subQuestionCode: nextDecision.subQuestionCode,
      day: nextDecision.day,
      topic: nextDecision.topic,
      objective: nextDecision.objective,
    });
  } catch (error: unknown) {
    console.error("Error in /api/interview:", error);
    return NextResponse.json(
      { error: "Internal server error processing interview turn" },
      { status: 500 }
    );
  }
}

function finalizeSession(session: InterviewSession): InterviewFeedbackReport {
  const totalPlanned = session.totalPlannedMainQuestions || 8;
  const completedDays = session.completedDays;

  const existingMainTurns = session.turns.filter((t) => t.type === "MAIN_QUESTION");
  const existingNumbers = new Set(existingMainTurns.map((t) => t.mainQuestionNumber));

  // Fill in remaining planned main questions up to totalPlanned as NOT_ATTEMPTED
  for (let qNum = 1; qNum <= totalPlanned; qNum++) {
    if (!existingNumbers.has(qNum)) {
      const dayIndex = (qNum - 1) % completedDays.length;
      const dayObj = completedDays[dayIndex] || completedDays[0];
      const objectives = dayObj.objectives || [dayObj.title];
      const objective = objectives[(qNum - 1) % objectives.length];
      const tools = dayObj.tools?.join(", ") || "standard tooling";

      const notAttemptedTurn: InterviewTurn = {
        id: `main-${qNum}`,
        type: "MAIN_QUESTION",
        mainQuestionNumber: qNum,
        curriculumDay: dayObj.day,
        curriculumTopic: dayObj.title,
        curriculumObjective: objective,
        question: `Technical assessment regarding ${objective}`,
        answer: "[Not attempted - Interview ended early]",
        evaluation: {
          verdict: "not_attempted",
          reasoning: "Question was not attempted because the candidate ended the interview early.",
          expected_answer: `A complete answer should address ${objective.toLowerCase()} using ${tools}, explaining key implementation steps, trade-offs, and error handling criteria.`,
          concepts_demonstrated: [],
          concepts_missing: [objective],
          factual_errors: [],
          should_follow_up: false,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      session.turns.push(notAttemptedTurn);
    }
  }

  // Compile exactly totalPlanned question-level report items
  const mainQuestionTurns = session.turns.filter((t) => t.type === "MAIN_QUESTION");
  mainQuestionTurns.sort((a, b) => a.mainQuestionNumber - b.mainQuestionNumber);

  const questionEvaluations: QuestionEvaluationReportItem[] = mainQuestionTurns.map((t) => {
    const followUpTurn = session.turns.find(
      (ft) => ft.type === "FOLLOW_UP" && ft.mainQuestionNumber === t.mainQuestionNumber
    );

    return {
      mainQuestionNumber: t.mainQuestionNumber,
      question: t.question,
      curriculumDay: t.curriculumDay,
      curriculumTopic: t.curriculumTopic,
      curriculumObjective: t.curriculumObjective,
      candidateAnswer: t.answer || "[No answer provided]",
      finalVerdict: t.evaluation?.verdict || "not_attempted",
      evaluationReasoning: t.evaluation?.reasoning || "Question was not attempted.",
      expectedAnswer: t.evaluation?.expected_answer || `A complete answer should address ${(t.curriculumObjective || t.curriculumTopic).toLowerCase()}, explaining key implementation steps and trade-offs.`,
      followUpQuestion: followUpTurn ? followUpTurn.question : undefined,
      followUpAnswer: followUpTurn ? (followUpTurn.answer || "[No follow-up answer]") : undefined,
      conceptsDemonstrated: t.evaluation?.concepts_demonstrated || [],
      conceptsMissing: t.evaluation?.concepts_missing || [],
    };
  });

  const correctCount = questionEvaluations.filter((q) => q.finalVerdict === "correct").length;
  const partiallyCount = questionEvaluations.filter((q) => q.finalVerdict === "partially_correct").length;

  const overallScore = Math.round(
    ((correctCount + partiallyCount * 0.5) / Math.max(questionEvaluations.length, 1)) * 100
  );

  const strengths = Array.from(
    new Set(
      questionEvaluations
        .filter((q) => q.finalVerdict === "correct")
        .map((q) => `Demonstrated clear technical mastery of ${q.curriculumTopic} (Day ${q.curriculumDay}).`)
    )
  );

  if (strengths.length === 0) {
    strengths.push("Attempted technical assessment questions actively.");
  }

  const gaps = Array.from(
    new Set(
      questionEvaluations
        .filter((q) => q.finalVerdict !== "correct")
        .map((q) => `Requires review in ${q.curriculumTopic} (Day ${q.curriculumDay}) - ${q.evaluationReasoning}`)
    )
  );

  if (gaps.length === 0) {
    gaps.push("No major gaps identified during this assessment.");
  }

  const nextReview = Array.from(
    new Set(
      questionEvaluations
        .filter((q) => q.finalVerdict !== "correct")
        .map((q) => `Day ${q.curriculumDay} · ${q.curriculumTopic}`)
    )
  );

  const feedback: InterviewFeedbackReport = {
    summary: `Technical assessment across ${questionEvaluations.length} questions.`,
    strengths: strengths.slice(0, 4),
    gaps: gaps.slice(0, 4),
    next: nextReview.slice(0, 4),
    overallScore,
    questionEvaluations,
  };

  session.isDone = true;
  session.feedback = feedback;
  saveSession(session);

  return feedback;
}
