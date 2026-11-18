import React, { useState, useRef } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Trophy,
  GraduationCap,
  HeartPulse,
  Zap,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import FutureTwinAvatar from './FutureTwinAvatar';
import { getCgpaColorClass, getCgpaBadgeClass } from '../utils/cgpaColors';

export default function ShareProgressModal({
  isOpen,
  onClose,
  prediction,
  logs = [],
  analysis = null,
  userName = 'Student',
  horizon = '6_months',
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen) return null;

  const cur = prediction?.scenario_a_current;
  const imp = prediction?.scenario_b_improved;
  const activeScenario = imp || cur;
  const metrics = activeScenario?.metrics || {
    academic_gpa: 8.5,
    health_index: 80,
    energy_score: 75,
    burnout_risk: 15,
    projected_savings: 15000,
    overall_lifestyle_score: 82,
  };

  const streakDays = logs?.length || analysis?.summary_stats?.logging_streak || 0;
  const gpa = metrics.academic_gpa ?? 8.5;
  const horizonLabel = horizon === '5_years' ? '5 Years' : '6 Months';

  const shareText = `🚀 Meet my Digital Future Self on HabitTwin!
🎓 Projected CGPA: ${gpa.toFixed(2)} / 10.0 (${gpa >= 8 ? "Dean's List Pace" : gpa >= 6 ? "Steady Learner" : "Reset Mode"})
⚡ Habit Consistency Streak: ${streakDays} days
🛡️ Stress Shield: ${Math.round(100 - (metrics.burnout_risk ?? 20))}/100 | Energy: ${Math.round(metrics.energy_score ?? 75)}/100
💰 Projected Student Savings: ₹${Math.round(metrics.projected_savings ?? 0).toLocaleString('en-IN')}

Simulate your own future routine in 6 months or 5 years:
https://habittwin-frontend-cltd.vercel.app`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My HabitTwin Future Self',
          text: shareText,
          url: 'https://habittwin-frontend-cltd.vercel.app',
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1080;
      canvas.height = 1350; // Instagram / WhatsApp portrait standard

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#0B1120');
      bgGrad.addColorStop(0.5, '#131C31');
      bgGrad.addColorStop(1, '#0B1120');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      // Ambient glow circles
      ctx.save();
      const glow1 = ctx.createRadialGradient(250, 250, 0, 250, 250, 350);
      glow1.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
      glow1.addColorStop(1, 'rgba(79, 70, 229, 0)');
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(250, 250, 350, 0, Math.PI * 2);
      ctx.fill();

      const glow2 = ctx.createRadialGradient(850, 450, 0, 850, 450, 400);
      glow2.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(850, 450, 400, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top Header: HabitTwin
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px Segoe UI, sans-serif';
      ctx.fillText('HabitTwin', 80, 110);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.fillText('YOUR DIGITAL FUTURE SELF', 80, 150);

      // User name & horizon pill
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px Segoe UI, sans-serif';
      ctx.fillText(`${userName || 'Student'}'s ${horizonLabel} Projection`, 80, 195);

      // Main Card Container
      ctx.fillStyle = 'rgba(23, 34, 59, 0.85)';
      ctx.strokeStyle = '#263554';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(80, 230, 920, 980, 32);
      ctx.fill();
      ctx.stroke();

      // Streak & Status Badge
      ctx.fillStyle = '#1E1B4B';
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(120, 270, 440, 56, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#C7D2FE';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.fillText(`⚡ ${streakDays} DAYS CONSISTENCY STREAK`, 145, 306);

      // Avatar Circle Mockup
      ctx.save();
      const avGrad = ctx.createRadialGradient(540, 460, 20, 540, 460, 120);
      avGrad.addColorStop(0, '#10B981');
      avGrad.addColorStop(1, '#064E3B');
      ctx.fillStyle = avGrad;
      ctx.beginPath();
      ctx.arc(540, 460, 90, 0, Math.PI * 2);
      ctx.fill();

      // Avatar emoji face
      ctx.font = '72px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎓', 540, 450);
      ctx.fillText('😊', 540, 515);
      ctx.restore();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeScenario?.name || 'Optimized Twin', 540, 600);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '20px Segoe UI, sans-serif';
      ctx.fillText(activeScenario?.avatar?.badge_title || 'Thriving High Performer', 540, 635);

      // Big CGPA Display Box
      const cgpaColor = gpa >= 8.0 ? '#10B981' : gpa >= 6.0 ? '#F59E0B' : '#F43F5E';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = cgpaColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(140, 675, 800, 175, 24);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px Segoe UI, sans-serif';
      ctx.fillText('PROJECTED ACADEMIC CGPA', 180, 725);

      ctx.fillStyle = cgpaColor;
      ctx.font = 'bold 72px Segoe UI, sans-serif';
      ctx.fillText(gpa.toFixed(2), 180, 805);

      ctx.fillStyle = '#64748B';
      ctx.font = '28px Segoe UI, sans-serif';
      ctx.fillText('/ 10.0', 350, 805);

      // CGPA Tag
      const tagText = gpa >= 8.0 ? 'Dean’s List Standing 🏆' : gpa >= 6.0 ? 'Steady Progress ⚡' : 'Reset & Rebuild 🔥';
      ctx.fillStyle = cgpaColor;
      ctx.font = 'bold 24px Segoe UI, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(tagText, 900, 770);

      // 3 Bottom Metric Tiles
      const tiles = [
        { label: 'HEALTH & VITALITY', val: `${Math.round(metrics.health_index)}/100`, color: '#F43F5E' },
        { label: 'STRESS SHIELD', val: `${Math.round(100 - (metrics.burnout_risk ?? 20))}/100`, color: '#38BDF8' },
        { label: 'STUDENT SAVINGS', val: `₹${Math.round(metrics.projected_savings ?? 0).toLocaleString('en-IN')}`, color: '#10B981' },
      ];

      tiles.forEach((tile, idx) => {
        const tx = 140 + idx * 275;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.strokeStyle = '#263554';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tx, 880, 250, 130, 20);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94A3B8';
        ctx.font = '16px Segoe UI, sans-serif';
        ctx.fillText(tile.label, tx + 20, 918);

        ctx.fillStyle = tile.color;
        ctx.font = 'bold 36px Segoe UI, sans-serif';
        ctx.fillText(tile.val, tx + 20, 975);
      });

      // Bottom Watermark
      ctx.textAlign = 'center';
      ctx.fillStyle = '#A5B4FC';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.fillText('habittwin-frontend-cltd.vercel.app', 540, 1070);

      ctx.fillStyle = '#64748B';
      ctx.font = '18px Segoe UI, sans-serif';
      ctx.fillText('Simulate your tomorrow, today • Powered by Scikit-Learn & FastAPI', 540, 1105);

      // Export canvas to downloadable PNG
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `HabitTwin-${userName.replace(/\s+/g, '_') || 'Student'}-Progress.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Your Progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Show friends or your mentor your {horizonLabel} Future Twin
            </p>
          </div>
        </div>

        {/* Social Card Preview Frame */}
        <div
          ref={cardRef}
          className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-700/80 shadow-inner mb-6 relative overflow-hidden"
        >
          {/* Subtle ambient light */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Strip */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                HabitTwin Progress
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-900/80 border border-indigo-700 text-indigo-200">
              ⚡ {streakDays} Day Streak
            </span>
          </div>

          {/* Avatar Preview & Name */}
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="scale-90 origin-left">
              <FutureTwinAvatar avatar={activeScenario?.avatar} compact />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">
                {userName ? `${userName}'s Future Self` : 'My Future Self'}
              </h4>
              <p className="text-xs text-slate-300">
                {activeScenario?.avatar?.badge_title || 'Thriving High Performer'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{horizonLabel} Horizon Projection</p>
            </div>
          </div>

          {/* Projected CGPA Box */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-3 relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Projected Academic CGPA</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-3xl font-black ${getCgpaColorClass(gpa)}`}>
                  {gpa.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">/ 10.0</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getCgpaBadgeClass(gpa)}`}>
              {gpa >= 8.0 ? "Dean's List 🎓" : gpa >= 6.0 ? 'Steady Pace ⚡' : 'Warning Alert 🔥'}
            </span>
          </div>

          {/* 3 Pillar Mini-Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs relative z-10">
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Fitness</span>
              <span className="font-bold text-rose-400">{Math.round(metrics.health_index)}/100</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Stress Shield</span>
              <span className="font-bold text-sky-400">
                {Math.round(100 - (metrics.burnout_risk ?? 20))}/100
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Savings</span>
              <span className="font-bold text-emerald-400">
                ₹{Math.round(metrics.projected_savings ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Download as Image */}
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-md shadow-indigo-500/20 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating Image...' : 'Download Image Card (.PNG)'}
          </button>

          {/* 2 Side-by-Side: Native Share & Copy Summary */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Share to Apps</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Text Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-400 mt-4">
          Share your card on WhatsApp, Instagram, or LinkedIn to keep yourself accountable!
        </p>
      </div>
    </div>
  );
}
