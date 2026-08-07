import Link from "next/link";
import { Sparkles, Brain, ArrowRight, ShieldCheck, Cpu, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-8 pt-16 pb-12 text-center relative z-10">
        <Badge variant="primary" className="mb-6 px-4 py-1.5 text-xs font-semibold rounded-full border border-indigo-500/30">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
          AI Cohort Technical Interviewer
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Personalized AI Technical Interviews for{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
            Learner Growth
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Intervu dynamically adapts technical interview questions based on each learner&apos;s curriculum progress, completed modules, and learning objectives.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="gradient" size="lg">
            <Link href="/dashboard">
              Go to Learner Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/interview">
              Launch Interview Shell
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature Architecture Cards Shell */}
      <section className="container mx-auto px-4 sm:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverGlow>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                <Cpu className="h-5 w-5" />
              </div>
              <CardTitle>Curriculum Driven</CardTitle>
              <CardDescription>
                Reads syllabus structure, topics, and tools to form targeted technical questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Connected via curriculum dataset schema.
            </CardContent>
          </Card>

          <Card hoverGlow>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                <Brain className="h-5 w-5" />
              </div>
              <CardTitle>Adaptive Context</CardTitle>
              <CardDescription>
                Generates intelligent follow-ups based on learner responses and depth of answers.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Maintains multi-turn interview conversation state.
            </CardContent>
          </Card>

          <Card hoverGlow>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Actionable Feedback</CardTitle>
              <CardDescription>
                Produces detailed reports with strengths, weaknesses, and recommended review days.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Structured report schema with clear metrics.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
