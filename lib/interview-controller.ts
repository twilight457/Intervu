import curriculumDataRaw from "@/data/curriculum.json";
import { CandidateProfile } from "@/types/profile";
import { EvaluationResult, InterviewTurn } from "@/lib/interview-session";
import { GoogleGenAI } from "@google/genai";

export interface CurriculumDay {
  day: number;
  title: string;
  type?: string;
  tools?: string[];
  objectives?: string[];
}

interface CurriculumData {
  days: CurriculumDay[];
}

const curriculumData = curriculumDataRaw as CurriculumData;

/**
 * Returns candidate's completed curriculum days where passed === true,
 * shuffled for variation between separate interview sessions.
 */
export function getCandidateCompletedDays(candidate: CandidateProfile): CurriculumDay[] {
  const passedMissionDays = new Set(
    (candidate.missions || [])
      .filter((m) => m.passed === true)
      .map((m) => m.day)
  );

  const completed = (curriculumData.days || []).filter((d) =>
    passedMissionDays.has(d.day)
  );

  const available = completed.length >= 4 ? completed : curriculumData.days.slice(0, 8);

  // Fisher-Yates shuffle to ensure different question ordering per session
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export interface NextTurnDecision {
  interviewerText: string;
  type: "MAIN_QUESTION" | "FOLLOW_UP";
  mainQuestionNumber: number;
  subQuestionCode?: string;
  day: number;
  topic: string;
  objective: string;
  isCompleted: boolean;
  totalPlannedMainQuestions: number;
}

// 10 Question styles to ensure natural variety across consecutive turns
const QUESTION_STYLES = [
  "conceptual_explanation",
  "why_motivation",
  "how_it_works",
  "compare_contrast",
  "troubleshooting_debugging",
  "design_tradeoffs",
  "system_architecture",
  "scenario_what_if",
  "explain_built_system",
  "practical_implementation",
];

// Varied transition phrases to eliminate repetitive "moving on to our next technical topic"
const TRANSITION_PHRASES = [
  "Next, let's explore ",
  "Switching focus to another key area: ",
  "Turning our attention to ",
  "For our next subject, ",
  "Building on your progress, ",
  "Let's dive into ",
  "Shifting over to ",
  "Examining another core component: ",
];

/**
 * STAGE 2 & 3: INTERVIEW CONTROLLER & QUESTION GENERATOR
 */
export async function determineNextTurn(
  candidate: CandidateProfile,
  completedDays: CurriculumDay[],
  history: InterviewTurn[],
  currentMainQNum: number,
  followUpCount: number,
  totalPlannedMainQuestions: number = 8,
  evalResult?: EvaluationResult
): Promise<NextTurnDecision> {
  const isTurnComplete = !evalResult || !evalResult.should_follow_up;
  const isAtOrBeyondPlanned = currentMainQNum >= totalPlannedMainQuestions;

  // End interview ONLY when at or beyond planned main questions AND minimum 8 main questions completed
  if (isAtOrBeyondPlanned && isTurnComplete && history.length > 0 && currentMainQNum >= 8) {
    return {
      interviewerText:
        "Thank you! That completes our technical interview. I've gathered all necessary technical signals across your completed curriculum topics. Click below to view your personalized feedback report.",
      type: "MAIN_QUESTION",
      mainQuestionNumber: currentMainQNum,
      day: completedDays[0]?.day || 1,
      topic: "Assessment Complete",
      objective: "Technical Interview Completion",
      isCompleted: true,
      totalPlannedMainQuestions,
    };
  }

  // Follow-up allowed ONLY IF evalResult says should_follow_up (requires followUpCount === 0)
  const shouldFollowUp = evalResult ? evalResult.should_follow_up && followUpCount === 0 : false;

  let nextType: "MAIN_QUESTION" | "FOLLOW_UP";
  let targetMainQNum: number;
  let targetSubCode: string | undefined = undefined;
  let targetDayObj: CurriculumDay;
  let selectedObjective: string;

  if (shouldFollowUp) {
    nextType = "FOLLOW_UP";
    targetMainQNum = currentMainQNum;
    targetSubCode = `${currentMainQNum}a`;

    // Anchor strictly to the parent main question turn in history
    const parentMainTurn = history.find(
      (t) => t.type === "MAIN_QUESTION" && t.mainQuestionNumber === currentMainQNum
    );

    const parentDayNum = parentMainTurn ? parentMainTurn.curriculumDay : completedDays[0].day;
    targetDayObj =
      completedDays.find((d) => d.day === parentDayNum) || completedDays[0];

    selectedObjective =
      parentMainTurn?.curriculumObjective ||
      targetDayObj.objectives?.[0] ||
      targetDayObj.title;
  } else {
    nextType = "MAIN_QUESTION";
    targetMainQNum = history.length === 0 ? 1 : currentMainQNum + 1;

    // 1. SELECT CURRICULUM DAY
    const dayIndex = (targetMainQNum - 1) % completedDays.length;
    targetDayObj = completedDays[dayIndex] || completedDays[0];

    // 2. SELECT SPECIFIC OBJECTIVE FIRST
    const objectives = targetDayObj.objectives || [targetDayObj.title];
    selectedObjective = objectives[(targetMainQNum - 1) % objectives.length];
  }

  // Formulate natural, non-repetitive spoken interviewer text
  const interviewerText = await generateInterviewerText(
    candidate,
    targetDayObj,
    selectedObjective,
    nextType,
    targetMainQNum,
    targetSubCode,
    evalResult,
    history
  );

  return {
    interviewerText,
    type: nextType,
    mainQuestionNumber: targetMainQNum,
    subQuestionCode: targetSubCode,
    day: targetDayObj.day,
    topic: targetDayObj.title,
    objective: selectedObjective,
    isCompleted: false,
    totalPlannedMainQuestions,
  };
}

/**
 * Formulates natural interviewer text grounded strictly in the selected objective and parent question.
 */
async function generateInterviewerText(
  candidate: CandidateProfile,
  dayObj: CurriculumDay,
  selectedObjective: string,
  type: "MAIN_QUESTION" | "FOLLOW_UP",
  mainQNum: number,
  subCode?: string,
  evalResult?: EvaluationResult,
  history: InterviewTurn[] = []
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const styleIndex = (mainQNum + history.length) % QUESTION_STYLES.length;
  const targetStyle = QUESTION_STYLES[styleIndex];
  const supportingTools = dayObj.tools?.join(", ") || "the relevant tools";

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      let prompt = "";
      if (type === "FOLLOW_UP") {
        const parentMainTurn = history.find(
          (t) => t.type === "MAIN_QUESTION" && t.mainQuestionNumber === mainQNum
        );
        const parentQuestionText = parentMainTurn ? parentMainTurn.question : history[history.length - 1]?.question;
        const lastCandidateAnswer = history[history.length - 1]?.answer || "uncertain response";

        prompt = `
You are a senior technical interviewer speaking directly to candidate ${candidate.member.name}.

CURRENT MAIN QUESTION BEING DISCUSSED:
"${parentQuestionText}"

CANDIDATE'S ACTUAL ANSWER:
"${lastCandidateAnswer}"

SPECIFIC OBJECTIVE BEING ASSESSED:
"${selectedObjective}"

EVALUATION OF CANDIDATE'S ANSWER:
- Verdict: ${evalResult?.verdict}
- Concepts Demonstrated: ${evalResult?.concepts_demonstrated?.join(", ") || "None"}
- Concepts Missing: ${evalResult?.concepts_missing?.join(", ") || selectedObjective}

CRITICAL RULES FOR FOLLOW-UP GENERATION:
1. The follow-up MUST be a genuine sub-question derived directly from:
   - The CURRENT MAIN QUESTION ("${parentQuestionText}")
   - The candidate's ACTUAL answer ("${lastCandidateAnswer}")
   - The SAME objective ("${selectedObjective}")
2. DO NOT introduce FastAPI, Ollama, React, or any other tool UNLESS that tool was explicitly part of the parent question ("${parentQuestionText}")!
3. If candidate expressed uncertainty ("not sure", "I don't know", "dont know"):
   - Ask a simplified sub-question probing authentication, key parameters, or criteria directly relevant to "${parentQuestionText}".
4. Output ONLY the interviewer's spoken words (1-2 natural sentences max).
`;
      } else {
        const transIdx = (mainQNum + history.length) % TRANSITION_PHRASES.length;
        const transitionPref = mainQNum === 1 ? "Welcome to your technical interview! " : TRANSITION_PHRASES[transIdx];

        prompt = `
You are a senior technical interviewer speaking directly to candidate ${candidate.member.name} (${candidate.member.jobRole}).

CURRICULUM ASSESSED OBJECTIVE:
- Curriculum Day: Day ${dayObj.day} (${dayObj.title})
- Selected Learning Objective: "${selectedObjective}"
- Supporting Tools (Context Only): ${supportingTools}

REQUESTED QUESTION STYLE: "${targetStyle}"

MAIN QUESTION GENERATION RULES:
1. Formulate a natural, realistic technical interview question that directly tests the learning objective "${selectedObjective}".
2. Use requested style "${targetStyle}".
3. Transition phrase prefix for this question: "${transitionPref}" (Do NOT use "Moving on to our next technical topic").
4. Do NOT concatenate strings like "Why would you choose X when implementing [raw objective]".
5. Do NOT make a tool the subject of the question unless the selected objective is specifically about that tool.
6. NEVER display internal metadata (do NOT say "Main Question", "Day 1", "Topic: ...").
7. Output ONLY the interviewer's spoken question text (1-2 grammatically complete, natural sentences).
`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err) {
      console.warn("Gemini interviewer generation error, using fallback:", err);
    }
  }

  // Fallback interviewer response
  return getFallbackInterviewerText(
    dayObj,
    selectedObjective,
    type,
    mainQNum,
    subCode,
    evalResult,
    history,
    targetStyle
  );
}

function getFallbackInterviewerText(
  dayObj: CurriculumDay,
  selectedObjective: string,
  type: "MAIN_QUESTION" | "FOLLOW_UP",
  mainQNum: number,
  subCode?: string,
  evalResult?: EvaluationResult,
  history: InterviewTurn[] = [],
  style: string = "conceptual_explanation"
): string {
  if (type === "FOLLOW_UP") {
    const parentTurn = history.find((t) => t.type === "MAIN_QUESTION" && t.mainQuestionNumber === mainQNum);
    const parentQText = parentTurn ? parentTurn.question : "the previous main question";
    const qLower = parentQText.toLowerCase();
    const objLower = selectedObjective.toLowerCase();

    if (evalResult?.verdict === "not_attempted") {
      if (
        qLower.includes("secure") ||
        qLower.includes("unauthorized") ||
        qLower.includes("access") ||
        objLower.includes("secure") ||
        objLower.includes("auth")
      ) {
        return `That's okay. What authentication or authorization mechanism (such as API keys, OAuth, or JWT) would you use to prevent unauthorized users from accessing the API?`;
      }

      if (
        qLower.includes("evaluate") ||
        qLower.includes("metrics") ||
        qLower.includes("scenario") ||
        objLower.includes("evaluate")
      ) {
        return `That's okay. What kinds of real-world scenarios or testing prompts would you create to verify whether the chatbot is responding correctly?`;
      }

      if (
        (qLower.includes("fastapi") || objLower.includes("fastapi")) &&
        !qLower.includes("secure")
      ) {
        return `That's okay. What is one key feature of FastAPI that makes it suitable for asynchronous web backends?`;
      }

      return `That's okay. To help break that down simply: what is the very first step or basic concept involved in addressing that requirement?`;
    }

    const demonstrated = evalResult?.concepts_demonstrated?.[0];
    if (demonstrated) {
      return `You mentioned ${demonstrated}. Building on that, how would you address the remaining requirements for that task?`;
    }

    return `To break that down further, what specific step or criteria would you focus on first?`;
  }

  const transIdx = (mainQNum + history.length) % TRANSITION_PHRASES.length;
  const transition = history.length > 0 ? TRANSITION_PHRASES[transIdx] : "Welcome to your technical interview! ";
  const objLower = selectedObjective.toLowerCase();

  // Smart grammatical main question generator with rotated transition phrases
  if (objLower.includes("secure") || objLower.includes("auth") || objLower.includes("unauthorized")) {
    return `${transition}What are the key technical steps and considerations involved when securing chatbot APIs against unauthorized access?`;
  }

  if (objLower.includes("evaluate") || objLower.includes("scenario") || objLower.includes("benchmark")) {
    return `${transition}How would you evaluate a system using realistic scenarios, and what specific metrics or behaviors would you measure when assessing performance?`;
  }

  if (objLower.includes("fastapi") || objLower.includes("backend") || objLower.includes("endpoint")) {
    return `${transition}Why would you choose FastAPI for building asynchronous backend APIs, and how do you structure its routing and endpoints?`;
  }

  if (objLower.includes("embedding") || objLower.includes("vector")) {
    return `${transition}What primary problem do text embeddings solve in a semantic retrieval system, and how do vector databases index them?`;
  }

  if (objLower.includes("rag") || objLower.includes("retrieval")) {
    return `${transition}When building an end-to-end RAG pipeline, how do you handle document chunking and context retrieval to prevent hallucinations?`;
  }

  if (objLower.includes("agent") || objLower.includes("function") || objLower.includes("tool")) {
    return `${transition}What key trade-offs do you evaluate when implementing AI function calling and tool execution in a multi-step agent workflow?`;
  }

  if (objLower.includes("python") || objLower.includes("environment") || objLower.includes("venv")) {
    return `${transition}Why is setting up an isolated virtual environment (venv) essential when starting a new Python project?`;
  }

  return `${transition}What key technical steps and considerations are involved when you ${selectedObjective.toLowerCase()}?`;
}
