import React, { useState, useRef, useEffect } from 'react';
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
  ShieldAlert,
  ArrowRight,
  Flame,
  Award,
  Mail,
  Scale,
} from 'lucide-react';
import FutureTwinAvatar from './FutureTwinAvatar';
import { getCgpaColorClass, getCgpaBadgeClass } from '../utils/cgpaColors';

const CARD_TABS = [
  { id: 'improved', label: 'Healthier Twin', icon: Sparkles },
  { id: 'current', label: 'Current Path', icon: ShieldAlert },
  { id: 'comparison', label: 'Twin Duel', icon: Scale },
  { id: 'achievement', label: 'Streak & Badges', icon: Trophy },
  { id: 'letter', label: 'Letter Quote', icon: Mail },
];

export default function ShareProgressModal({
  isOpen,
  onClose,
  initialCardType = 'improved',
  prediction,
  logs = [],
  analysis = null,
  userName = 'Student',
  horizon = '6_months',
  letter = null,
}) {
  const [activeTab, setActiveTab] = useState(initialCardType || 'improved');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  // Sync activeTab when modal opens with a specific request
  useEffect(() => {
    if (initialCardType) {
      setActiveTab(initialCardType);
    }
  }, [initialCardType, isOpen]);

  if (!isOpen) return null;

  const cur = prediction?.scenario_a_current;
  const imp = prediction?.scenario_b_improved;
  const activeScenario = activeTab === 'current' ? cur || imp : imp || cur;

  const streakDays = logs?.length || analysis?.summary_stats?.logging_streak || 0;
  const horizonLabel = horizon === '5_years' ? '5 Years' : '6 Months';

  // Metrics
  const curMetrics = cur?.metrics || { academic_gpa: 6.8, health_index: 55, energy_score: 50, burnout_risk: 65, projected_savings: 2500 };
  const impMetrics = imp?.metrics || { academic_gpa: 8.6, health_index: 85, energy_score: 80, burnout_risk: 15, projected_savings: 15000 };
  const targetMetrics = activeTab === 'current' ? curMetrics : impMetrics;

  const gpa = targetMetrics.academic_gpa ?? 8.5;
  const letterQuote = letter?.key_quote || 'The compound interest of your daily choices is the most powerful force in the universe.';
  const letterTitle = letter?.title || 'A Message From Your Future Self';

  // Dynamic share text based on active card tab
  const getShareText = () => {
    if (activeTab === 'current') {
      return `⚠️ Reality Check on my Current Trajectory with HabitTwin!
🎓 Projected CGPA: ${curMetrics.academic_gpa.toFixed(2)} / 10.0
⚡ Current Energy Score: ${Math.round(curMetrics.energy_score)}/100 | Burnout Risk: ${Math.round(curMetrics.burnout_risk)}%
💰 Projected Savings: ₹${Math.round(curMetrics.projected_savings).toLocaleString('en-IN')}

Ready to pivot before it compounds. Simulate your routine:
https://habittwin-frontend-cltd.vercel.app`;
    }

    if (activeTab === 'comparison') {
      const gpaDiff = (impMetrics.academic_gpa - curMetrics.academic_gpa).toFixed(2);
      const savingsDiff = Math.round(impMetrics.projected_savings - curMetrics.projected_savings);
      return `⚖️ Twin Duel: My Two Future Selves on HabitTwin (${horizonLabel} Horizon)
Path A (No Change): ${curMetrics.academic_gpa.toFixed(2)} CGPA | ${Math.round(curMetrics.burnout_risk)}% Burnout
Path B (Healthier): ${impMetrics.academic_gpa.toFixed(2)} CGPA | ${Math.round(impMetrics.burnout_risk)}% Burnout
🚀 Compounding Advantage: +${gpaDiff} CGPA & +₹${savingsDiff.toLocaleString('en-IN')} Saved!

See where your habits lead:
https://habittwin-frontend-cltd.vercel.app`;
    }

    if (activeTab === 'achievement') {
      const rankTitle =
        streakDays >= 365
          ? '1-Year Golden Hat Legend 👑'
          : streakDays >= 180
          ? '6-Month Water Bottle & Certificate 💧'
          : streakDays >= 90
          ? '3-Month HabitTwin T-Shirt 👕'
          : streakDays >= 15
          ? '15-Day Goodies Unlocked 🎁'
          : 'Consistent Habit Builder ⚡';

      return `🏆 Habit Consistency Milestone Unlocked!
⚡ ${streakDays} Consecutive Days Logged on HabitTwin
🛡️ Consistency Rank: ${rankTitle}
🎯 Daily focus, sleep & budgeting tracked with zero excuses.

Track your habits and build your future:
https://habittwin-frontend-cltd.vercel.app`;
    }

    if (activeTab === 'letter') {
      return `📜 Wisdom from my Future Self (${horizonLabel} Horizon):
"${letterQuote}"
— Dispatched from ${userName || 'My'}'s Future Twin

Read your own future self letter:
https://habittwin-frontend-cltd.vercel.app`;
    }

    // Default: Healthier Twin
    return `🚀 Meet my Digital Future Self on HabitTwin!
🎓 Projected CGPA: ${impMetrics.academic_gpa.toFixed(2)} / 10.0 (Dean's List Pace 🏆)
⚡ Consistency Streak: ${streakDays} Days
🛡️ Stress Shield: ${Math.round(100 - (impMetrics.burnout_risk ?? 15))}/100 | Energy: ${Math.round(impMetrics.energy_score ?? 80)}/100
💰 Projected Savings: ₹${Math.round(impMetrics.projected_savings ?? 0).toLocaleString('en-IN')}

Simulate your future in 6 months or 5 years:
https://habittwin-frontend-cltd.vercel.app`;
  };

  const handleCopy = async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HabitTwin: ${userName}'s ${horizonLabel} Card`,
          text: text,
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

  // Canvas Image Exporter tailored to the active tab
  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1080;
      canvas.height = 1350; // Portrait standard for IG / WhatsApp

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      if (activeTab === 'current') {
        bgGrad.addColorStop(0, '#180B0E');
        bgGrad.addColorStop(0.5, '#221118');
        bgGrad.addColorStop(1, '#0F0913');
      } else if (activeTab === 'letter') {
        bgGrad.addColorStop(0, '#151322');
        bgGrad.addColorStop(0.5, '#1E1B38');
        bgGrad.addColorStop(1, '#0F0E1C');
      } else {
        bgGrad.addColorStop(0, '#0B1120');
        bgGrad.addColorStop(0.5, '#131C31');
        bgGrad.addColorStop(1, '#0B1120');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      // Ambient glows
      ctx.save();
      const glow1 = ctx.createRadialGradient(250, 250, 0, 250, 250, 350);
      glow1.addColorStop(0, activeTab === 'current' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(79, 70, 229, 0.35)');
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(250, 250, 350, 0, Math.PI * 2);
      ctx.fill();

      const glow2 = ctx.createRadialGradient(850, 450, 0, 850, 450, 400);
      glow2.addColorStop(0, activeTab === 'current' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.3)');
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(850, 450, 400, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top Brand Header
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px Segoe UI, sans-serif';
      ctx.fillText('HabitTwin', 80, 110);

      ctx.fillStyle = activeTab === 'current' ? '#F87171' : activeTab === 'letter' ? '#A78BFA' : '#10B981';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      const subtitle = activeTab === 'letter'
        ? 'FUTURE SELF WISDOM DISPATCH'
        : activeTab === 'comparison'
        ? 'TWIN DUEL • SIDE-BY-SIDE FORECAST'
        : activeTab === 'achievement'
        ? 'HABIT CONSISTENCY MILESTONE'
        : activeTab === 'current'
        ? 'CURRENT TRAJECTORY AUDIT'
        : 'OPTIMIZED FUTURE SELF';
      ctx.fillText(subtitle, 80, 150);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px Segoe UI, sans-serif';
      ctx.fillText(`${userName || 'Student'}'s ${horizonLabel} Projection`, 80, 195);

      // Card Container
      ctx.fillStyle = 'rgba(23, 34, 59, 0.85)';
      ctx.strokeStyle = activeTab === 'current' ? '#7F1D1D' : '#263554';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(80, 230, 920, 980, 32);
      ctx.fill();
      ctx.stroke();

      // Content branches for canvas
      if (activeTab === 'letter') {
        // Future Letter Quote Canvas
        ctx.fillStyle = '#312E81';
        ctx.strokeStyle = '#818CF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(120, 280, 480, 56, 28);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#E0E7FF';
        ctx.font = 'bold 22px Segoe UI, sans-serif';
        ctx.fillText(`📜 DISPATCH FROM ${horizonLabel.toUpperCase()} OUT`, 145, 316);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 36px Georgia, serif';
        ctx.textAlign = 'left';
        ctx.fillText(letterTitle, 130, 410);

        // Quote Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = '#6366F1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(120, 470, 840, 360, 24);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'italic 34px Georgia, serif';
        ctx.fillStyle = '#C7D2FE';
        const words = letterQuote.split(' ');
        let line = '';
        let y = 550;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 760 && n > 0) {
            ctx.fillText(line, 160, y);
            line = words[n] + ' ';
            y += 50;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 160, y);

        // Author attribution
        ctx.font = 'bold 24px Segoe UI, sans-serif';
        ctx.fillStyle = '#A5B4FC';
        ctx.fillText(`— Your Future Self, living with the outcome`, 160, 770);

        // Bottom stats strip
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.beginPath();
        ctx.roundRect(120, 870, 840, 140, 20);
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText('Projected CGPA:', 160, 925);
        ctx.fillText('Burnout Shield:', 460, 925);
        ctx.fillText('Target Savings:', 720, 925);

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 36px Segoe UI, sans-serif';
        ctx.fillText(`${impMetrics.academic_gpa.toFixed(2)} / 10`, 160, 975);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`${Math.round(100 - impMetrics.burnout_risk)}%`, 460, 975);
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(`₹${Math.round(impMetrics.projected_savings).toLocaleString('en-IN')}`, 720, 975);
      } else if (activeTab === 'comparison') {
        // Twin Duel Comparison Canvas
        ctx.fillStyle = '#312E81';
        ctx.strokeStyle = '#6366F1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(120, 270, 520, 56, 28);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#E0E7FF';
        ctx.font = 'bold 22px Segoe UI, sans-serif';
        ctx.fillText(`⚖️ TWIN DUEL: TWO FUTURES COMPARED`, 145, 306);

        // Left Column: Path A (Current)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(120, 360, 400, 600, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F87171';
        ctx.font = 'bold 26px Segoe UI, sans-serif';
        ctx.fillText('PATH A: CURRENT ROUTINE', 150, 410);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText('Academic CGPA:', 150, 480);
        ctx.font = 'bold 54px Segoe UI, sans-serif';
        ctx.fillStyle = '#F87171';
        ctx.fillText(curMetrics.academic_gpa.toFixed(2), 150, 545);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText('Burnout Risk:', 150, 630);
        ctx.font = 'bold 44px Segoe UI, sans-serif';
        ctx.fillText(`${Math.round(curMetrics.burnout_risk)}%`, 150, 685);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText('Projected Savings:', 150, 770);
        ctx.font = 'bold 38px Segoe UI, sans-serif';
        ctx.fillText(`₹${Math.round(curMetrics.projected_savings).toLocaleString('en-IN')}`, 150, 820);

        // Right Column: Path B (Improved)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(560, 360, 400, 600, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 26px Segoe UI, sans-serif';
        ctx.fillText('PATH B: HEALTHIER HABITS', 590, 410);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText('Academic CGPA:', 590, 480);
        ctx.font = 'bold 54px Segoe UI, sans-serif';
        ctx.fillStyle = '#34D399';
        ctx.fillText(impMetrics.academic_gpa.toFixed(2), 590, 545);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText('Burnout Risk:', 590, 630);
        ctx.font = 'bold 44px Segoe UI, sans-serif';
        ctx.fillText(`${Math.round(impMetrics.burnout_risk)}%`, 590, 685);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText('Projected Savings:', 590, 770);
        ctx.font = 'bold 38px Segoe UI, sans-serif';
        ctx.fillText(`₹${Math.round(impMetrics.projected_savings).toLocaleString('en-IN')}`, 590, 820);

        // Advantage Banner
        const diffGpa = (impMetrics.academic_gpa - curMetrics.academic_gpa).toFixed(2);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 28px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🚀 Trajectory Divergence: +${diffGpa} CGPA & Peak Health Advantage`, 540, 1020);
      } else {
        // Single Twin Progress Card (Healthier or Current Path or Achievement)
        const isCurrent = activeTab === 'current';
        const cardGpa = isCurrent ? curMetrics.academic_gpa : impMetrics.academic_gpa;
        const cgpaColor = cardGpa >= 8.0 ? '#10B981' : cardGpa >= 6.0 ? '#F59E0B' : '#F43F5E';

        // Badge pill
        ctx.fillStyle = isCurrent ? '#450A0A' : '#1E1B4B';
        ctx.strokeStyle = isCurrent ? '#EF4444' : '#6366F1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(120, 270, 440, 56, 28);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCurrent ? '#FCA5A5' : '#C7D2FE';
        ctx.font = 'bold 22px Segoe UI, sans-serif';
        const pillText = activeTab === 'achievement'
          ? `🏆 ${streakDays} DAYS STREAK ACHIEVED`
          : isCurrent
          ? `⚠️ CURRENT TRAJECTORY AUDIT`
          : `⚡ ${streakDays} DAYS CONSISTENCY STREAK`;
        ctx.fillText(pillText, 145, 306);

        // Center Avatar
        ctx.save();
        const avGrad = ctx.createRadialGradient(540, 460, 20, 540, 460, 120);
        avGrad.addColorStop(0, isCurrent ? '#EF4444' : '#10B981');
        avGrad.addColorStop(1, isCurrent ? '#7F1D1D' : '#064E3B');
        ctx.fillStyle = avGrad;
        ctx.beginPath();
        ctx.arc(540, 460, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '72px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isCurrent ? '⚡' : '🎓', 540, 450);
        ctx.fillText(isCurrent ? '😐' : '😊', 540, 515);
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isCurrent ? 'Current Path You' : 'Healthier Future Twin', 540, 600);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '20px Segoe UI, sans-serif';
        ctx.fillText(isCurrent ? 'Warning: Chronic Fatigue Risk' : 'Dean’s List Standing 🏆', 540, 635);

        // CGPA Box
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
        ctx.fillText(cardGpa.toFixed(2), 180, 805);

        ctx.fillStyle = '#64748B';
        ctx.font = '28px Segoe UI, sans-serif';
        ctx.fillText('/ 10.0', 350, 805);

        // Tag
        ctx.fillStyle = cgpaColor;
        ctx.font = 'bold 24px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(cardGpa >= 8.0 ? 'Dean’s List Standing 🏆' : cardGpa >= 6.0 ? 'Steady Progress ⚡' : 'Needs Course-Correction ⚠️', 900, 770);

        // 3 Metric Tiles
        const tiles = [
          { label: 'HEALTH & VITALITY', val: `${Math.round(targetMetrics.health_index)}/100`, color: '#F43F5E' },
          { label: 'STRESS SHIELD', val: `${Math.round(100 - (targetMetrics.burnout_risk ?? 20))}/100`, color: '#38BDF8' },
          { label: 'PROJECTED SAVINGS', val: `₹${Math.round(targetMetrics.projected_savings ?? 0).toLocaleString('en-IN')}`, color: '#10B981' },
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
      }

      // Watermark
      ctx.textAlign = 'center';
      ctx.fillStyle = '#A5B4FC';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.fillText('habittwin-frontend-cltd.vercel.app', 540, 1090);

      ctx.fillStyle = '#64748B';
      ctx.font = '18px Segoe UI, sans-serif';
      ctx.fillText('Simulate your tomorrow, today • Powered by Scikit-Learn & FastAPI', 540, 1125);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `HabitTwin-${activeTab}-${userName.replace(/\s+/g, '_') || 'Student'}-Progress.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Your Progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick any progress card to export or share with friends and mentors
            </p>
          </div>
        </div>

        {/* Segmented Card Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-5">
          {CARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Card Preview Frame */}
        <div
          ref={cardRef}
          className={`rounded-2xl p-5 text-white border shadow-inner mb-6 relative overflow-hidden transition-all ${
            activeTab === 'current'
              ? 'bg-gradient-to-br from-red-950/80 via-slate-900 to-amber-950/40 border-red-900/60'
              : activeTab === 'letter'
              ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-indigo-800/60'
              : activeTab === 'comparison'
              ? 'bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-800/60'
              : 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-slate-700/80'
          }`}
        >
          {/* Card Top Strip */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${activeTab === 'current' ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className={`text-xs font-bold tracking-wider uppercase ${activeTab === 'current' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {activeTab === 'current'
                  ? 'Current Path Reality Check'
                  : activeTab === 'comparison'
                  ? 'Twin Duel Forecast'
                  : activeTab === 'achievement'
                  ? 'Consistency Milestone'
                  : activeTab === 'letter'
                  ? 'Future Self Letter Quote'
                  : 'Healthier Future Twin'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-900/80 border border-indigo-700 text-indigo-200">
              ⚡ {streakDays} Day Streak
            </span>
          </div>

          {/* TAB 1 & 2: SINGLE AVATAR CARD (Healthier or Current) */}
          {(activeTab === 'improved' || activeTab === 'current') && (
            <>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="scale-90 origin-left">
                  <FutureTwinAvatar avatar={activeScenario?.avatar} compact />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {userName ? `${userName}'s Future Self` : 'My Future Self'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {activeTab === 'current'
                      ? 'Warning: High Burnout Risk'
                      : activeScenario?.avatar?.badge_title || 'Thriving High Performer'}
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
                  <span className="font-bold text-rose-400">{Math.round(targetMetrics.health_index)}/100</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Stress Shield</span>
                  <span className="font-bold text-sky-400">
                    {Math.round(100 - (targetMetrics.burnout_risk ?? 20))}/100
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Savings</span>
                  <span className="font-bold text-emerald-400">
                    ₹{Math.round(targetMetrics.projected_savings ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: TWIN DUEL COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-3 relative z-10">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Path A */}
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50">
                  <span className="text-[10px] font-bold uppercase text-red-400 block mb-1">
                    Path A • Current
                  </span>
                  <div className="text-xl font-black text-red-300">
                    {curMetrics.academic_gpa.toFixed(2)} <span className="text-xs font-normal text-slate-400">CGPA</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Burnout: <strong className="text-red-400">{Math.round(curMetrics.burnout_risk)}%</strong>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Savings: <strong>₹{Math.round(curMetrics.projected_savings).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Path B */}
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                    Path B • Healthier
                  </span>
                  <div className="text-xl font-black text-emerald-300">
                    {impMetrics.academic_gpa.toFixed(2)} <span className="text-xs font-normal text-slate-400">CGPA</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Burnout: <strong className="text-emerald-400">{Math.round(impMetrics.burnout_risk)}%</strong>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Savings: <strong>₹{Math.round(impMetrics.projected_savings).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Comparison Advantage Banner */}
              <div className="p-3 rounded-xl bg-indigo-900/50 border border-indigo-700/60 text-center">
                <span className="text-xs font-bold text-indigo-200">
                  🚀 Advantage: +{(impMetrics.academic_gpa - curMetrics.academic_gpa).toFixed(2)} CGPA & ₹{(impMetrics.projected_savings - curMetrics.projected_savings).toLocaleString('en-IN')} Extra Savings!
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: ACHIEVEMENT & STREAK */}
          {activeTab === 'achievement' && (
            <div className="space-y-3 relative z-10">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-amber-200">
                    {streakDays >= 365
                      ? '1-Year Golden Hat Legend 👑'
                      : streakDays >= 180
                      ? '6-Month Water Bottle & Certificate 💧'
                      : streakDays >= 90
                      ? '3-Month HabitTwin T-Shirt 👕'
                      : streakDays >= 15
                      ? '15-Day Goodies Unlocked 🎁'
                      : 'Consistent Habit Builder ⚡'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {streakDays} Days Consistent • Ranked in Top 10%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Streak</span>
                  <span className="font-bold text-amber-400">{streakDays} Days</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Pace</span>
                  <span className="font-bold text-emerald-400">Dean's List</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Shield</span>
                  <span className="font-bold text-sky-400">{Math.round(100 - impMetrics.burnout_risk)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LETTER QUOTE */}
          {activeTab === 'letter' && (
            <div className="space-y-3 relative z-10">
              <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                  {letter?.theme_badge || `${horizonLabel} Wisdom Quote`}
                </span>
                <p className="font-serif italic text-sm sm:text-base text-indigo-100 leading-snug">
                  "{letterQuote}"
                </p>
                <span className="text-xs text-indigo-300/80 block mt-2 text-right">
                  — From your future self ({horizonLabel})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Target CGPA: <strong className="text-emerald-400">{impMetrics.academic_gpa.toFixed(2)}</strong></span>
                <span>Burnout Risk: <strong className="text-sky-400">{Math.round(impMetrics.burnout_risk)}%</strong></span>
              </div>
            </div>
          )}
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
            {downloading ? 'Generating Card Image...' : `Download ${CARD_TABS.find(t => t.id === activeTab)?.label} Card (.PNG)`}
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
                  <span>Copy Summary</span>
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
