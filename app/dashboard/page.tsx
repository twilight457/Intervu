import Link from "next/link";
import { LayoutDashboard, UserCheck, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold tracking-tight">Learner Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Select a candidate profile to view progress and initiate adaptive technical interviews.
          </p>
        </div>

        <Button asChild variant="gradient">
          <Link href="/interview">
            Start Technical Interview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Metrics Shell */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidate Selection
            </CardTitle>
            <UserCheck className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Profile Selector</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for candidate profiles dataset integration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Curriculum Scope
            </CardTitle>
            <BookOpen className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AI Cohort Syllabus</div>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 4 curriculum days coverage ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interview Config
            </CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8+ Questions</div>
            <p className="text-xs text-muted-foreground mt-1">
              Adaptive follow-up question pipeline ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learner Profile & Module Progress Container Shell */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Learner Profile & Curriculum Alignment</CardTitle>
              <CardDescription className="mt-1">
                This container will populate with candidate modules, completed topics, skipped items, and interview history once data is loaded.
              </CardDescription>
            </div>
            <Badge variant="outline">Awaiting Data Load</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed border-border rounded-xl p-12 text-center bg-muted/20">
            <UserCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              Learner Profile Interface Shell
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Select learner profile from candidate JSON data in future prompt to begin interview session.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
