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
    if (!session || (candidate && (!message || message.trim() === "") && action !== "skip")) {
      const activeCandidate: CandidateProfile = candidate || body;
      if (!activeCandidate || !activeCandidate.member) {
        return NextResponse.json(
          { error: "Missing candidate object for session initialization" },
          { status: 400 }
        );
      }

      const completedDays = getCandidateCompletedDays(activeCandidate);

      // Select a target number of main questions between 8 and 12 randomly for each new interview session
      const totalPlanned = Math.floor(Math.random() * 5) + 8;

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

      // Generate Main Question 1
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

    // 2. CHECK IF SESSION IS ALREADY DONE
    if (session.isDone) {
      return NextResponse.json({
        reply: "Interview has already been completed.",
        done: true,
        feedback: session.feedback,
      });
    }

    // 3. STAGE 1: ANSWER EVALUATOR
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
        isSkipped
      );

      currentTurn.evaluation = evalResult;

      // If evaluating a follow-up answer, resolve parent main question's overall evaluation
      if (currentTurn.type === "FOLLOW_UP") {
        const parentTurn = session.turns.find(
          (t) =>
            t.type === "MAIN_QUESTION" &&
            t.mainQuestionNumber === currentTurn.mainQuestionNumber
        );

        if (parentTurn) {
          if (evalResult.verdict === "correct") {
            parentTurn.evaluation = {
              ...evalResult,
              verdict: "partially_correct",
              expected_answer: evalResult.expected_answer || parentTurn.evaluation?.expected_answer,
            };
          } else if (evalResult.verdict === "partially_correct") {
            parentTurn.evaluation = {
              ...evalResult,
              verdict: "partially_correct",
              expected_answer: evalResult.expected_answer || parentTurn.evaluation?.expected_answer,
            };
          } else {
            parentTurn.evaluation = {
              ...evalResult,
              verdict: "incorrect",
              expected_answer: evalResult.expected_answer || parentTurn.evaluation?.expected_answer,
            };
          }
        }
      }
    }

    // 4. STAGE 2 & 3: INTERVIEW CONTROLLER & QUESTION GENERATION
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
      session.isDone = true;

      // Compile comprehensive question-level evaluation report data
      const mainQuestionTurns = session.turns.filter(
        (t) => t.type === "MAIN_QUESTION"
      );

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
          evaluationReasoning: t.evaluation?.reasoning || "No detailed evaluation recorded.",
          expectedAnswer: t.evaluation?.expected_answer || "Model response based on curriculum objective.",
          followUpQuestion: followUpTurn ? followUpTurn.question : undefined,
          followUpAnswer: followUpTurn ? (followUpTurn.answer || "[No follow-up answer]") : undefined,
          conceptsDemonstrated: t.evaluation?.concepts_demonstrated || [],
          conceptsMissing: t.evaluation?.concepts_missing || [],
        };
      });

      const correctCount = questionEvaluations.filter(
        (q) => q.finalVerdict === "correct"
      ).length;

      const partiallyCount = questionEvaluations.filter(
        (q) => q.finalVerdict === "partially_correct"
      ).length;

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

      session.feedback = {
        summary: `Technical assessment across ${mainQuestionTurns.length} questions.`,
        strengths: strengths.slice(0, 4),
        gaps: gaps.slice(0, 4),
        next: nextReview.slice(0, 4),
        overallScore,
        questionEvaluations,
      };

      saveSession(session);

      return NextResponse.json({
        reply: nextDecision.interviewerText,
        done: true,
        feedback: session.feedback,
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
