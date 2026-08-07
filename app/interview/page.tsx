import Link from "next/link";
import { Brain, MessageSquare, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-8 px-4 sm:px-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">Adaptive Interview Session</h1>
            <Badge variant="outline" className="ml-2 border-indigo-800/80 text-indigo-400 bg-indigo-950/40">Live Workspace</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Personalized technical evaluation aligned with AI cohort curriculum objectives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Exit to Dashboard</Link>
          </Button>
          <Button asChild variant="gradient" size="sm">
            <Link href="/report">
              View Report Shell
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Interview Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Session Context & Progress Shell */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-50">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Session Tracker
              </CardTitle>
              <CardDescription className="text-slate-400">Target: Min 8 questions spanning 4+ days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400 font-medium">Current Candidate</span>
                <Badge variant="outline" className="border-slate-800 text-slate-300 bg-slate-900">Loaded Profile</Badge>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400 font-medium">Questions Answered</span>
                <span className="font-semibold text-slate-100">0 / 8+</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400 font-medium">Curriculum Days</span>
                <span className="font-semibold text-slate-100">0 / 4</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Adaptive Follow-ups</span>
                <Badge variant="secondary" className="bg-slate-800 text-slate-300">Ready</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-50">Curriculum Context Shell</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2 font-medium">
              <p>
                When an interview starts, the active topic, day objectives, and expected key concepts will display here.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Conversation Workspace Shell */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px] flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#131924]/80">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  <CardTitle className="text-base text-slate-50">Interview Dialogue Container</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs border-slate-800 text-slate-400">
                  Context Maintained
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-3 max-w-md">
                <div className="h-12 w-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-indigo-400 border border-slate-700/60">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-50">
                  Interview Interface Shell Ready
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  The AI interviewer conversation pipeline, input response field, and dynamic evaluation triggers will render here when an interview is initiated.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
