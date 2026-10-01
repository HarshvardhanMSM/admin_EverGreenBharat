import { Radio, Users, ShieldCheck, Zap, Activity } from "lucide-react";

export function LoginIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center p-6">
      {/* Background Glow */}
      <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      {/* Main Glass Card Graphic */}
      <div className="relative z-10 w-full rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Stream Live Header Badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-500">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Live Stream Operations</p>
              <p className="text-xs text-slate-400">184 streams online now</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
            Live Platform
          </span>
        </div>

        {/* Animated Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span>Active Viewers</span>
            </div>
            <p className="text-xl font-bold text-white">24,580</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Real-time Gifts</span>
            </div>
            <p className="text-xl font-bold text-white">1,250/min</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 pt-2 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Role-Based Access Control & High Security Encryption</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-purple-400 shrink-0" />
            <span>Real-time Stream Monitoring & Instant Moderation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
