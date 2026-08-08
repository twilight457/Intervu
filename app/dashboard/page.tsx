"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Award,
  Zap,
} from "lucide-react";
import candidatesDataRaw from "@/data/candidates.json";
import { CandidateProfile, CandidatesData } from "@/types/profile";
import { getStoredCandidate } from "@/lib/candidate-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const data = candidatesDataRaw as CandidatesData;
const defaultCandidate = data.candidates[0];

export default function DashboardPage() {
  const [candidate, setCandidate] = useState<CandidateProfile>(defaultCandidate);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredCandidate();
    if (stored) {
      setCandidate(stored);
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 w-44 bg-muted rounded-xl mx-auto" />
          <div className="h-4 w-60 bg-muted/60 rounded-lg mx-auto" />
        </div>
      </div>
    );
  }

  const { member, missions, signals } = candidate;

  // Extract candidate first name
  const firstName = member.name ? member.name.trim().split(" ")[0] : "Learner";

  // Calculate mission progress dynamically
  const sortedMissions = [...missions].sort((a, b) => a.day - b.day);
  const completedMissionsCount = missions.filter((m) => m.passed).length;
  const totalMissionsCount = missions.length;
  const progressPercentage = Math.round((completedMissionsCount / totalMissionsCount) * 100);

  return (
    <div className="relative w-full min-h-screen bg-background overflow-x-hidden">
      {/* Full-Bleed Theme-Aware Grid Pattern (Spans entire screen width including left/right whitespaces) */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

      {/* Centered Dashboard Content */}
      <div className="relative z-10 py-10 px-4 sm:px-6 space-y-10 max-w-5xl mx-auto">
        {/* 1. Hero Header Section */}
        <section className="space-y-2 pt-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Welcome back, {firstName}!
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            {member.jobRole} &bull; {member.yearsExperience} yrs experience &bull; {member.education}
          </p>
        </section>

        {/* 2. Primary Action Card */}
        <section>
          <Card className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent p-7 sm:p-9 shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-indigo-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                  Ready to test what you&apos;ve learned?
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Your interview will be personalized based on your learning journey and completed curriculum.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="h-12 px-6 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 shrink-0 self-start md:self-center"
              >
                <Link href="/interview" className="inline-flex items-center justify-center gap-2 text-white">
                  <span>Begin Mock Interview</span>
                  <ArrowRight className="h-[18px] w-[18px] shrink-0 text-white" />
                </Link>
              </Button>
            </div>
          </Card>
        </section>

        {/* 3. Cohort Progress Section */}
        <section>
          <Card className="rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-7 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
                Cohort Progress
              </h3>

              <div className="text-xs sm:text-sm text-muted-foreground font-medium leading-none">
                <span className="font-bold text-foreground">
                  {completedMissionsCount} of {totalMissionsCount}
                </span>{" "}
                missions completed ({progressPercentage}%)
              </div>
            </div>

            <Progress
              value={completedMissionsCount}
              max={totalMissionsCount}
              indicatorClassName="bg-gradient-to-r from-indigo-600 to-violet-600"
              className="h-2.5 rounded-full bg-muted"
            />
          </Card>
        </section>

        {/* 4. Learning Signals Section */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
              Learning Signals
            </h3>
            <p className="text-xs text-muted-foreground font-medium">Cohort Performance Overview</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-2xs transition-all duration-200 hover:shadow-xs">
              <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none">
                  Commit Days
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                <div className="text-3xl font-extrabold text-foreground leading-none">{signals.commitDays}</div>
                <p className="text-xs text-muted-foreground leading-normal">Active learning days logged</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-2xs transition-all duration-200 hover:shadow-xs">
              <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none">
                  Missions Completed
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Award className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                <div className="text-3xl font-extrabold text-foreground leading-none">{signals.missionsCompleted}</div>
                <p className="text-xs text-muted-foreground leading-normal">Successfully passed missions</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-2xs transition-all duration-200 hover:shadow-xs">
              <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none">
                  First Try Completions
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                <div className="text-3xl font-extrabold text-foreground leading-none">{signals.missionsFirstTry}</div>
                <p className="text-xs text-muted-foreground leading-normal">Passed on first attempt</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Learning Journey Section */}
        <section className="space-y-4 pb-12">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
              Learning Journey
            </h3>
            <span className="text-xs text-muted-foreground font-medium leading-none">
              {sortedMissions.length} Missions Logged
            </span>
          </div>

          <Card className="rounded-2xl border border-border/70 bg-card/80 shadow-2xs overflow-hidden">
            <div className="divide-y divide-border/60">
              {sortedMissions.map((mission) => {
                const isPassed = mission.passed === true;
                const isSkipped = mission.skipped === true;
                const isFailed = mission.passed === false && !isSkipped;

                return (
                  <div
                    key={`${mission.day}-${mission.title}`}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="inline-flex items-center gap-4">
                      {/* Perfectly centered day square */}
                      <div className="h-10 min-w-[4rem] px-3 rounded-xl bg-muted/80 inline-flex items-center justify-center text-xs font-bold text-foreground leading-none text-center select-none shrink-0">
                        Day {mission.day}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground leading-tight">
                          {mission.title}
                        </h4>
                        {mission.attempts !== undefined && mission.attempts > 0 && (
                          <p className="text-xs text-muted-foreground leading-none">
                            {mission.attempts} {mission.attempts === 1 ? "attempt" : "attempts"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start sm:self-center shrink-0">
                      {isPassed && (
                        <Badge variant="outline" className="h-8 px-3.5 text-xs font-semibold rounded-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="leading-none">Passed</span>
                        </Badge>
                      )}

                      {isSkipped && (
                        <Badge variant="outline" className="h-8 px-3.5 text-xs font-semibold rounded-full border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap">
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="leading-none">Skipped</span>
                        </Badge>
                      )}

                      {isFailed && (
                        <Badge variant="destructive" className="h-8 px-3.5 text-xs font-semibold rounded-full inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap">
                          <XCircle className="h-4 w-4 shrink-0" />
                          <span className="leading-none">Failed</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
