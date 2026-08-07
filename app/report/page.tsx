import Link from "next/link";
import { FileCheck, Award, AlertTriangle, Lightbulb, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReportPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Report Header Shell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold tracking-tight">Technical Feedback Report</h1>
          </div>
          <p className="text-muted-foreground text-sm">
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
        <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              Overall Score
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">&mdash; / 100</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Composite evaluation metric
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Technical Accuracy
            </CardDescription>
            <CardTitle className="text-2xl font-bold">&mdash; %</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Concept alignment
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Problem Solving
            </CardDescription>
            <CardTitle className="text-2xl font-bold">&mdash; %</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Adaptive query responses
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Curriculum Days
            </CardDescription>
            <CardTitle className="text-2xl font-bold">&mdash; / 4+</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Days evaluated
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback Sections Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths Container */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              <CardTitle>Identified Strengths</CardTitle>
            </div>
            <CardDescription>Topics where the candidate demonstrated strong mastery.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed border-border rounded-lg p-8 text-center bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Strengths breakdown will populate here upon interview completion.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weaknesses Container */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Areas for Improvement</CardTitle>
            </div>
            <CardDescription>Topics requiring further study or clarification.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed border-border rounded-lg p-8 text-center bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Knowledge gaps and missed concepts will populate here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Review Days Shell */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-500" />
              <CardTitle>Recommended Review Days</CardTitle>
            </div>
            <Badge variant="outline">Targeted Learning</Badge>
          </div>
          <CardDescription>Curriculum days prioritized for candidate review based on interview answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed border-border rounded-lg p-10 text-center bg-muted/20">
            <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Day-by-day curriculum recommendations ready for interview evaluation generator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
