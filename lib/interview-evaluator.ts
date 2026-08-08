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

  if (cleaned === "" || cleaned === "skipped by candidate" || cleaned === "[skipped by candidate]") return true;

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
 * STAGE 1: ANSWER EVALUATOR ENGINE
 */
export async function evaluateCandidateAnswer(
  currentQuestion: string,
  candidateAnswer: string,
  dayInfo: CurriculumDayInfo,
  candidate: CandidateProfile,
  history: InterviewTurn[] = [],
  followUpCount: number = 0,
  isSkipped: boolean = false,
  curriculumObjective?: string
): Promise<EvaluationResult> {
  const trimmed = candidateAnswer ? candidateAnswer.trim() : "";
  const isExplicitSkip = isSkipped || checkUncertainty(trimmed);
  const targetObjective = curriculumObjective || dayInfo.objectives?.[0] || dayInfo.title;

  const defaultExpected = generateDefaultExpectedAnswer(currentQuestion, dayInfo, targetObjective);

  // 1. Explicit uncertainty / skip rule (SKIPPED QUESTIONS MUST NEVER TRIGGER FOLLOW-UPS)
  if (isExplicitSkip) {
    return {
      verdict: "not_attempted",
      reasoning: "Candidate skipped or indicated uncertainty for this question.",
      expected_answer: defaultExpected,
      concepts_demonstrated: [],
      concepts_missing: [targetObjective],
      factual_errors: [],
      should_follow_up: false,
    };
  }

  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are a strict senior technical interviewer evaluating a candidate's answer.

EXACT MAIN QUESTION ASKED:
"${currentQuestion}"

CURRICULUM CONTEXT:
- Day ${dayInfo.day}: ${dayInfo.title}
- Target Objective: "${targetObjective}"
- Relevant Curriculum Content: ${dayInfo.objectives?.join("; ") || dayInfo.title}

CANDIDATE ANSWER TO EVALUATE:
"${trimmed}"

EVALUATION INSTRUCTIONS:
1. FIRST, identify the key technical concepts required to answer "${currentQuestion}" based strictly on Target Objective "${targetObjective}".
2. DETERMINE VERDICT:
   - "correct": Candidate answered the substance of what was asked accurately.
   - "partially_correct": Candidate demonstrated relevant knowledge or answered part of a multi-part question, but missed key required elements or was too vague.
   - "incorrect": Answer is wrong, irrelevant, or too generic (e.g., "by testing it").
   - "not_attempted": Explicit skip or uncertainty.
3. EXPECTED ANSWER: Write a concise model answer (1-2 sentences) explaining the key concepts the candidate was expected to demonstrate based strictly on "${targetObjective}".
4. OUTPUT FORMAT: Return ONLY valid JSON:
{
  "verdict": "correct" | "partially_correct" | "incorrect" | "not_attempted",
  "reasoning": "Concise feedback explaining what was demonstrated, missing, or incorrect.",
  "expected_answer": "Concise model answer based strictly on target objective.",
  "concepts_demonstrated": ["concept1"],
  "concepts_missing": ["concept2"],
  "factual_errors": []
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text?.trim();
      const jsonMatch = text?.match(/\{[\s\S]*\}/);

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

        // Skipped / not_attempted must NEVER follow up
        const shouldFollowUp =
          verdict === "partially_correct" && followUpCount === 0;

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
  return fallbackEvaluate(currentQuestion, trimmed, dayInfo, followUpCount, defaultExpected, targetObjective);
}

function generateDefaultExpectedAnswer(
  question: string,
  dayInfo: CurriculumDayInfo,
  targetObjective: string
): string {
  const tools = dayInfo.tools?.join(", ") || "standard tooling";
  return `A complete answer should address ${targetObjective.toLowerCase()} using ${tools}, explaining key implementation steps, trade-offs, and error handling criteria.`;
}

/**
 * Fallback requirement evaluator when LLM API is unavailable.
 */
function fallbackEvaluate(
  question: string,
  answer: string,
  dayInfo: CurriculumDayInfo,
  followUpCount: number,
  defaultExpected: string,
  targetObjective: string
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
        concepts_missing: [targetObjective],
        factual_errors: [],
        should_follow_up: false,
      };
    }

    return {
      verdict: "partially_correct",
      reasoning: "Answer addresses a general aspect of the question but misses specific technical implementation details and metrics.",
      expected_answer: defaultExpected,
      concepts_demonstrated: matchedTech,
      concepts_missing: [targetObjective],
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
      concepts_missing: [targetObjective],
      factual_errors: [],
      should_follow_up: followUpCount === 0,
    };
  }

  return {
    verdict: "correct",
    reasoning: "Answer sufficiently demonstrates technical knowledge and addresses the core requirements of the question.",
    expected_answer: defaultExpected,
    concepts_demonstrated: matchedTech,
    concepts_missing: [],
    factual_errors: [],
    should_follow_up: false,
  };
}
