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
        <div className="animate-pulse space-y-3 text-center">
          <div className="h-8 w-40 bg-slate-800 rounded-lg mx-auto" />
          <div className="h-3.5 w-56 bg-slate-800/60 rounded-md mx-auto" />
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
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-8 px-4 sm:px-6 space-y-8 max-w-5xl mx-auto">
      {/* 1. Personalized Hero Header Section */}
      <section className="space-y-1.5 pt-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50 leading-tight">
          Welcome back, {firstName}!
        </h1>

        <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
          {member.jobRole} &bull; {member.yearsExperience} yrs experience &bull; {member.education}
        </p>
      </section>

      {/* 2. Primary Action Card */}
      <section>
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/90 p-7 sm:p-9 shadow-xs transition-all duration-150 hover:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 leading-snug">
                Ready to test what you&apos;ve learned?
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
                Your interview will be personalized based on your learning journey and completed curriculum.
              </p>
            </div>

            {/* Reverted Original Indigo CTA Button */}
            <Button
              asChild
              size="lg"
              className="h-12 px-6 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 shrink-0 self-start md:self-center transition-all"
            >
              <Link href="/interview" className="inline-flex items-center justify-center gap-2 text-white">
                <span>Begin Mock Interview</span>
                <ArrowRight className="h-[18px] w-[18px] shrink-0 text-white" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* 3. Cohort Progress Section (Reverted original indigo indicator) */}
      <section>
        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/90 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold tracking-tight text-slate-50 leading-none">
              Cohort Progress
            </h3>

            <div className="text-xs sm:text-sm text-slate-400 font-medium leading-none">
              <span className="font-bold text-slate-50">
                {completedMissionsCount} of {totalMissionsCount}
              </span>{" "}
              missions completed ({progressPercentage}%)
            </div>
          </div>

          <Progress
            value={completedMissionsCount}
            max={totalMissionsCount}
            indicatorClassName="bg-indigo-500"
            className="h-2.5 rounded-full bg-slate-900"
          />
        </Card>
      </section>

      {/* 4. Learning Signals Section */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold tracking-tight text-slate-50 leading-none">Learning Signals</h3>
          <p className="text-xs text-slate-400 font-medium">Cohort Performance Overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/90 p-5 shadow-xs transition-all duration-150 hover:border-slate-700">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none">
                Commit Days
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-slate-800/80 text-slate-300 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-slate-50 leading-none">{signals.commitDays}</div>
              <p className="text-xs text-slate-400 mt-1">Active learning days logged</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/90 p-5 shadow-xs transition-all duration-150 hover:border-slate-700">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none">
                Missions Completed
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-slate-800/80 text-slate-300 flex items-center justify-center shrink-0">
                <Award className="h-4 w-4 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-slate-50 leading-none">{signals.missionsCompleted}</div>
              <p className="text-xs text-slate-400 mt-1">Successfully passed missions</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/90 p-5 shadow-xs transition-all duration-150 hover:border-slate-700">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none">
                First Try Completions
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-slate-800/80 text-slate-300 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-slate-50 leading-none">{signals.missionsFirstTry}</div>
              <p className="text-xs text-slate-400 mt-1">Passed on first attempt</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Learning Journey Section */}
      <section className="space-y-4 pb-10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-slate-50 leading-none">Learning Journey</h3>
          <span className="text-xs text-slate-400 font-medium leading-none">
            {sortedMissions.length} Missions Logged
          </span>
        </div>

        <Card className="rounded-2xl border border-slate-800/80 bg-[#131924]/90 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-800/60">
            {sortedMissions.map((mission) => {
              const isPassed = mission.passed === true;
              const isSkipped = mission.skipped === true;
              const isFailed = mission.passed === false && !isSkipped;

              return (
                <div
                  key={`${mission.day}-${mission.title}`}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 min-w-[3.75rem] px-2.5 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 flex items-center justify-center text-xs font-bold leading-none text-center select-none shrink-0">
                      Day {mission.day}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-sm text-slate-100">
                        {mission.title}
                      </h4>
                      {mission.attempts !== undefined && mission.attempts > 0 && (
                        <p className="text-xs text-slate-400">
                          {mission.attempts} {mission.attempts === 1 ? "attempt" : "attempts"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {isPassed && (
                      <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full border-emerald-800/80 text-emerald-400 bg-emerald-950/40 inline-flex flex-row items-center justify-center gap-1.5 whitespace-nowrap">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Passed</span>
                      </Badge>
                    )}

                    {isSkipped && (
                      <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full border-amber-800/80 text-amber-400 bg-amber-950/40 inline-flex flex-row items-center justify-center gap-1.5 whitespace-nowrap">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Skipped</span>
                      </Badge>
                    )}

                    {isFailed && (
                      <Badge variant="destructive" className="px-3 py-1 text-xs font-semibold rounded-full border-rose-800/80 text-rose-400 bg-rose-950/40 inline-flex flex-row items-center justify-center gap-1.5 whitespace-nowrap">
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Failed</span>
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
  );
}
