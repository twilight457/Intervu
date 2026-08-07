"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, BookOpen, Search, UserCheck } from "lucide-react";
import candidatesDataRaw from "@/data/candidates.json";
import { CandidateProfile, CandidatesData } from "@/types/profile";
import { setStoredCandidate } from "@/lib/candidate-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { IllustratedAvatar } from "@/components/ui/illustrated-avatar";

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

  // Filter candidates by search query
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
    <div className="relative min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-8 overflow-hidden bg-[#0b0f17] text-slate-100">
      {/* Restrained Grid & Background Glow behind Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_45%_at_50%_15%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#6366f1]/10 blur-[130px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto w-full space-y-10 relative z-10 my-auto text-center pb-24">
        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/intervu-logo.png"
              alt="Intervu Logo"
              className="w-[180px] sm:w-[210px] h-auto object-contain"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50">
            Welcome to Intervu
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-medium">
            Choose your learning profile to begin your personalized AI interview.
          </p>

          {/* Search Bar - Perfectly aligned icon and placeholder text */}
          <div className="pt-2 max-w-md mx-auto relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Search by candidate name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-11 bg-[#131924]/90 border-slate-700/80 text-slate-100 placeholder:text-slate-500 rounded-xl focus-visible:ring-indigo-500 text-left text-sm font-medium shadow-2xs leading-normal"
            />
          </div>
        </div>

        {/* Learner Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 text-left">
          {filteredCandidates.map((candidate, idx) => {
            const isSelected = selectedCandidate?.member.id === candidate.member.id;
            const missionsCompleted = candidate.signals?.missionsCompleted || 0;
            const commitDays = candidate.signals?.commitDays || 0;

            return (
              <Card
                key={candidate.member.id}
                onClick={() => handleSelectCandidate(candidate)}
                className={`relative overflow-hidden cursor-pointer transition-all duration-150 rounded-2xl group ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/40 shadow-md shadow-indigo-500/10 -translate-y-0.5"
                    : "border-slate-800/90 bg-[#131924] hover:border-slate-700 hover:bg-[#18202e] hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {/* Top Subtle Border Highlight Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 transition-colors ${
                    isSelected ? "bg-indigo-500" : "bg-transparent group-hover:bg-slate-700/60"
                  }`}
                />

                {/* Selection Checkmark Indicator */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  {isSelected ? (
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs animate-in zoom-in-75 duration-150">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-slate-700 group-hover:border-slate-600 transition-colors" />
                  )}
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Faceless Illustrated Avatar & Candidate Details */}
                  <div className="flex items-start gap-4">
                    <IllustratedAvatar
                      candidateId={candidate.member.id}
                      index={idx}
                      size={56}
                      className={`shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                        isSelected ? "ring-2 ring-indigo-500/50" : ""
                      }`}
                    />

                    <div className="min-w-0 flex-1 pr-5">
                      <h3 className="font-extrabold text-lg tracking-tight text-slate-50 leading-snug truncate">
                        {candidate.member.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                        {candidate.member.jobRole}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                        {candidate.member.yearsExperience} yrs exp &bull; {candidate.member.education}
                      </p>
                    </div>
                  </div>

                  {/* Missions Progress Subtitle */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                        Missions Progress
                      </span>
                      <span className="font-semibold text-slate-200">
                        {missionsCompleted} missions
                      </span>
                    </div>

                    <Progress
                      value={missionsCompleted}
                      max={31}
                      indicatorClassName={isSelected ? "bg-indigo-500" : "bg-slate-600"}
                      className="h-1.5 bg-slate-900"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>{commitDays} commit days</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 h-4 border-slate-800 text-slate-400 bg-slate-900/90 font-medium"
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
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-[#131924]/40 space-y-2">
            <UserCheck className="h-10 w-10 mx-auto text-slate-600" />
            <h3 className="text-base font-semibold text-slate-300">No candidate profiles found</h3>
            <p className="text-xs text-slate-500">Try clearing your search query.</p>
          </div>
        )}
      </div>

      {/* Floating Sticky Continue Action Bar */}
      {selectedCandidate && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#131924]/95 border border-slate-700/80 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>
              Selected: <strong className="text-slate-50 font-bold">{selectedCandidate.member.name}</strong>
            </span>
          </div>

          <Button
            onClick={handleContinue}
            size="default"
            className="h-10 px-6 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 inline-flex items-center justify-center gap-2"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Button>
        </div>
      )}
    </div>
  );
}
