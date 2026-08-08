import { evaluateCandidateAnswer } from '../lib/interview-evaluator';

async function runTests() {
  const dayInfo = {
    day: 28,
    title: 'Evaluation & Testing',
    objectives: ['Evaluate the chatbot using real-world scenarios and performance metrics'],
    tools: ['Ragas', 'DeepEval', 'Python']
  };

  const candidate = {
    member: { id: 'CAND-001', name: 'Sarah', jobRole: 'AI Engineer' },
    missions: []
  };

  const questionMulti = "What are embeddings, why are they useful for semantic search, and how are they stored for efficient retrieval?";
  const questionEval = "How would you evaluate a system using realistic scenarios, and what specific metrics or behaviors would you measure when assessing performance?";

  // 1. Strong complete answer
  const res1 = await evaluateCandidateAnswer(
    questionEval,
    "I would create realistic user scenarios, run the chatbot against them, and measure metrics such as answer correctness, relevance, latency, and hallucination rate.",
    dayInfo, candidate, [], 0
  );
  console.log("TEST 1 (Strong complete answer):", res1.verdict, "| Reasoning:", res1.reasoning);

  // 2. Vague but related answer ("by testing it against the platform")
  const res2 = await evaluateCandidateAnswer(
    questionEval,
    "by testing it against the platform",
    dayInfo, candidate, [], 0
  );
  console.log("TEST 2 (Vague answer 'by testing it against the platform'):", res2.verdict, "| Reasoning:", res2.reasoning);

  // 3. Completely irrelevant answer
  const res3 = await evaluateCandidateAnswer(
    questionEval,
    "CSS flexbox is used to align items horizontally in web design.",
    dayInfo, candidate, [], 0
  );
  console.log("TEST 3 (Irrelevant answer):", res3.verdict, "| Reasoning:", res3.reasoning);

  // 4. "I don't know"
  const res4 = await evaluateCandidateAnswer(
    questionEval,
    "I don't know",
    dayInfo, candidate, [], 0
  );
  console.log("TEST 4 ('I don't know'):", res4.verdict, "| Reasoning:", res4.reasoning);

  // 5. Technically true statement addressing only one part of multi-part question
  const res5 = await evaluateCandidateAnswer(
    questionMulti,
    "Embeddings represent text as vectors.",
    dayInfo, candidate, [], 0
  );
  console.log("TEST 5 (True statement addressing only 1 part):", res5.verdict, "| Reasoning:", res5.reasoning);

  // 6. Strong answer addressing all major parts of multi-part question
  const res6 = await evaluateCandidateAnswer(
    questionMulti,
    "Embeddings represent text as dense numerical vectors that capture semantic relationships. They allow semantic similarity search, and the resulting vectors can be stored in a vector database using an index such as HNSW for efficient nearest-neighbor retrieval.",
    dayInfo, candidate, [], 0
  );
  console.log("TEST 6 (Strong multi-part answer):", res6.verdict, "| Reasoning:", res6.reasoning);
}

runTests();
