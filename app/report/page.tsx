"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  BookOpen,
  Award,
  BrainCircuit,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import candidatesDataRaw from "@/data/candidates.json";
import { CandidateProfile, CandidatesData } from "@/types/profile";
import { getStoredCandidate } from "@/lib/candidate-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IllustratedAvatar } from "@/components/ui/illustrated-avatar";
import {
  QuestionEvaluationReportItem,
  InterviewFeedbackReport,
  EvaluationVerdict,
} from "@/lib/interview-session";

const data = candidatesDataRaw as CandidatesData;
const defaultCandidate = data.candidates[0];

export default function ReportPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateProfile>(defaultCandidate);
  const [report, setReport] = useState<InterviewFeedbackReport | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load stored candidate profile
    const stored = getStoredCandidate();
    const activeCand = stored || defaultCandidate;
    setCandidate(activeCand);

    // Load persisted interview feedback report from localStorage
    try {
      const storedReportStr = localStorage.getItem("intervu_feedback_report");
      if (storedReportStr) {
        const parsedReport: InterviewFeedbackReport = JSON.parse(storedReportStr);
        setReport(parsedReport);
      }
    } catch (err) {
      console.error("Failed to load interview feedback report:", err);
    }

    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse space-y-3 text-center">
          <div className="h-8 w-40 bg-slate-800 rounded-lg mx-auto" />
          <div className="h-3.5 w-56 bg-slate-800/60 rounded-md mx-auto" />
        </div>
      </div>
    );
  }

  const { member } = candidate;

  // Helper styling functions for evaluation verdicts
  const getVerdictBadge = (verdict: EvaluationVerdict) => {
    switch (verdict) {
      case "correct":
        return (
          <Badge className="bg-emerald-950/80 border-emerald-600/80 text-emerald-400 font-semibold inline-flex items-center gap-1.5 px-2.5 py-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Correct
          </Badge>
        );
      case "partially_correct":
        return (
          <Badge className="bg-amber-950/80 border-amber-600/80 text-amber-400 font-semibold inline-flex items-center gap-1.5 px-2.5 py-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Partially Correct
          </Badge>
        );
      case "incorrect":
        return (
          <Badge className="bg-rose-950/80 border-rose-600/80 text-rose-400 font-semibold inline-flex items-center gap-1.5 px-2.5 py-1">
            <XCircle className="h-3.5 w-3.5" />
            Incorrect
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-900 border-slate-700 text-slate-400 font-semibold inline-flex items-center gap-1.5 px-2.5 py-1">
            <HelpCircle className="h-3.5 w-3.5" />
            Not Attempted
          </Badge>
        );
    }
  };

  const getStatusBoxStyle = (verdict: EvaluationVerdict, isSelected: boolean) => {
    const base = "h-12 w-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all cursor-pointer border shadow-2xs";
    const selectedBorder = isSelected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0b0f17] scale-105" : "";

    switch (verdict) {
      case "correct":
        return `${base} bg-emerald-950/80 border-emerald-600/80 text-emerald-400 hover:bg-emerald-900/80 ${selectedBorder}`;
      case "partially_correct":
        return `${base} bg-amber-950/80 border-amber-600/80 text-amber-400 hover:bg-amber-900/80 ${selectedBorder}`;
      case "incorrect":
        return `${base} bg-rose-950/80 border-rose-600/80 text-rose-400 hover:bg-rose-900/80 ${selectedBorder}`;
      default:
        return `${base} bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 ${selectedBorder}`;
    }
  };

  const questions: QuestionEvaluationReportItem[] = report?.questionEvaluations || [];
  const selectedQuestion = questions[selectedQuestionIndex] || questions[0];
  const overallScore = report?.overallScore ?? 0;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-8 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <IllustratedAvatar
            candidateId={member.id}
            size={52}
            className="rounded-2xl border border-slate-700/80 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-50">
                {member.name}
              </h1>
              <Badge
                variant="outline"
                className="text-xs py-0.5 px-2 border-slate-800 text-slate-400 bg-slate-900 font-medium"
              >
                {member.jobRole}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-2">
              <span>{member.education}</span>
              <span>&middot;</span>
              <span>{member.yearsExperience} Experience</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 shadow-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {/* 2. Overall Score Card */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#131924] p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center gap-2.5 justify-center sm:justify-start">
              <Award className="h-6 w-6 text-indigo-400 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight">
                Interview Results
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl leading-relaxed">
              Technical assessment across {questions.length} questions.
            </p>
          </div>

          {/* Prominent Score Pill */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 shrink-0 min-w-[140px]">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-400 tracking-tight">
              {overallScore}%
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Overall Score
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Progress
            value={overallScore}
            max={100}
            indicatorClassName="bg-indigo-500"
            className="h-2.5 rounded-full bg-slate-900"
          />
        </div>
      </Card>

      {/* 3. Question Evaluation Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <BrainCircuit className="h-4.5 w-4.5 text-indigo-400" />
            Question Evaluation Overview
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Partial
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Incorrect
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> Skipped
            </span>
          </div>
        </div>

        {/* Numbered Status Boxes Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {questions.map((q, idx) => {
            const isSelected = idx === selectedQuestionIndex;
            return (
              <button
                key={`q-box-${q.mainQuestionNumber}`}
                onClick={() => setSelectedQuestionIndex(idx)}
                className={getStatusBoxStyle(q.finalVerdict, isSelected)}
              >
                <span>Q{q.mainQuestionNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Main Question Details Card */}
      {selectedQuestion && (
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924] p-6 space-y-6 shadow-sm">
          {/* Question Header & Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Question {selectedQuestion.mainQuestionNumber} of {questions.length}
                </span>
                <span className="text-slate-600">&middot;</span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-indigo-400" />
                  Day {selectedQuestion.curriculumDay} &middot; {selectedQuestion.curriculumTopic}
                </span>
              </div>
            </div>

            <div>{getVerdictBadge(selectedQuestion.finalVerdict)}</div>
          </div>

          {/* Main Question Text */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Main Question
            </h4>
            <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {selectedQuestion.question}
            </p>
          </div>

          {/* Candidate Main Answer */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Candidate Response
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
              {selectedQuestion.candidateAnswer}
            </p>
          </div>

          {/* Expected / Model Answer (Shown ONLY for non-correct responses: PARTIALLY_CORRECT, INCORRECT, NOT_ATTEMPTED) */}
          {selectedQuestion.finalVerdict !== "correct" && selectedQuestion.expectedAnswer && (
            <div className="space-y-2 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Expected Answer (Curriculum Model Response)</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-amber-900/40">
                {selectedQuestion.expectedAnswer}
              </p>
            </div>
          )}

          {/* Grouped Follow-Up Section (If follow-up was asked) */}
          {selectedQuestion.followUpQuestion && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <MessageSquare className="h-4 w-4" />
                <span>Targeted Follow-Up Question</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-300">
                  {selectedQuestion.followUpQuestion}
                </p>
                <div className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-indigo-900/40">
                  <span className="text-slate-400 font-semibold block mb-1">Follow-Up Answer:</span>
                  {selectedQuestion.followUpAnswer || "[No answer provided]"}
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Analysis & Feedback */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Evaluation Analysis &amp; Feedback
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              {selectedQuestion.evaluationReasoning}
            </p>
          </div>
        </Card>
      )}

      {/* 5. Feedback Analysis Grid: Strengths, Needs Improvement, Recommended Review */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths Card */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Key Strengths</h3>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {report?.strengths && report.strengths.length > 0 ? (
              report.strengths.map((str, i) => (
                <li key={`str-${i}`} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No specific strengths recorded.</li>
            )}
          </ul>
        </Card>

        {/* Needs Improvement Card */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <div className="h-8 w-8 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Needs Improvement</h3>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {report?.gaps && report.gaps.length > 0 ? (
              report.gaps.map((gap, i) => (
                <li key={`gap-${i}`} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{gap}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No major gaps identified.</li>
            )}
          </ul>
        </Card>

        {/* Recommended Review Card */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Recommended Review</h3>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {report?.next && report.next.length > 0 ? (
              report.next.map((item, i) => (
                <li key={`next-${i}`} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed font-medium text-slate-200">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No additional review required!</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
