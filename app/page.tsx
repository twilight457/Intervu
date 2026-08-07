"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles, BookOpen, Search, UserCheck } from "lucide-react";
import candidatesDataRaw from "@/data/candidates.json";
import { CandidateProfile, CandidatesData } from "@/types/profile";
import { setStoredCandidate, getInitials } from "@/lib/candidate-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const data = candidatesDataRaw as CandidatesData;
const candidatesList: CandidateProfile[] = data.candidates || [];

export default function LandingPage() {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle selection state: click again to deselect
  const handleSelectCandidate = (candidate: CandidateProfile) => {
    if (selectedCandidate?.member.id === candidate.member.id) {
      setSelectedCandidate(null);
    } else {
      setSelectedCandidate(candidate);
    }
  };

  const handleContinue = () => {
    if (!selectedCandidate) return;
    setStoredCandidate(selectedCandidate);
    router.push("/dashboard");
  };

  // Filter candidates by search query (name or job role)
  const filteredCandidates = candidatesList.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.member.name.toLowerCase().includes(query) ||
      c.member.jobRole.toLowerCase().includes(query) ||
      c.member.education.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-8 overflow-hidden bg-background">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-violet-500/10 dark:bg-violet-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-10 relative z-10 my-auto text-center">
        {/* Brand Logo & Top Header */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent">
              Intervu
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Welcome to Intervu
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Choose your learning profile to begin your personalized AI interview.
          </p>

          {/* Search & Filter Bar */}
          <div className="pt-2 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by candidate name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background/80 backdrop-blur-xs border-border/80 rounded-xl shadow-xs focus-visible:ring-indigo-500 text-center sm:text-left"
            />
          </div>
        </div>

        {/* Learner Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 text-left">
          {filteredCandidates.map((candidate) => {
            const isSelected = selectedCandidate?.member.id === candidate.member.id;
            const initials = getInitials(candidate.member.name);
            const missionsCompleted = candidate.signals?.missionsCompleted || 0;
            const commitDays = candidate.signals?.commitDays || 0;

            return (
              <Card
                key={candidate.member.id}
                onClick={() => handleSelectCandidate(candidate)}
                className={`relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-2xl group ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-lg shadow-indigo-500/10 -translate-y-0.5"
                    : "border-border/70 bg-card/80 hover:border-indigo-400/60 hover:bg-card hover:shadow-md hover:-translate-y-1"
                }`}
              >
                {/* Selection Checkmark Indicator */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  {isSelected ? (
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md animate-in zoom-in-75 duration-150">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-border/80 group-hover:border-indigo-400/60 transition-colors" />
                  )}
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Avatar & Header Info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center text-base font-bold transition-transform duration-200 group-hover:scale-105 shrink-0 ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/20"
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1 pr-6">
                      <h3 className="font-semibold text-base tracking-tight text-foreground truncate">
                        {candidate.member.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate font-medium">
                        {candidate.member.jobRole}
                      </p>
                      <span className="inline-block text-[11px] text-muted-foreground/80">
                        {candidate.member.yearsExperience} yrs exp &bull; {candidate.member.education}
                      </span>
                    </div>
                  </div>

                  {/* Progress Subtitle */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                        Missions Progress
                      </span>
                      <span className="font-semibold text-foreground">
                        {missionsCompleted} missions
                      </span>
                    </div>

                    <Progress
                      value={missionsCompleted}
                      max={31}
                      indicatorClassName={isSelected ? "bg-gradient-to-r from-indigo-600 to-violet-600" : "bg-indigo-500"}
                      className="h-1.5"
                    />

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/90 pt-0.5">
                      <span>{commitDays} commit days</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 h-4 border-slate-200 dark:border-slate-800"
                      >
                        {candidate.member.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/20 space-y-2">
            <UserCheck className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">No candidate profiles found</h3>
            <p className="text-xs text-muted-foreground">Try clearing your search query.</p>
          </div>
        )}

        {/* Primary Continue Button Section */}
        <div className="pt-6 flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedCandidate}
            variant="gradient"
            size="lg"
            className="w-full sm:w-auto min-w-[240px] px-8 h-12 text-base font-semibold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
