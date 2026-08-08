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
  const defaultExpected = generateDefaultExpectedAnswer(currentQuestion, dayInfo);

  // 1. SKIPPED OR EMPTY ANSWER -> not_attempted
  if (isSkipped || trimmed === "" || trimmed.toLowerCase() === "[skipped by candidate]") {
    return {
      verdict: "not_attempted",
      reasoning: "Candidate explicitly skipped the question or submitted no response.",
      concepts_demonstrated: [],
      concepts_missing: dayInfo.objectives || [dayInfo.title],
      factual_errors: [],
      should_follow_up: false,
      expected_answer: defaultExpected,
    };
  }

  const isUncertain = checkUncertainty(trimmed);

  // 2. Explicit "I don't know" / "I'm not sure" -> not_attempted
  if (isUncertain) {
    return {
      verdict: "not_attempted",
      reasoning: "Candidate expressed uncertainty without technical explanation.",
      concepts_demonstrated: [],
      concepts_missing: dayInfo.objectives || [dayInfo.title],
      factual_errors: [],
      should_follow_up: followUpCount === 0,
      expected_answer: defaultExpected,
    };
  }

  // 3. Gemini AI Rigorous Evaluation Engine
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are Stage 1: Technical Answer Evaluator for an AI engineering interview.

EVALUATION PROCEDURE:
1. Identify the key technical requirements that a satisfactory answer MUST address based on:
   - Question Asked: "${currentQuestion}"
   - Curriculum Objectives: ${dayInfo.objectives?.join("; ") || dayInfo.title}
   - Topic Context: Day ${dayInfo.day} - ${dayInfo.title}
2. Evaluate Candidate's Answer: "${trimmed}" strictly against those specific requirements.
3. Formulate a concise model "expected_answer" (2-3 sentences max) explaining the key concepts the candidate was expected to demonstrate, based strictly on the curriculum objective.

CLASSIFICATION RULES:
- "correct": The answer demonstrates required technical knowledge AND sufficiently addresses ALL major components of the question asked.
- "partially_correct": The answer demonstrates some relevant knowledge or addresses ONLY ONE part of a multi-part question, BUT is incomplete or vague.
- "incorrect": The answer is wrong, irrelevant, too vague to demonstrate knowledge (e.g. "I would test it", "by testing it against the platform"), or fails to answer what was asked.
- "not_attempted": The candidate explicitly skipped or expressed complete uncertainty ("dont know", "not sure").

Return ONLY JSON matching this schema:
{
  "verdict": "correct" | "partially_correct" | "incorrect" | "not_attempted",
  "reasoning": "Detailed technical justification explaining why the answer satisfies or fails the question's specific requirements",
  "expected_answer": "Concise model response addressing the question requirements based on curriculum objectives",
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

        const shouldFollowUp =
          (verdict === "partially_correct" || verdict === "not_attempted") &&
          followUpCount === 0;

        return {
          verdict,
          reasoning: parsed.reasoning || "Evaluated against technical requirements.",
          expected_answer: parsed.expected_answer || defaultExpected,
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

  // 4. Fallback Requirement Evaluator
  return fallbackEvaluate(currentQuestion, trimmed, dayInfo, followUpCount, defaultExpected);
}

function generateDefaultExpectedAnswer(question: string, dayInfo: CurriculumDayInfo): string {
  const obj = dayInfo.objectives?.[0] || dayInfo.title;
  const tools = dayInfo.tools?.join(", ") || "standard tooling";
  return `A complete answer should address ${obj.toLowerCase()} using ${tools}, explaining key implementation steps, trade-offs, and error handling criteria.`;
}

/**
 * Fallback requirement evaluator when LLM API is unavailable.
 */
function fallbackEvaluate(
  question: string,
  answer: string,
  dayInfo: CurriculumDayInfo,
  followUpCount: number,
  defaultExpected: string
): EvaluationResult {
  const qLower = question.toLowerCase();
  const aLower = answer.toLowerCase();
  const words = aLower.split(/\s+/).filter((w) => w.length > 2);

  const coreTechTerms = [
    "embedding", "vector", "distance", "cosine", "hnsw", "database", "rag",
    "retrieval", "chunk", "prompt", "llm", "api", "fastapi", "docker", "agent",
    "mcp", "schema", "validation", "pydantic", "langchain", "crewai", "ragas",
    "accuracy", "faithfulness", "latency", "hallucination", "scenario", "metric",
    "jwt", "oauth", "auth", "token", "virtualenv", "venv", "pytest",
  ];

  const matchedTech = coreTechTerms.filter((term) => aLower.includes(term));

  const isVagueOrGeneric =
    words.length < 12 ||
    aLower.startsWith("by testing") ||
    aLower === "i would test it" ||
    matchedTech.length === 0;

  if (isVagueOrGeneric) {
    if (matchedTech.length === 0) {
      return {
        verdict: "incorrect",
        reasoning: "Answer is too vague or generic to demonstrate technical knowledge of the question requirements.",
        expected_answer: defaultExpected,
        concepts_demonstrated: [],
        concepts_missing: dayInfo.objectives || [dayInfo.title],
        factual_errors: [],
        should_follow_up: false,
      };
    }

    return {
      verdict: "partially_correct",
      reasoning: "Answer addresses a general aspect of the question but misses specific technical implementation details and metrics.",
      expected_answer: defaultExpected,
      concepts_demonstrated: matchedTech,
      concepts_missing: dayInfo.objectives || [dayInfo.title],
      factual_errors: [],
      should_follow_up: followUpCount === 0,
    };
  }

  const isMultiPart = qLower.includes(" and ") || (qLower.includes("what") && qLower.includes("how"));

  if (isMultiPart && matchedTech.length < 3) {
    return {
      verdict: "partially_correct",
      reasoning: "Answer addresses part of the question but fails to cover all required technical components.",
      expected_answer: defaultExpected,
      concepts_demonstrated: matchedTech,
      concepts_missing: dayInfo.objectives || [dayInfo.title],
      factual_errors: [],
      should_follow_up: followUpCount === 0,
    };
  }

  return {
    verdict: "correct",
    reasoning: "Answer sufficiently demonstrates technical knowledge and addresses the core requirements of the question.",
    expected_answer: defaultExpected,
    concepts_demonstrated: matchedTech.length > 0 ? matchedTech : [dayInfo.title],
    concepts_missing: [],
    factual_errors: [],
    should_follow_up: false,
  };
}
