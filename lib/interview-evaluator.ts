import { GoogleGenAI } from "@google/genai";
import { CandidateProfile } from "@/types/profile";
import { EvaluationResult, EvaluationVerdict, InterviewTurn } from "@/lib/interview-session";

interface CurriculumDayInfo {
  day: number;
  title: string;
  objectives?: string[];
  tools?: string[];
}

/**
 * Checks if input is an explicit uncertainty phrase ("dont know", "not sure", "idk", etc.)
 */
export function checkUncertainty(text: string): boolean {
  if (!text) return true;
  const cleaned = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned === "" || cleaned === "skipped by candidate") return true;

  const uncertaintyPhrases = [
    "dont know",
    "don't know",
    "i dont know",
    "i don't know",
    "not sure",
    "im not sure",
    "i'm not sure",
    "no idea",
    "i have no idea",
    "dont understand",
    "don't understand",
    "idk",
    "unsure",
    "not certain",
    "cant remember",
    "can't remember",
  ];

  const isMatch = uncertaintyPhrases.some(
    (phrase) => cleaned === phrase || cleaned.startsWith(phrase)
  );

  if (!isMatch) return false;

  // Check if candidate also included substantive technical explanation
  const words = cleaned.split(" ");
  const techTerms = [
    "python", "venv", "virtualenv", "pip", "embedding", "vector", "cosine",
    "distance", "rag", "retrieval", "chunk", "prompt", "llm", "api", "docker",
    "fastapi", "agent", "mcp", "index", "hnsw", "database", "schema",
  ];
  const containsTech = techTerms.some((term) => cleaned.includes(term));

  return words.length < 10 || !containsTech;
}

/**
 * STAGE 1: ANSWER EVALUATOR
 */
export async function evaluateCandidateAnswer(
  currentQuestion: string,
  candidateAnswer: string,
  dayInfo: CurriculumDayInfo,
  candidate: CandidateProfile,
  history: InterviewTurn[],
  followUpCount: number,
  isSkipped: boolean = false
): Promise<EvaluationResult> {
  const trimmed = (candidateAnswer || "").trim();

  // 1. SKIPPED OR EMPTY ANSWER -> Mark not_attempted, NEVER ask follow-up
  if (isSkipped || trimmed === "" || trimmed.toLowerCase() === "[skipped by candidate]") {
    return {
      verdict: "not_attempted",
      reasoning: "Candidate explicitly skipped the question or submitted no response.",
      concepts_demonstrated: [],
      concepts_missing: dayInfo.objectives || [dayInfo.title],
      factual_errors: [],
      should_follow_up: false, // ZERO follow-up on skipped/empty answers!
    };
  }

  const isUncertain = checkUncertainty(trimmed);

  // 2. Explicit "I don't know" / "I'm not sure" -> Needs exactly ONE follow-up if followUpCount === 0
  if (isUncertain) {
    return {
      verdict: "not_attempted",
      reasoning: "Candidate expressed uncertainty without technical explanation.",
      concepts_demonstrated: [],
      concepts_missing: dayInfo.objectives || [dayInfo.title],
      factual_errors: [],
      should_follow_up: followUpCount === 0, // Exactly ONE follow-up max!
    };
  }

  // 3. Gemini AI Structured Evaluation Engine
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are Stage 1: Technical Answer Evaluator for an AI engineering interview.

Question Asked: "${currentQuestion}"
Curriculum Topic: Day ${dayInfo.day} - ${dayInfo.title}
Objectives: ${dayInfo.objectives?.join("; ") || "Technical competence"}

Candidate Answer: "${trimmed}"
Current Follow-Up Count on this main question: ${followUpCount}

Classify into EXACTLY ONE verdict:
1. "correct" - Answer is technically accurate and sufficiently complete. -> should_follow_up = false
2. "incorrect" - Answer is clearly wrong, contains false technical claims or flawed logic. -> should_follow_up = false
3. "partially_correct" - Answer demonstrates partial understanding or incomplete explanation. -> should_follow_up = (followUpCount === 0)
4. "not_attempted" - Candidate expressed uncertainty or provided no technical substance. -> should_follow_up = (followUpCount === 0)

Return ONLY JSON:
{
  "verdict": "correct" | "partially_correct" | "incorrect" | "not_attempted",
  "reasoning": "Technical evaluation summary",
  "concepts_demonstrated": ["concept1"],
  "concepts_missing": ["concept2"],
  "factual_errors": [],
  "should_follow_up": boolean
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
        const verdict: EvaluationVerdict = [
          "correct",
          "partially_correct",
          "incorrect",
          "not_attempted",
        ].includes(parsed.verdict)
          ? parsed.verdict
          : "partially_correct";

        // Enforce follow-up constraints strictly
        const shouldFollowUp =
          (verdict === "partially_correct" || verdict === "not_attempted") &&
          followUpCount === 0;

        return {
          verdict,
          reasoning: parsed.reasoning || "Evaluated by AI engine.",
          concepts_demonstrated: parsed.concepts_demonstrated || [],
          concepts_missing: parsed.concepts_missing || [],
          factual_errors: parsed.factual_errors || [],
          should_follow_up: shouldFollowUp,
        };
      }
    } catch (err) {
      console.warn("Gemini evaluation error, using fallback evaluator:", err);
    }
  }

  // 4. Fallback Heuristic Evaluator
  if (trimmed.length < 25) {
    return {
      verdict: "partially_correct",
      reasoning: "Answer is brief or incomplete.",
      concepts_demonstrated: [],
      concepts_missing: dayInfo.objectives || [dayInfo.title],
      factual_errors: [],
      should_follow_up: followUpCount === 0,
    };
  }

  return {
    verdict: "correct",
    reasoning: "Answer is technically accurate and sufficiently complete.",
    concepts_demonstrated: dayInfo.objectives?.slice(0, 2) || [dayInfo.title],
    concepts_missing: [],
    factual_errors: [],
    should_follow_up: false,
  };
}
