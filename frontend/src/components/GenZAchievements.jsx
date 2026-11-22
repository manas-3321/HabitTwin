import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  Printer,
  X,
  Share2,
  Heart,
  Crown,
  BookOpen,
  Moon,
  Smartphone,
  Wallet,
  Gift,
  Shirt,
  Droplets,
  Package,
  Copy,
  Check,
  ArrowRight,
  Mail,
  Download,
  Loader2,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Snowflake,
  RefreshCw,
} from 'lucide-react';
import {
  sendCertificateEmail,
  getCertificateDownloadUrl,
  getLocalStreakFreezes,
  getLocalFrozenDates,
  applyStreakFreeze,
  restoreStreak,
  replenishStreakFreeze,
} from '../api/habitApi';

const MILESTONES = [
  {
    id: 'goodies_15d',
    targetDays: 15,
    title: 'HabitTwin Goodies Pack',
    shortTitle: 'Goodies Pack',
    tag: '15-Day Streak',
    badgeLabel: '15-Day Tracking Streak',
    rewardItem: 'Goodies (Stickers, Enamel Pin & Pocket Journal)',
    emoji: '🎁',
    icon: Gift,
    color: 'purple',
    gradient: 'from-purple-500/10 via-indigo-500/5 to-purple-500/10 dark:from-purple-950/40',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-500/10 ring-purple-500/30',
    accentColor: 'text-purple-600 dark:text-purple-400',
    bgBadge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    btnColor: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
    voucherCode: 'HT-GOODIES-15D',
    desc: '15 consecutive days of daily habit tracking. Unlocks the official HabitTwin student goodie pack with laptop stickers, metallic streak pin & pocket notebook.',
    specs: 'Includes 5x Holographic Die-Cut Vinyl Stickers, 1x Solid Enamel Streak Pin, and 1x Minimalist Pocket Habit Journal.',
    details: [
      '✨ 5x Die-cut Holographic HabitTwin Laptop & Phone Stickers',
      '🎖️ Official Enamel Metal Habit Consistency Lapel Pin',
      '📓 60-Day Minimalist Pocket Daily Habit Journal & Pen',
      '📦 Campus Priority Dispatch Included',
    ],
  },
  {
    id: 'tshirt_3m',
    targetDays: 90,
    title: 'Official HabitTwin T-Shirt',
    shortTitle: 'HabitTwin T-Shirt',
    tag: '3 Months (90 Days)',
    badgeLabel: '3-Month Streak',
    rewardItem: 'Heavyweight Oversized Cotton T-Shirt',
    emoji: '👕',
    icon: Shirt,
    color: 'indigo',
    gradient: 'from-indigo-500/10 via-blue-500/5 to-indigo-500/10 dark:from-indigo-950/40',
    border: 'border-indigo-500/40',
    glow: 'shadow-indigo-500/10 ring-indigo-500/30',
    accentColor: 'text-indigo-600 dark:text-indigo-400',
    bgBadge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    voucherCode: 'HT-TEE-3MONTHS',
    desc: '3 months (90 days) of unbroken daily logging. Earn the limited-edition, heavy-cotton oversized HabitTwin community T-shirt.',
    specs: '240 GSM 100% French Terry Cotton, Pre-shrunk, Bio-washed. High-density embroidered crest & screen-printed back.',
    details: [
      '🧵 Premium 240 GSM 100% French Terry Cotton Oversized Fit',
      '🎨 Minimalist Embroidered "Built Different" Chest Monogram',
      '✨ Luminescent Digital Twin Blueprint Back Artwork',
      '🏷️ Sizes: S, M, L, XL, XXL (Unisex)',
    ],
    hasSize: true,
  },
  {
    id: 'bottle_6m',
    targetDays: 180,
    title: 'Insulated Water Bottle',
    shortTitle: 'Water Bottle & Certificate',
    tag: '6 Months (180 Days)',
    badgeLabel: '6-Month Streak',
    rewardItem: 'Stainless Steel Water Bottle + Certificate',
    emoji: '💧',
    icon: Droplets,
    color: 'emerald',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/10 dark:from-emerald-950/40',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/10 ring-emerald-500/30',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    bgBadge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
    voucherCode: 'HT-BOTTLE-6MONTHS',
    desc: '6 consecutive months of showing up every single day. Receive the matte-finish steel HabitTwin hydration flask + printable official Certificate.',
    specs: '750ml Pro-Grade 18/8 Stainless Steel. Double-wall vacuum insulation keeps cold 24h / hot 12h. Condensation-free matte powder coat.',
    details: [
      '❄️ 750ml Double-Walled Vacuum-Insulated Stainless Steel Flask (Cold 24h / Hot 12h)',
      '⚡ Laser-Engraved Personal Name & Consecutive Streak Tally',
      '📜 Official Certificate of Genuine Appreciation with Gold Seal Stamp',
      '🌿 100% BPA-Free Leak-Proof Sports Cap',
    ],
    hasCertificate: true,
  },
  {
    id: 'hat_1y',
    targetDays: 365,
    title: 'Legendary Golden Hat',
    shortTitle: 'Golden Hat',
    tag: '1 Year (365 Days)',
    badgeLabel: '1-Year Streak',
    rewardItem: 'Metallic Gold Thread Embroidered Cap + Brass Coin',
    emoji: '👑',
    icon: Crown,
    color: 'amber',
    gradient: 'from-amber-500/15 via-yellow-500/10 to-orange-500/10 dark:from-amber-950/50',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/20 ring-2 ring-amber-400/40',
    accentColor: 'text-amber-500 dark:text-amber-400',
    bgBadge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    btnColor: 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/30',
    voucherCode: 'HT-GOLDHAT-1YEAR',
    desc: '1 full year (365 days) without missing a single day. Crowned with the ultra-rare metallic gold embroidered HabitTwin cap and Hall of Fame coin.',
    specs: 'Structured 6-panel cotton twill cap with genuine metallic gold Japanese thread embroidery, brass buckle strap, and solid brass 365-day medallion.',
    details: [
      '👑 Custom Metallic Gold Thread Embroidered 6-Panel HabitTwin Cap',
      '🪙 Solid Antiqued Brass "365-Day Discipline Master" Commemorative Medallion',
      '🏛️ Lifetime Induction in the HabitTwin Campus Hall of Fame',
      '⭐ VIP Lifetime Early-Access to all future HabitTwin updates',
    ],
  },
];

export default function GenZAchievements({
  logs = [],
  analysis = null,
  userName = 'Alex',
  onOpenShare = null,
  currentUser = null,
  onOpenAuth = null,
  certStatus = null,
  onRefreshCertStatus = null,
}) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeGoodieModal, setActiveGoodieModal] = useState(null);
  const [selectedShirtSize, setSelectedShirtSize] = useState('L');
  const [copiedCode, setCopiedCode] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState(null);

  // Streak Freeze State (Synchronized with backend / localStorage)
  const [freezesAvailable, setFreezesAvailable] = useState(() => {
    return currentUser?.streak_freezes_available ?? getLocalStreakFreezes();
  });
  const [frozenDates, setFrozenDates] = useState(() => {
    return currentUser?.streak_freezes_used ?? getLocalFrozenDates();
  });
  const [freezeFeedback, setFreezeFeedback] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.streak_freezes_available !== undefined) {
        setFreezesAvailable(currentUser.streak_freezes_available);
      }
      if (currentUser.streak_freezes_used) {
        setFrozenDates(currentUser.streak_freezes_used);
      }
    }
  }, [currentUser]);

  // Persistent claimed goodies in localStorage
  const [claimedRewards, setClaimedRewards] = useState(() => {
    try {
      const saved = localStorage.getItem('habittwin_claimed_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate real consecutive streaks from logs, with streak freezes bridging gaps
  const {
    currentStreak,
    bestStreak,
    totalDays,
    isStreakBroken,
    brokenDate,
    isProtectedToday,
    sleepCount,
    studyCount,
    grassCount,
    budgetCount,
  } = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalDays: 0,
        isStreakBroken: false,
        brokenDate: null,
        isProtectedToday: false,
        sleepCount: 0,
        studyCount: 0,
        grassCount: 0,
        budgetCount: 0,
      };
    }

    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const frozenSet = new Set(frozenDates || []);

    let cur = 0;
    let maxS = 0;
    let tempS = 0;
    let prevDate = null;
    let sleepC = 0;
    let studyC = 0;
    let grassC = 0;
    let budgetC = 0;

    for (const log of sorted) {
      const d = new Date(log.date);
      if (prevDate) {
        const diffDays = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempS++;
        } else if (diffDays > 1) {
          // Check if intermediate missing days are shielded by freezes
          let allIntermediateFrozen = true;
          for (let step = 1; step < diffDays; step++) {
            const stepDate = new Date(prevDate.getTime() + step * 86400000).toISOString().split('T')[0];
            if (!frozenSet.has(stepDate)) {
              allIntermediateFrozen = false;
              break;
            }
          }
          if (allIntermediateFrozen) {
            tempS += diffDays;
          } else {
            tempS = 1;
          }
        }
      } else {
        tempS = 1;
      }
      if (tempS > maxS) maxS = tempS;
      prevDate = d;

      if (log.sleep_hours >= 7.0 && log.sleep_hours <= 9.0) sleepC++;
      if (log.study_hours >= 3.5) studyC++;
      const leisureScreen = Math.max(0, (log.screen_time_hours || 0) - (log.study_hours || 0));
      if (leisureScreen <= 2.5) grassC++;
      if (log.total_spending <= 350) budgetC++;
    }

    // Current streak working back from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterdayDate = new Date(today.getTime() - 86400000);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const lastLogDate = new Date(sorted[sorted.length - 1].date);
    lastLogDate.setHours(0, 0, 0, 0);
    const dayGap = Math.round((today - lastLogDate) / (1000 * 60 * 60 * 24));

    let broken = false;
    let brokenOn = null;
    let protectedNow = false;

    if (dayGap <= 1) {
      cur = tempS;
    } else if (dayGap === 2) {
      if (frozenSet.has(yesterdayStr)) {
        cur = tempS + 1;
        protectedNow = true;
      } else {
        cur = 0;
        broken = true;
        brokenOn = yesterdayStr;
      }
    } else {
      // Gap > 2 days
      cur = 0;
      broken = true;
      brokenOn = yesterdayStr;
    }

    return {
      currentStreak: cur || (protectedNow ? tempS + 1 : 0),
      bestStreak: Math.max(maxS, cur),
      totalDays: sorted.length,
      isStreakBroken: broken,
      brokenDate: brokenOn,
      isProtectedToday: protectedNow,
      sleepCount: sleepC,
      studyCount: studyC,
      grassCount: grassC,
      budgetCount: budgetC,
    };
  }, [logs, frozenDates]);

  // Restore Streak Handler
  const handleRestoreStreak = async (targetDate = null) => {
    setIsRestoring(true);
    setFreezeFeedback(null);
    try {
      const dt = targetDate || brokenDate || new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const res = await restoreStreak(dt);
      if (res) {
        setFreezesAvailable(res.freezes_available ?? Math.max(0, freezesAvailable - 1));
        if (res.freezes_used) {
          setFrozenDates(res.freezes_used);
        } else {
          setFrozenDates((prev) => [...prev, dt]);
        }
        setFreezeFeedback({
          type: 'success',
          text: res.message || `Streak successfully restored for ${dt}! 🧊`,
        });
        if (onRefreshCertStatus) onRefreshCertStatus();
      }
    } catch (err) {
      setFreezeFeedback({
        type: 'error',
        text: err?.message || 'Could not restore streak.',
      });
    } finally {
      setIsRestoring(false);
      setTimeout(() => setFreezeFeedback(null), 5000);
    }
  };

  // Claim Emergency Student Freeze (+1)
  const handleClaimEmergencyFreeze = async () => {
    try {
      const res = await replenishStreakFreeze(1, 'student_emergency_grant');
      if (res) {
        setFreezesAvailable(res.freezes_available ?? Math.min(3, freezesAvailable + 1));
        setFreezeFeedback({
          type: 'success',
          text: res.message || '⚡ Emergency Streak Freeze added to your vault! (Protected for 1 missed day)',
        });
      }
    } catch (err) {
      setFreezeFeedback({
        type: 'error',
        text: err?.message || 'Failed to claim emergency freeze.',
      });
    } finally {
      setTimeout(() => setFreezeFeedback(null), 4000);
    }
  };

  // Check if a milestone is unlocked
  const isMilestoneUnlocked = (m) => bestStreak >= m.targetDays;
  const isMilestoneClaimed = (m) => claimedRewards.includes(m.id);

  // Claim handler
  const handleClaimReward = (milestone) => {
    if (!claimedRewards.includes(milestone.id)) {
      const next = [...claimedRewards, milestone.id];
      setClaimedRewards(next);
      try {
        localStorage.setItem('habittwin_claimed_rewards', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save claimed reward:', err);
      }
    }
    setClaimFeedback(`🎉 You claimed the ${milestone.rewardItem}! Voucher code saved.`);
    setTimeout(() => setClaimFeedback(''), 4000);
  };

  // Copy voucher code
  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Print Certificate action
  const handlePrint = () => {
    window.print();
  };

  // Dispatch Official Certificate Email (PDF Attachment)
  const handleSendEmail = async () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('signup');
      return;
    }
    setSendingEmail(true);
    setEmailStatusMsg(null);
    try {
      const recipientName = currentUser.name || userName || 'Habit Twin';
      const res = await sendCertificateEmail({
        name: recipientName,
        email: currentUser.email,
        forceTest: true,
      });
      if (res && res.success) {
        setEmailStatusMsg({
          type: 'success',
          text: res.message || `Official certificate PDF dispatched to ${currentUser.email}!`,
          mode: res.delivery_mode,
        });
        if (onRefreshCertStatus) onRefreshCertStatus();
      } else {
        setEmailStatusMsg({
          type: 'error',
          text: res?.message || 'Could not send certificate email.',
        });
      }
    } catch (err) {
      setEmailStatusMsg({
        type: 'error',
        text: err?.message || 'Network error while sending certificate email.',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <section className="space-y-8 select-none">
      {/* ================================================================= */}
      {/* 1. Header Hero Banner with Tangible Rewards Promise               */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-pink-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Main Character Energy • Real Goodies &amp; Swag</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Habit Streaks &amp; Real Goodies 🏆
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Show up every day, log your habits, and earn tangible student rewards:{' '}
              <strong className="text-purple-600 dark:text-purple-400">15 Days = Goodies Pack</strong> 🎁 •{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">3 Months = HabitTwin T-Shirt</strong> 👕 •{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">6 Months = Water Bottle</strong> 💧 •{' '}
              <strong className="text-amber-500 dark:text-amber-400">1 Year = Golden Hat</strong> 👑
            </p>
          </div>

          {/* Quick Streak Card */}
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500">
              <Flame className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Current Streak
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {currentStreak} <span className="text-sm font-semibold text-amber-500">Days W</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  <Snowflake className="w-3 h-3 text-cyan-500" />
                  <span>{freezesAvailable} Freezes</span>
                </span>
                {isProtectedToday && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Shielded</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Best Era: <strong>{bestStreak} Days</strong> • {totalDays} total check-ins
              </div>
              {onOpenShare && (
                <button
                  type="button"
                  onClick={() => onOpenShare({ cardType: 'achievement', subType: 'streak' })}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Streak &amp; Goodies</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {claimFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{claimFeedback}</span>
        </div>
      )}

      {freezeFeedback && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn ${
            freezeFeedback.type === 'success'
              ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {freezeFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{freezeFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFreezeFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1.5. Streak in Danger / Broken Streak Recovery Banner              */}
      {/* ================================================================= */}
      {isStreakBroken && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 dark:from-amber-950/60 dark:via-rose-950/40 dark:to-amber-950/60 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-lg shadow-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-amber-950 dark:text-amber-200">
                  Streak Broken! You missed logging {brokenDate ? `on ${brokenDate}` : 'yesterday'}.
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  Needs Repair
                </span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 max-w-xl leading-relaxed">
                Don&apos;t lose your momentum! Use a Streak Freeze to bridge your missed day and restore your unbroken streak toward the <strong>90-Day T-Shirt</strong> and <strong>180-Day Certificate</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {freezesAvailable > 0 ? (
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => handleRestoreStreak(brokenDate)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Restoring Streak...</span>
                  </>
                ) : (
                  <>
                    <Snowflake className="w-4 h-4 text-cyan-200" />
                    <span>Restore Streak (Use 1 Freeze) 🧊</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClaimEmergencyFreeze}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim Emergency Freeze (+1) ⚡</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1.8. Streak Freeze Vault & Missed Day Protection Control Center    */}
      {/* ================================================================= */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-indigo-500/10 dark:from-cyan-950/40 dark:via-sky-950/20 dark:to-indigo-950/30 border border-cyan-200/80 dark:border-cyan-800/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-sm">
              <Snowflake className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Streak Freeze &amp; Shield Vault 🧊
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  Auto-Protection Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Life happens! Freezes automatically protect your streak if you miss a day so your rewards stay safe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClaimEmergencyFreeze}
              disabled={freezesAvailable >= 3}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 transition-colors shadow-sm disabled:opacity-40"
              title="Claim an emergency streak freeze (Max 3 active)"
            >
              {freezesAvailable >= 3 ? 'Vault Full (3/3 Ready)' : '+ Claim Free Freeze ⚡'}
            </button>
            {isStreakBroken && (
              <button
                type="button"
                onClick={() => handleRestoreStreak()}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Now</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Visual Freeze Inventory Pods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[0, 1, 2].map((slotIdx) => {
            const isActive = slotIdx < freezesAvailable;
            return (
              <div
                key={slotIdx}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-white/80 dark:bg-slate-900/80 border-cyan-300/80 dark:border-cyan-800 shadow-sm'
                    : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isActive ? '🧊' : '⚪'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isActive ? `Streak Freeze #${slotIdx + 1}` : `Empty Slot #${slotIdx + 1}`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isActive ? 'Shields 1 Missed Day' : 'Earn every 15-day streak'}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                      : 'text-slate-400'
                  }`}
                >
                  {isActive ? 'Active' : 'Unused'}
                </span>
              </div>
            );
          })}
        </div>

        {/* List of Dates Protected by Freezes */}
        {frozenDates.length > 0 && (
          <div className="pt-2 border-t border-cyan-200/50 dark:border-cyan-900/50 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>Shielded Streak Days ({frozenDates.length}):</span>
            </span>
            {frozenDates.map((fd) => (
              <span
                key={fd}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-300/80 dark:border-cyan-800 inline-flex items-center gap-1 shadow-sm"
              >
                <span>❄️</span>
                <span>{fd}</span>
                <span className="text-[9px] uppercase tracking-wider text-cyan-500">(Protected)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 2. The 4 Major Streak Goodies (15-Day, 3-Month, 6-Month, 1-Year)  */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>Streak Goodies &amp; Physical Rewards</span>
          </h3>
          <span className="text-xs text-slate-500">Log Daily to Unlock Real Swag</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MILESTONES.map((m) => {
            const unlocked = isMilestoneUnlocked(m);
            const claimed = isMilestoneClaimed(m);
            const Icon = m.icon;

            return (
              <div
                key={m.id}
                className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                  unlocked
                    ? `bg-gradient-to-b ${m.gradient} ${m.border} shadow-lg ${m.glow}`
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-90'
                }`}
              >
                <div>
                  {/* Top Row: Icon & Status Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                        unlocked
                          ? `${m.bgBadge} ${m.border}`
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-3xl">{m.emoji}</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        claimed
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : unlocked
                          ? m.bgBadge
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {claimed ? '✓ Claimed 🎉' : unlocked ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>

                  {/* Title & Goodie Description */}
                  <div className="space-y-1.5">
                    <div className={`text-xs font-bold uppercase tracking-wider ${m.accentColor}`}>
                      {m.tag}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{m.shortTitle}</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Interactive Action Buttons */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Streak Progress</span>
                    <span className={unlocked ? m.accentColor : 'text-slate-700 dark:text-slate-300'}>
                      {Math.min(m.targetDays, bestStreak)} / {m.targetDays} Days
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.color === 'purple'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                          : m.color === 'indigo'
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-500'
                          : m.color === 'emerald'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, (bestStreak / m.targetDays) * 100)}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 text-right">
                    {claimed
                      ? 'Swag active • Check voucher'
                      : unlocked
                      ? 'Ready to claim reward! 🎁'
                      : `${Math.max(0, m.targetDays - bestStreak)} more days of logging to earn`}
                  </div>

                  {/* Primary Button */}
                  <button
                    type="button"
                    onClick={() => setActiveGoodieModal(m)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                      unlocked
                        ? `${m.btnColor} hover:scale-[1.01]`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{claimed ? 'View Claim Voucher' : unlocked ? `Claim ${m.shortTitle}` : `Preview ${m.shortTitle}`}</span>
                  </button>

                  {/* Secondary Certificate button & Email Delivery for 6-month tier */}
                  {m.hasCertificate && (
                    <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowCertificate(true)}
                          className="flex-1 py-1.5 px-2 text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{unlocked ? 'View Certificate 📜' : 'Preview 📜'}</span>
                        </button>
                        {unlocked && (
                          <a
                            href={getCertificateDownloadUrl(currentUser?.name || userName || 'Habit Twin', Math.max(bestStreak, 180))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            title="Download official PDF certificate"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        )}
                      </div>

                      {/* Account Connection & Email Status */}
                      {currentUser ? (
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-2.5 border border-emerald-500/20 text-[11px] space-y-1.5">
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="truncate">Email: <strong className="text-slate-700 dark:text-slate-200">{currentUser.email}</strong></span>
                            {certStatus?.cert_6m_sent && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                                <CheckCircle2 className="w-3 h-3" /> Emailed
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={sendingEmail}
                            onClick={handleSendEmail}
                            className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                          >
                            {sendingEmail ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Sending PDF...</span>
                              </>
                            ) : certStatus?.cert_6m_sent ? (
                              <>
                                <Mail className="w-3 h-3" />
                                <span>Resend Certificate PDF</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-3 h-3" />
                                <span>Email PDF Certificate</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                          <p className="text-slate-600 dark:text-slate-400">
                            Sign in to get your official certificate emailed to you automatically at 180 days!
                          </p>
                          <button
                            type="button"
                            onClick={() => onOpenAuth && onOpenAuth('signup')}
                            className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                          >
                            <User className="w-3 h-3" />
                            <span>Connect Email Account</span>
                          </button>
                        </div>
                      )}

                      {emailStatusMsg && (
                        <div
                          className={`p-2 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 ${
                            emailStatusMsg.type === 'success'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200'
                          }`}
                        >
                          {emailStatusMsg.type === 'success' ? (
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                          ) : (
                            <X className="w-3 h-3 shrink-0" />
                          )}
                          <span>{emailStatusMsg.text}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. Bonus Gen Z Habit Arc Badges                                   */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Gen Z Habit Arc Badges</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            {
              id: 'weapon',
              title: 'Academic Weapon',
              emoji: '📚',
              desc: 'Logged ≥3.5h study',
              unlocked: studyCount >= 5,
              count: `${studyCount} days`,
              color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
            },
            {
              id: 'sleep',
              title: 'Snooze Denier',
              emoji: '💤',
              desc: '7–9h restorative sleep',
              unlocked: sleepCount >= 5,
              count: `${sleepCount} days`,
              color: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
            },
            {
              id: 'grass',
              title: 'Grass Touched',
              emoji: '🌿',
              desc: 'Leisure screen ≤2.5h',
              unlocked: grassCount >= 5,
              count: `${grassCount} days`,
              color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
            },
            {
              id: 'budget',
              title: 'Budget Sigma',
              emoji: '💸',
              desc: 'Spending within allowance',
              unlocked: budgetCount >= 5,
              count: `${budgetCount} days`,
              color: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
            },
          ].map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all ${
                b.unlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{b.emoji}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    b.unlocked ? b.color : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {b.unlocked ? 'Unlocked' : '5 days req'}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.desc}</div>
              <div className="text-[10px] font-semibold text-slate-400 mt-2">Earned: {b.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. Interactive Goodie Claim & Swag Inspection Modal               */}
      {/* ================================================================= */}
      {activeGoodieModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            {/* Modal Header Bar */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeGoodieModal.emoji}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeGoodieModal.title}
                  </h3>
                  <span className={`text-[11px] font-bold ${activeGoodieModal.accentColor}`}>
                    {activeGoodieModal.tag} Milestone
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveGoodieModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Unlocked / Locked Status Banner */}
              {isMilestoneUnlocked(activeGoodieModal) ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Streak Milestone Unlocked!</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Your {bestStreak}-day habit streak qualifies you for the official {activeGoodieModal.shortTitle}.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Locked Milestone</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Keep your streak alive for{' '}
                    <strong>{activeGoodieModal.targetDays - bestStreak} more consecutive days</strong> to claim this reward!
                  </p>
                </div>
              )}

              {/* What is in the Goodie */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  What&apos;s Included in Your Reward:
                </h5>
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  {activeGoodieModal.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic px-1">
                  {activeGoodieModal.specs}
                </p>
              </div>

              {/* T-Shirt Size Selector if applicable */}
              {activeGoodieModal.hasSize && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Select Your Oversized T-Shirt Size:
                  </label>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedShirtSize(sz)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedShirtSize === sz
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voucher Code Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                    Campus Claim Voucher Code
                  </span>
                  <code className="text-sm font-mono font-black text-indigo-950 dark:text-indigo-200">
                    {activeGoodieModal.voucherCode}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeGoodieModal.voucherCode)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                {isMilestoneUnlocked(activeGoodieModal) ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleClaimReward(activeGoodieModal);
                      setActiveGoodieModal(null);
                    }}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${activeGoodieModal.btnColor}`}
                  >
                    <span>{activeGoodieModal.emoji}</span>
                    <span>
                      {isMilestoneClaimed(activeGoodieModal)
                        ? 'Update Claim Dispatch 🚀'
                        : `Claim ${activeGoodieModal.shortTitle} 🚀`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Reach {activeGoodieModal.targetDays}-Day Streak to Claim</span>
                  </button>
                )}

                {activeGoodieModal.hasCertificate && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGoodieModal(null);
                      setShowCertificate(true);
                    }}
                    className="py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. Full-Screen / Printable Certificate Modal                      */}
      {/* ================================================================= */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/40 overflow-hidden my-8">
            {/* Modal Controls Bar */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>HabitTwin Digital Certificate • 6-Month Discipline</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {currentUser && (
                  <button
                    type="button"
                    disabled={sendingEmail}
                    onClick={handleSendEmail}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {sendingEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email PDF to Me</span>
                      </>
                    )}
                  </button>
                )}
                <a
                  href={getCertificateDownloadUrl(currentUser?.name || userName || 'Habit Twin', Math.max(bestStreak, 180))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                {onOpenShare && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCertificate(false);
                      onOpenShare({ cardType: 'achievement', subType: 'certificate' });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Card</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificate(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {emailStatusMsg && (
              <div
                className={`p-2.5 text-xs font-bold flex items-center justify-between gap-2 border-b ${
                  emailStatusMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {emailStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <X className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{emailStatusMsg.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailStatusMsg(null)}
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Official Certificate Canvas */}
            <div className="p-8 sm:p-12 text-center space-y-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
              {/* Ornate Gold Border Line */}
              <div className="pointer-events-none absolute inset-4 border-2 border-amber-500/40 rounded-2xl" />
              <div className="pointer-events-none absolute inset-5 border border-dashed border-amber-500/25 rounded-xl" />

              {/* Seal Stamp */}
              <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-amber-500">
                  <Award className="w-8 h-8" />
                  <span className="text-[7px] font-black tracking-tighter uppercase mt-0.5">
                    Official Seal
                  </span>
                </div>
              </div>

              {/* Certificate Headings */}
              <div className="relative z-10 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
                  HabitTwin Digital Future Protocol
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-amber-100 tracking-wide uppercase">
                  Certificate of Genuine Appreciation
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-serif italic">
                  Presented in recognition of supreme student resilience &amp; unbroken discipline
                </div>
              </div>

              {/* Recipient */}
              <div className="relative z-10 space-y-2 py-2">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Proudly Awarded To</div>
                <div className="text-2xl sm:text-3xl font-serif font-black text-indigo-600 dark:text-indigo-400 underline decoration-amber-400/80 decoration-2 underline-offset-8">
                  {userName || 'Campus Legend'}
                </div>
              </div>

              {/* Citation */}
              <div className="relative z-10 max-w-lg mx-auto text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic">
                &ldquo;For demonstrating extraordinary grit, successfully transcending late-night doom-scrolling,
                mastering restorative prefrontal sleep, and maintaining unbroken student progress for an entire
                six consecutive months (180 days). Awarded alongside the official HabitTwin Stainless Hydration Flask.
                100% Certified Built Different.&rdquo;
              </div>

              {/* Signatures & Seal */}
              <div className="relative z-10 pt-6 border-t border-amber-500/30 grid grid-cols-2 gap-6 max-w-md mx-auto text-left text-xs">
                <div>
                  <div className="font-serif italic text-sm text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1">
                    Your Future Self (2025)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    Digital Twin Protocol
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif italic text-sm text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-amber-500 mt-1 uppercase tracking-wider font-bold">
                    ✓ Verified No Cap
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
