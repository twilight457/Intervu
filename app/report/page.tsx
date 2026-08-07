import Link from "next/link";
import { FileCheck, Award, AlertTriangle, Lightbulb, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-8 px-4 sm:px-6 space-y-8 max-w-5xl mx-auto">
      {/* Report Header Shell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="h-5 w-5 text-indigo-400" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-50">Technical Feedback Report</h1>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Structured evaluation detailing strengths, weaknesses, recommended review days, and overall score.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Score Overview Cards Container Shell */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-indigo-400">
              Overall Score
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-50">&mdash; / 100</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 font-medium">
            Composite evaluation metric
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Technical Accuracy
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-50">&mdash; %</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 font-medium">
            Concept alignment
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Problem Solving
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-50">&mdash; %</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 font-medium">
            Adaptive query responses
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Curriculum Days
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-50">&mdash; / 4+</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 font-medium">
            Days evaluated
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback Sections Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths Container */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-slate-50">Identified Strengths</CardTitle>
            </div>
            <CardDescription className="text-slate-400">Topics where the candidate demonstrated strong mastery.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-900/40">
              <p className="text-xs text-slate-400 font-medium">
                Strengths breakdown will populate here upon interview completion.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weaknesses Container */}
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-slate-50">Areas for Improvement</CardTitle>
            </div>
            <CardDescription className="text-slate-400">Topics requiring further study or clarification.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-900/40">
              <p className="text-xs text-slate-400 font-medium">
                Knowledge gaps and missed concepts will populate here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Review Days Shell */}
      <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-slate-50">Recommended Review Days</CardTitle>
            </div>
            <Badge variant="outline" className="border-slate-800 text-slate-400">Targeted Learning</Badge>
          </div>
          <CardDescription className="text-slate-400">Curriculum days prioritized for candidate review based on interview answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed border-slate-800 rounded-xl p-10 text-center bg-slate-900/40">
            <RefreshCw className="h-8 w-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              Day-by-day curriculum recommendations ready for interview evaluation generator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
