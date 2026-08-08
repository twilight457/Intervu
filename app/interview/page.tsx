"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowRight,
  LogOut,
  Clock,
  AlertCircle,
  FileCheck,
  SkipForward,
} from "lucide-react";
import candidatesDataRaw from "@/data/candidates.json";
import { CandidateProfile, CandidatesData } from "@/types/profile";
import { getStoredCandidate } from "@/lib/candidate-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { IllustratedAvatar } from "@/components/ui/illustrated-avatar";

const data = candidatesDataRaw as CandidatesData;
const defaultCandidate = data.candidates[0];

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  day?: number;
  topic?: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateProfile>(defaultCandidate);
  const [isLoaded, setIsLoaded] = useState(false);

  // Session state
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputAnswer, setInputAnswer] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Candidate Progress & Curriculum Context
  const [currentMainQNumber, setCurrentMainQNumber] = useState(1);
  const [totalPlannedMainQuestions, setTotalPlannedMainQuestions] = useState(8);
  const [activeDay, setActiveDay] = useState<number | undefined>(undefined);
  const [activeTopic, setActiveTopic] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load candidate profile from localStorage
  useEffect(() => {
    const stored = getStoredCandidate();
    const activeCand = stored || defaultCandidate;
    setCandidate(activeCand);

    const sId = `session-${activeCand.member.id}-${Date.now()}`;
    setSessionId(sId);
    setIsLoaded(true);
  }, []);

  // Initialize interview session via POST /api/interview
  useEffect(() => {
    if (!isLoaded || !sessionId || messages.length > 0) return;

    async function initSession() {
      setIsThinking(true);
      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            candidate,
          }),
        });

        const data = await res.json();
        if (data.reply) {
          const mainQNum = data.questionNumber || 1;
          const totalQ = data.totalQuestions || 8;
          const day = data.day;
          const topic = data.topic || "";

          setCurrentMainQNumber(mainQNum);
          setTotalPlannedMainQuestions(totalQ);
          setActiveDay(day);
          setActiveTopic(topic);

          setMessages([
            {
              id: `ai-init-${Date.now()}`,
              sender: "ai",
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              day,
              topic,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to start interview session:", err);
      } finally {
        setIsThinking(false);
      }
    }

    initSession();
  }, [isLoaded, sessionId, candidate, messages.length]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Handle user submitting an answer turn
  const handleSendAnswer = async () => {
    if (!inputAnswer.trim() || isThinking || isEnded) return;

    const userText = inputAnswer.trim();
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newUserMsg: Message = {
      id: `user-msg-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputAnswer("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userText,
        }),
      });

      const data = await res.json();

      if (data.done) {
        setIsEnded(true);
        if (data.feedback) {
          try {
            localStorage.setItem(
              "intervu_feedback_report",
              JSON.stringify(data.feedback)
            );
          } catch (e) {
            console.error("Failed to store feedback report:", e);
          }
        }

        const finalAiMsg: Message = {
          id: `ai-end-${Date.now()}`,
          sender: "ai",
          text:
            data.reply ||
            "Thank you! That completes our technical interview. Click below to view your personalized feedback report.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          day: activeDay,
          topic: activeTopic,
        };
        setMessages((prev) => [...prev, finalAiMsg]);
      } else if (data.reply) {
        const mainQNum = data.questionNumber || currentMainQNumber;
        const totalQ = data.totalQuestions || totalPlannedMainQuestions;
        const day = data.day || activeDay;
        const topic = data.topic || activeTopic;

        setCurrentMainQNumber(mainQNum);
        setTotalPlannedMainQuestions(totalQ);
        setActiveDay(day);
        setActiveTopic(topic);

        const newAiMsg: Message = {
          id: `ai-msg-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          day,
          topic,
        };
        setMessages((prev) => [...prev, newAiMsg]);
      }
    } catch (err) {
      console.error("Failed to send turn answer:", err);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle Skip Question action
  const handleSkipQuestion = async () => {
    if (isThinking || isEnded) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const skipUserMsg: Message = {
      id: `user-skip-${Date.now()}`,
      sender: "user",
      text: "[Question Skipped]",
      timestamp,
    };

    setMessages((prev) => [...prev, skipUserMsg]);
    setInputAnswer("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "skip",
        }),
      });

      const data = await res.json();

      if (data.done) {
        setIsEnded(true);
        if (data.feedback) {
          try {
            localStorage.setItem(
              "intervu_feedback_report",
              JSON.stringify(data.feedback)
            );
          } catch (e) {
            console.error("Failed to store feedback report:", e);
          }
        }

        const finalAiMsg: Message = {
          id: `ai-end-${Date.now()}`,
          sender: "ai",
          text:
            data.reply ||
            "Thank you! That completes our technical interview. Click below to view your personalized feedback report.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          day: activeDay,
          topic: activeTopic,
        };
        setMessages((prev) => [...prev, finalAiMsg]);
      } else if (data.reply) {
        const mainQNum = data.questionNumber || currentMainQNumber;
        const totalQ = data.totalQuestions || totalPlannedMainQuestions;
        const day = data.day || activeDay;
        const topic = data.topic || activeTopic;

        setCurrentMainQNumber(mainQNum);
        setTotalPlannedMainQuestions(totalQ);
        setActiveDay(day);
        setActiveTopic(topic);

        const newAiMsg: Message = {
          id: `ai-msg-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          day,
          topic,
        };
        setMessages((prev) => [...prev, newAiMsg]);
      }
    } catch (err) {
      console.error("Failed to skip question:", err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  const handleEndInterview = () => {
    setShowEndDialog(false);
    router.push("/report");
  };

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
  const firstName = member.name ? member.name.trim().split(" ")[0] : "Learner";

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* 1. Header with Candidate Info & Progress Tracker */}
      <div className="space-y-4 border-b border-slate-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Candidate Details */}
          <div className="flex items-center gap-3.5">
            <IllustratedAvatar
              candidateId={member.id}
              size={44}
              className="rounded-xl border border-slate-700/80 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-50 leading-none">
                  {member.name}
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 px-1.5 h-4 border-slate-800 text-slate-400 bg-slate-900 font-medium"
                >
                  {member.jobRole}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Technical Assessment Session
              </p>
            </div>
          </div>

          {/* Right: End Interview Action */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            {isEnded ? (
              <Button
                onClick={() => router.push("/report")}
                size="sm"
                className="h-10 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs inline-flex items-center justify-center gap-2"
              >
                <FileCheck className="h-4 w-4" />
                <span>View Feedback Report</span>
              </Button>
            ) : (
              <Button
                onClick={() => setShowEndDialog(true)}
                variant="outline"
                size="sm"
                className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white inline-flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4 text-slate-400" />
                <span>End Interview</span>
              </Button>
            )}
          </div>
        </div>

        {/* Candidate-facing Progress Display: "Question X of N" */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Interview Assessment Progress
            </span>
            <span className="text-slate-200 font-bold">
              Question {currentMainQNumber} of {totalPlannedMainQuestions}
            </span>
          </div>
          <Progress
            value={(currentMainQNumber / totalPlannedMainQuestions) * 100}
            max={100}
            indicatorClassName="bg-indigo-500"
            className="h-2 rounded-full bg-slate-900"
          />
        </div>
      </div>

      {/* 2. Main Conversation Area */}
      <Card className="flex-1 rounded-2xl border border-slate-800/80 bg-[#131924]/80 shadow-2xs flex flex-col justify-between overflow-hidden min-h-[480px]">
        {/* Messages Scroll Area */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[560px] scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  isAi ? "justify-start" : "justify-end"
                }`}
              >
                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 space-y-2 text-sm ${
                    isAi
                      ? "bg-slate-900/90 border border-slate-800 text-slate-100 shadow-2xs"
                      : "bg-indigo-950/60 border border-indigo-500/40 text-slate-100 shadow-2xs"
                  }`}
                >
                  {/* Message Header with Day X - Topic Name aligned to each message bubble */}
                  <div className="flex items-center justify-between gap-3 text-xs border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-200">
                        {isAi ? "Intervu Technical Interviewer" : firstName}
                      </span>
                      {isAi && msg.day && msg.topic && (
                        <span className="text-[11px] text-indigo-400 font-medium bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                          Day {msg.day} &middot; {msg.topic}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Spoken Content */}
                  <p className="leading-relaxed font-normal text-slate-100 text-sm sm:text-base whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>

                {/* Candidate Avatar */}
                {!isAi && (
                  <IllustratedAvatar
                    candidateId={member.id}
                    size={40}
                    className="rounded-xl border border-slate-700/80 shrink-0"
                  />
                )}
              </div>
            );
          })}

          {/* AI Thinking Indicator */}
          {isThinking && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in-50 duration-200">
              <div className="rounded-2xl p-4 bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <span>Interviewer is evaluating response...</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Text Input & Response Controls */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {isEnded ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-slate-300 font-medium">
                Interview completed! Your technical evaluation report is ready.
              </p>
              <Button
                onClick={() => router.push("/report")}
                size="lg"
                className="h-11 px-8 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md inline-flex items-center justify-center gap-2"
              >
                <span>View Feedback Report</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative flex items-center">
                <textarea
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your technical response... (Press Enter to send, Shift+Enter for newlines)"
                  disabled={isThinking}
                  rows={3}
                  className="w-full p-3.5 pr-28 bg-[#0b0f17] border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm leading-relaxed resize-none shadow-2xs"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {/* Skip Question Button */}
                  <Button
                    onClick={handleSkipQuestion}
                    disabled={isThinking}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs font-medium rounded-lg border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-1.5"
                    title="Skip current question"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Skip</span>
                  </Button>

                  {/* Send Answer Button */}
                  <Button
                    onClick={handleSendAnswer}
                    disabled={!inputAnswer.trim() || isThinking}
                    size="icon"
                    className="h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send Answer</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                <span>Shift + Enter for newlines</span>
                <span>You can skip a question anytime to move forward</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* End Interview Dialog Confirmation Modal */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-md bg-[#131924] border border-slate-800 text-slate-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-50 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              End Interview Early?
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm pt-2 leading-relaxed">
              Are you sure you want to end the technical interview session? Ending now will generate your feedback report based on responses so far.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEndDialog(false)}
              className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Resume Interview
            </Button>
            <Button
              onClick={handleEndInterview}
              className="h-10 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
            >
              End &amp; View Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
