import curriculumDataRaw from "@/data/curriculum.json";
import { CandidateProfile } from "@/types/profile";
import {
  InterviewTurn,
  AnswerEvaluationLabel,
} from "@/lib/interview-session";
import { GoogleGenAI } from "@google/genai";

interface CurriculumDay {
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
 * Returns candidate's completed curriculum days where passed === true
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

  // Fallback to curriculum days if fewer than 4 passed days
  if (completed.length < 4) {
    return curriculumData.days.slice(0, 8);
  }

  return completed;
}

/**
 * Evaluates candidate's answer against the question and curriculum
 */
export async function evaluateAnswer(
  question: string,
  answer: string,
  dayObj: CurriculumDay
): Promise<{ label: AnswerEvaluationLabel; reasoning: string }> {
  const trimmed = (answer || "").trim();
  const lower = trimmed.toLowerCase();

  // Fast pattern check for not_attempted / uncertainty
  const isUncertaintyPhrase =
    trimmed === "" ||
    lower === "i don't know" ||
    lower === "i dont know" ||
    lower === "i'm not sure" ||
    lower === "im not sure" ||
    lower === "not sure" ||
    lower === "i don't understand" ||
    lower === "no idea" ||
    lower.startsWith("i'm not sure") ||
    lower.startsWith("i dont know") ||
    lower.startsWith("not sure");

  // Check if candidate provided any substantive technical words (e.g. > 15 words or technical keywords)
  const technicalKeywords = [
    "vector", "embedding", "rag", "prompt", "chunk", "python", "api", "database",
    "token", "cosine", "model", "llm", "context", "search", "index", "schema",
  ];
  const hasTechKeyword = technicalKeywords.some((kw) => lower.includes(kw));

  if (isUncertaintyPhrase && !hasTechKeyword) {
    return {
      label: "not_attempted",
      reasoning: "Candidate expressed uncertainty or gave no substantive response.",
    };
  }

  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are a technical evaluation engine. Evaluate the candidate's answer to the technical question.

Question: "${question}"
Curriculum Topic: Day ${dayObj.day} (${dayObj.title})
Expected Learning Objectives: ${dayObj.objectives?.join("; ") || "Technical mastery"}

Candidate's Answer: "${trimmed}"

Classify the answer into EXACTLY ONE label:
1. "correct" - Answer is technically accurate and addresses the core concept well.
2. "partially_correct" - Answer has good points but misses key details, trade-offs, or has minor inaccuracies.
3. "incorrect" - Answer contains fundamental technical errors or wrong definitions.
4. "not_attempted" - Candidate expressed uncertainty (e.g. "I'm not sure", "I don't know") or provided no substantive technical information.

Return JSON in this format:
{
  "label": "correct" | "partially_correct" | "incorrect" | "not_attempted",
  "reasoning": "1-2 sentence technical justification"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text?.trim() || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (
          ["correct", "partially_correct", "incorrect", "not_attempted"].includes(
            parsed.label
          )
        ) {
          return {
            label: parsed.label as AnswerEvaluationLabel,
            reasoning: parsed.reasoning || "Evaluated by AI engine.",
          };
        }
      }
    } catch (err) {
      console.warn("Gemini evaluation error, using heuristic fallback:", err);
    }
  }

  // Fallback heuristic classification
  if (isUncertaintyPhrase) {
    return {
      label: "not_attempted",
      reasoning: "Candidate expressed uncertainty without technical explanation.",
    };
  }
  if (trimmed.length < 25) {
    return {
      label: "partially_correct",
      reasoning: "Answer is brief and lacks architectural detail.",
    };
  }
  return {
    label: "correct",
    reasoning: "Answer provides technically relevant explanation.",
  };
}

/**
 * Generates next turn (either a FOLLOW-UP or the next MAIN QUESTION)
 */
export async function generateNextTurn(
  candidate: CandidateProfile,
  completedDays: CurriculumDay[],
  history: InterviewTurn[],
  currentMainQNum: number,
  followUpCount: number,
  lastEvaluationLabel?: AnswerEvaluationLabel
): Promise<{
  question: string;
  day: number;
  topic: string;
  type: "MAIN_QUESTION" | "FOLLOW_UP";
  mainQuestionNumber: number;
  subQuestionCode?: string;
}> {
  // Decision logic for follow-up vs next main question
  const needsFollowUp =
    lastEvaluationLabel &&
    lastEvaluationLabel !== "correct" &&
    followUpCount < 2;

  let nextType: "MAIN_QUESTION" | "FOLLOW_UP";
  let targetMainQNum: number;
  let targetSubCode: string | undefined = undefined;
  let targetDay: CurriculumDay;

  if (needsFollowUp) {
    nextType = "FOLLOW_UP";
    targetMainQNum = currentMainQNum;
    const subChar = String.fromCharCode(97 + followUpCount); // 0 -> 'a', 1 -> 'b'
    targetSubCode = `${currentMainQNum}${subChar}`;

    // Use the SAME day/topic as the parent main question
    const parentMainTurn = history.find(
      (t) => t.type === "MAIN_QUESTION" && t.mainQuestionNumber === currentMainQNum
    );
    const dayNum = parentMainTurn ? parentMainTurn.day : completedDays[0].day;
    targetDay =
      completedDays.find((d) => d.day === dayNum) || completedDays[0];
  } else {
    nextType = "MAIN_QUESTION";
    targetMainQNum = history.length === 0 ? 1 : currentMainQNum + 1;

    // Distribute main questions across completed curriculum days (at least 4 distinct days)
    const dayIndex = (targetMainQNum - 1) % completedDays.length;
    targetDay = completedDays[dayIndex] || completedDays[0];
  }

  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      let prompt = "";
      if (nextType === "FOLLOW-UP" || nextType === "FOLLOW_UP") {
        const lastTurn = history[history.length - 1];
        prompt = `
You are Intervu AI, a senior technical interviewer conducting an adaptive technical interview.

The candidate was asked Main Question ${targetMainQNum}: "${lastTurn?.question}"
Candidate's Answer: "${lastTurn?.answer || "I'm not sure"}"
Evaluation Label: ${lastEvaluationLabel}

IMPORTANT RULES FOR FOLLOW-UP:
1. Do NOT praise the candidate (never say "Good depth" or "Great response" when evaluation is ${lastEvaluationLabel}).
2. This is FOLLOW-UP ${targetSubCode} for Main Question ${targetMainQNum}.
3. Stay directly within the SAME topic: Day ${targetDay.day} (${targetDay.title}).
4. ${
          lastEvaluationLabel === "not_attempted"
            ? "Since the candidate expressed uncertainty ('I'm not sure' or 'I don't know'), narrow down the question into a simpler, specific subquestion to help them start."
            : "Probe the missing, weak, or incorrect part of the candidate's previous response."
        }
5. Keep it conversational and direct (1-2 sentences). Output only the question text.
`;
      } else {
        prompt = `
You are Intervu AI, a senior technical interviewer.

Generate MAIN QUESTION ${targetMainQNum} of 8+.
Curriculum Focus: Day ${targetDay.day}: ${targetDay.title}
Objectives: ${targetDay.objectives?.join("; ") || "Technical mastery"}

Rules:
1. Ask a clear, high-level technical question for Day ${targetDay.day} (${targetDay.title}).
2. Do NOT mention previous evaluation labels.
3. Keep it 1-3 sentences max. Output only the question text.
`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        return {
          question: text,
          day: targetDay.day,
          topic: targetDay.title,
          type: nextType,
          mainQuestionNumber: targetMainQNum,
          subQuestionCode: targetSubCode,
        };
      }
    } catch (err) {
      console.warn("Gemini question generation error, using fallback:", err);
    }
  }

  // Fallback question / follow-up generator
  const fallbackQuestion = getFallbackQuestion(
    targetDay,
    history,
    nextType,
    targetMainQNum,
    targetSubCode,
    lastEvaluationLabel
  );

  return {
    question: fallbackQuestion,
    day: targetDay.day,
    topic: targetDay.title,
    type: nextType,
    mainQuestionNumber: targetMainQNum,
    subQuestionCode: targetSubCode,
  };
}

function getFallbackQuestion(
  dayObj: CurriculumDay,
  history: InterviewTurn[],
  type: "MAIN_QUESTION" | "FOLLOW_UP",
  mainQNum: number,
  subCode?: string,
  lastEval?: AnswerEvaluationLabel
): string {
  if (type === "FOLLOW_UP") {
    const lastTurn = history[history.length - 1];

    if (lastEval === "not_attempted") {
      return `Let's narrow it down for Day ${dayObj.day} (${dayObj.title}). What would be the very first step or basic concept you would apply here?`;
    }
    if (lastEval === "incorrect") {
      return `Let's revisit that concept in ${dayObj.title}. What is the correct definition or architectural pattern for handling this scenario?`;
    }
    return `To build on your response for Day ${dayObj.day}, what specific trade-offs or optimizations would you implement for ${dayObj.title}?`;
  }

  const obj =
    dayObj.objectives && dayObj.objectives.length > 0
      ? dayObj.objectives[(mainQNum - 1) % dayObj.objectives.length]
      : `explain the core architecture of ${dayObj.title}`;

  return `Main Question ${mainQNum}: Regarding Day ${dayObj.day} (${dayObj.title}), how would you implement ${obj.toLowerCase()} in a production system?`;
}

/**
 * Generates final feedback report using evaluation history
 */
export async function generateFeedbackReport(
  candidate: CandidateProfile,
  history: InterviewTurn[]
): Promise<{
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}> {
  const evaluations = history
    .filter((h) => h.evaluation)
    .map((h) => ({
      q: h.question,
      a: h.answer,
      label: h.evaluation?.label,
      topic: h.topic,
      day: h.day,
    }));

  const correctTurns = evaluations.filter((e) => e.label === "correct");
  const gapTurns = evaluations.filter(
    (e) => e.label === "partially_correct" || e.label === "incorrect" || e.label === "not_attempted"
  );

  const strengthsList = Array.from(
    new Set(correctTurns.map((c) => `Demonstrated clear mastery in ${c.topic} (Day ${c.day}).`))
  );
  if (strengthsList.length === 0) {
    strengthsList.push(`Active participation across curriculum evaluation topics.`);
  }

  const gapsList = Array.from(
    new Set(
      gapTurns.map(
        (g) => `Needs further depth in ${g.topic} (Day ${g.day}) - classified as ${g.label}.`
      )
    )
  );

  const nextList = Array.from(
    new Set(gapTurns.map((g) => `Review Day ${g.day} modules: ${g.topic}`))
  );

  const mainQCount = history.filter((h) => h.type === "MAIN_QUESTION").length;

  return {
    summary: `${candidate.member.name} completed an adaptive technical assessment covering ${mainQCount} main questions across ${
      new Set(history.map((h) => h.day)).size
    } curriculum days. Correct responses: ${correctTurns.length}, Areas needing review: ${gapTurns.length}.`,
    strengths: strengthsList.slice(0, 4),
    gaps: gapsList.slice(0, 4),
    next: nextList.length > 0 ? nextList.slice(0, 4) : ["Continue advancing through cohort capstone projects."],
  };
}
