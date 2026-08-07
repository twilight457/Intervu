import Link from "next/link";
import { Brain, MessageSquare, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InterviewPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Top Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">Adaptive Interview Session</h1>
            <Badge variant="primary" className="ml-2">Live Shell</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Session Tracker
              </CardTitle>
              <CardDescription>Target: Min 8 questions spanning 4+ days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Current Candidate</span>
                <Badge variant="outline">Unselected</Badge>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Questions Answered</span>
                <span className="font-semibold">0 / 8+</span>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Curriculum Days</span>
                <span className="font-semibold">0 / 4</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Adaptive Follow-ups</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Curriculum Context Shell</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                When an interview starts, the active topic, day objectives, and expected key concepts will display here.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Conversation Workspace Shell */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px] flex flex-col justify-between">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  <CardTitle className="text-base">Interview Dialogue Container</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  Context Maintained
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-3 max-w-md">
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Interview Interface Shell Ready
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
