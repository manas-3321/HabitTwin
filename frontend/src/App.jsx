import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Mail,
  CalendarCheck,
  Info,
  WifiOff,
  Compass,
  Trophy,
} from 'lucide-react';
import {
  fetchHabits,
  saveHabitLog,
  deleteHabitLog,
  seedSampleHabits,
  clearAllHabits,
  fetchBehavioralAnalysis,
  runPrediction,
  generateFutureLetter,
  fetchCurrentUser,
  logoutUser,
  fetchCertificateStatus,
} from './api/habitApi';
import { getFallbackPrediction } from './utils/fallbackPrediction';
import { generateClientLetter } from './utils/letterGenerator';
import Header from './components/Header';
import ScenarioComparison from './components/ScenarioComparison';
import TrajectoryCharts from './components/TrajectoryCharts';
import WhatIfSimulator from './components/WhatIfSimulator';
import GenZAchievements from './components/GenZAchievements';
import FutureLetter from './components/FutureLetter';
import BehavioralTrends from './components/BehavioralTrends';
import HabitTracker from './components/HabitTracker';
import ShareProgressModal from './components/ShareProgressModal';
import AuthModal from './components/AuthModal';

const TABS = [
  { id: 'twins', label: 'Future Twins', icon: Compass },
  { id: 'whatif', label: 'What-If Lab', icon: Sliders },
  { id: 'achievements', label: 'Achievements 🏆', icon: Trophy },
  { id: 'letter', label: 'Future Letter', icon: Mail },
  { id: 'habits', label: 'Daily Check-In & Trends', icon: CalendarCheck },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('twins');
  const [horizon, setHorizon] = useState('6_months');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('habittwin_theme') === 'dark');

  // Core Data States
  const [logs, setLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSample, setLoadingSample] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [shareConfig, setShareConfig] = useState({
    isOpen: false,
    cardType: 'improved',
  });

  const handleOpenShare = (options = {}) => {
    const cardType = options?.cardType || 'improved';
    setShareConfig({
      isOpen: true,
      cardType,
    });
  };

  const handleCloseShare = () => {
    setShareConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // What-If Simulator State
  const [monthlyAllowance, setMonthlyAllowance] = useState(() => {
    const saved = localStorage.getItem('habittwin_monthly_allowance');
    return saved ? parseFloat(saved) : 1500;
  });

  const [whatIfInputs, setWhatIfInputs] = useState(() => {
    const saved = localStorage.getItem('habittwin_monthly_allowance');
    const allow = saved ? parseFloat(saved) : 1500;
    return {
      sleep_hours: 7.5,
      study_hours: 4.0,
      study_screen_hours: 3.5,
      leisure_screen_hours: 2.0,
      screen_time_hours: 5.5,
      physical_activity_minutes: 45,
      daily_spending: Math.round(allow / 30),
      monthly_income: allow,
      monthly_allowance: allow,
      study_mode: 'regular',
      mental_mood: 'balanced',
    };
  });
  const whatIfTimerRef = useRef(null);

  // Future-Self Letter State
  const [letter, setLetter] = useState(null);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [letterScenario, setLetterScenario] = useState('improved');
  const [letterTone, setLetterTone] = useState('motivational');
  const [letterFocus, setLetterFocus] = useState('balanced');
  const [letterHabitSource, setLetterHabitSource] = useState('logs');
  const [userName, setUserName] = useState('Alex');

  // User Auth & Certificate State
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const [certStatus, setCertStatus] = useState(null);

  // Restore active user session & certificate status on launch
  const refreshUserAndCert = useCallback(async () => {
    try {
      const userRes = await fetchCurrentUser();
      const user = userRes?.user || userRes;
      if (user && user.email) {
        setCurrentUser(user);
        if (user.name) {
          setUserName(user.name);
        }
        const statusRes = await fetchCertificateStatus();
        if (statusRes) {
          setCertStatus(statusRes);
        }
      } else {
        setCurrentUser(null);
        setCertStatus(null);
      }
    } catch (err) {
      console.warn('Could not restore auth session:', err);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUserAndCert();
  }, [refreshUserAndCert]);

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (data) => {
    const user = data?.user || data;
    if (user && user.email) {
      setCurrentUser(user);
      if (user.name) {
        setUserName(user.name);
      }
    }
    setShowAuthModal(false);
    fetchCertificateStatus().then((res) => {
      if (res) setCertStatus(res);
    });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCertStatus(null);
  };

  // Toggle dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('habittwin_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('habittwin_theme', 'light');
    }
  }, [darkMode]);

  // Master data refresh pipeline
  const refreshAllData = useCallback(
    async (targetHorizon = horizon, customWhatIf = null) => {
      try {
        const { logs: fetchedLogs, offline } = await fetchHabits();
        setLogs(fetchedLogs);
        setOfflineMode(offline);

        if (!offline) {
          const [analysisRes, predRes] = await Promise.all([
            fetchBehavioralAnalysis(),
            runPrediction({
              horizon: targetHorizon,
              whatIf: customWhatIf,
              monthlyIncome: customWhatIf?.monthly_income || whatIfInputs.monthly_income,
            }),
          ]);
          setAnalysis(analysisRes);
          setPrediction(predRes);

          // Sync What-If baseline defaults on initial load if not customized yet
          if (!customWhatIf && predRes?.baseline_habits) {
            setWhatIfInputs((prev) => ({
              ...prev,
              sleep_hours: predRes.baseline_habits.sleep_hours,
              screen_time_hours: predRes.baseline_habits.screen_time_hours,
              physical_activity_minutes: Math.round(predRes.baseline_habits.physical_activity_minutes),
              study_hours: predRes.baseline_habits.study_hours,
              daily_spending: Math.round(predRes.baseline_habits.daily_spending),
            }));
          }
        } else {
          // Fallback simulation ensures the UI is never blank even before backend connects
          setPrediction(getFallbackPrediction(targetHorizon, customWhatIf || whatIfInputs));
        }
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
        setOfflineMode(true);
        setPrediction((prev) => prev || getFallbackPrediction(targetHorizon, customWhatIf || whatIfInputs));
      } finally {
        setLoadingInitial(false);
      }
    },
    [horizon, whatIfInputs.monthly_income]
  );

  // Load letter when relevant params change
  const loadLetter = useCallback(async () => {
    setLoadingLetter(true);

    // 1. Calculate user's actual baseline habits from logs or fallback
    let baseline = prediction?.baseline_habits;
    if (!baseline && logs.length > 0) {
      const avg = (key) => logs.reduce((acc, l) => acc + (Number(l[key]) || 0), 0) / logs.length;
      baseline = {
        sleep_hours: Math.round(avg('sleep_hours') * 10) / 10,
        screen_time_hours: Math.round(avg('screen_time_hours') * 10) / 10,
        physical_activity_minutes: Math.round(avg('physical_activity_minutes')),
        study_hours: Math.round(avg('study_hours') * 10) / 10,
        daily_spending: Math.round(avg('total_spending') || 120),
      };
    }
    if (!baseline) {
      baseline = {
        sleep_hours: 6.2,
        screen_time_hours: 6.5,
        physical_activity_minutes: 20,
        study_hours: 2.2,
        daily_spending: 380,
      };
    }

    // 2. Calculate target habits based on habit source
    let targetHabits = null;
    if (letterHabitSource === 'whatif') {
      targetHabits = {
        sleep_hours: whatIfInputs.sleep_hours,
        screen_time_hours: whatIfInputs.screen_time_hours,
        physical_activity_minutes: whatIfInputs.physical_activity_minutes,
        study_hours: whatIfInputs.study_hours,
        daily_spending: whatIfInputs.daily_spending,
      };
    } else if (letterScenario === 'current') {
      targetHabits = { ...baseline };
    } else {
      // Improved relative to baseline
      targetHabits = {
        sleep_hours: Math.min(8.2, Math.max(7.5, Math.round((baseline.sleep_hours + 1.0) * 10) / 10)),
        screen_time_hours: Math.max(3.2, Math.min(5.0, Math.round((baseline.screen_time_hours - 1.8) * 10) / 10)),
        physical_activity_minutes: Math.min(60, Math.max(40, baseline.physical_activity_minutes + 20)),
        study_hours: Math.min(6.5, Math.max(4.0, Math.round((baseline.study_hours + 1.5) * 10) / 10)),
        daily_spending: Math.max(80, Math.round(baseline.daily_spending * 0.65)),
      };
    }

    const streakDays = logs.length || analysis?.summary_stats?.logging_streak || 0;
    const latestNote = logs.length > 0 && logs[0].notes ? logs[0].notes : '';

    try {
      if (!offlineMode) {
        const res = await generateFutureLetter({
          scenario: letterScenario,
          horizon,
          tone: letterTone,
          userName: userName.trim() || 'Alex',
          userFocus: letterFocus,
          currentHabits: baseline,
          targetHabits: targetHabits,
          streakDays: streakDays,
          latestNotes: latestNote,
        });
        if (res && res.letter_content) {
          setLetter(res);
          setLoadingLetter(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend letter call failed, generating via client narrative engine:', err);
    }

    // Client-side fallback generator
    const activeMetrics = letterScenario === 'improved'
      ? (prediction?.scenario_custom?.metrics || prediction?.scenario_b_improved?.metrics)
      : prediction?.scenario_a_current?.metrics;
    const clientLetter = generateClientLetter({
      userName: userName.trim() || 'Alex',
      scenario: letterScenario,
      horizon,
      tone: letterTone,
      habits: targetHabits,
      metrics: activeMetrics || {},
      baselineHabits: baseline,
      userFocus: letterFocus,
      streakDays: streakDays,
      latestNotes: latestNote,
    });
    setLetter(clientLetter);
    setLoadingLetter(false);
  }, [letterScenario, horizon, letterTone, letterFocus, letterHabitSource, userName, offlineMode, prediction, whatIfInputs, logs, analysis]);

  // Initial mount
  useEffect(() => {
    refreshAllData(horizon, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run prediction and letter when horizon changes
  useEffect(() => {
    if (!loadingInitial) {
      refreshAllData(horizon, whatIfInputs);
      loadLetter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizon]);

  // Load letter automatically on startup & whenever tone, scenario, focus, source, or name changes
  useEffect(() => {
    if (!loadingInitial) {
      loadLetter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingInitial, letterScenario, letterTone, letterFocus, letterHabitSource, userName]);

  // Reload letter when habits change or when switching to letter tab
  const letterTimerRef = useRef(null);
  useEffect(() => {
    if (loadingInitial) return;
    if (letterHabitSource === 'whatif' || activeTab === 'letter') {
      if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
      letterTimerRef.current = setTimeout(() => {
        loadLetter();
      }, 250);
    }
  }, [whatIfInputs, letterHabitSource, activeTab, userName]);

  // Real-time debounced What-If slider handler (strictly bounded by 24h day budget)
  const handleSliderChange = (key, rawVal) => {
    setWhatIfInputs((prev) => {
      let val = Number(rawVal);
      const sleep = key === 'sleep_hours' ? val : (prev.sleep_hours ?? 7.5);
      let study = key === 'study_hours' ? val : (prev.study_hours ?? 4.0);
      let studyScreen = key === 'study_screen_hours' ? val : (prev.study_screen_hours ?? Math.min(study, 3.5));
      let leisureScreen = key === 'leisure_screen_hours' ? val : (prev.leisure_screen_hours ?? 2.0);
      let exerciseMins = key === 'physical_activity_minutes' ? val : (prev.physical_activity_minutes ?? 45);

      // Enforce 24-hour physical day boundary: sum of active commitments cannot exceed 24h
      const otherHours =
        (key === 'sleep_hours' ? 0 : sleep) +
        (key === 'study_hours' ? 0 : study) +
        (key === 'leisure_screen_hours' ? 0 : leisureScreen) +
        (key === 'physical_activity_minutes' ? 0 : exerciseMins / 60);

      const maxAvailableForThis = Math.max(0, 24.0 - otherHours);

      if (key === 'sleep_hours') val = Math.min(val, Math.floor(maxAvailableForThis * 2) / 2);
      if (key === 'study_hours') val = Math.min(val, Math.floor(maxAvailableForThis * 2) / 2);
      if (key === 'leisure_screen_hours') val = Math.min(val, Math.floor(maxAvailableForThis * 2) / 2);
      if (key === 'physical_activity_minutes') val = Math.min(val, Math.floor(maxAvailableForThis * 60));

      const updated = { ...prev, [key]: val };

      // Ensure study screen does not exceed total study hours
      const activeStudy = key === 'study_hours' ? val : study;
      let activeStudyScreen = key === 'study_screen_hours' ? val : studyScreen;
      if (activeStudyScreen > activeStudy) {
        activeStudyScreen = activeStudy;
        updated.study_screen_hours = activeStudy;
      }
      const activeLeisure = key === 'leisure_screen_hours' ? val : leisureScreen;
      updated.screen_time_hours = Math.round((activeStudyScreen + activeLeisure) * 10) / 10;

      if (key === 'monthly_allowance' || key === 'monthly_income') {
        const num = Math.round(Number(val) || 1500);
        updated.monthly_income = num;
        updated.monthly_allowance = num;
        updated.daily_spending = Math.round(num / 30);
        setMonthlyAllowance(num);
        localStorage.setItem('habittwin_monthly_allowance', String(num));
      }

      if (offlineMode) {
        setPrediction(getFallbackPrediction(horizon, updated));
      } else {
        if (whatIfTimerRef.current) clearTimeout(whatIfTimerRef.current);
        whatIfTimerRef.current = setTimeout(async () => {
          try {
            const predRes = await runPrediction({
              horizon,
              whatIf: updated,
              monthlyIncome: updated.monthly_income,
            });
            setPrediction(predRes);
          } catch (err) {
            console.error('What-If update failed:', err);
            setPrediction(getFallbackPrediction(horizon, updated));
          }
        }, 150);
      }

      return updated;
    });
  };

  const handleUpdateMonthlyAllowance = (val) => {
    const num = Math.max(500, Math.round(Number(val) || 1500));
    setMonthlyAllowance(num);
    localStorage.setItem('habittwin_monthly_allowance', String(num));
    handleSliderChange('monthly_allowance', num);
  };

  const handleResetWhatIf = async () => {
    if (!prediction?.baseline_habits) return;
    const b = prediction.baseline_habits;
    const studyH = b.study_hours ?? 4.0;
    const studyScreen = Math.min(studyH, 3.5);
    const leisureScreen = Math.max(0, (b.screen_time_hours ?? 5.5) - studyScreen);
    const resetValues = {
      sleep_hours: b.sleep_hours,
      study_hours: studyH,
      study_screen_hours: studyScreen,
      leisure_screen_hours: leisureScreen,
      screen_time_hours: b.screen_time_hours,
      physical_activity_minutes: Math.round(b.physical_activity_minutes),
      daily_spending: 50,
      monthly_income: 1500,
      monthly_allowance: 1500,
      study_mode: b.study_mode || 'regular',
      mental_mood: b.mental_mood || 'balanced',
    };
    setWhatIfInputs(resetValues);
    if (!offlineMode) {
      try {
        const predRes = await runPrediction({
          horizon,
          whatIf: resetValues,
          monthlyIncome: resetValues.monthly_income,
        });
        setPrediction(predRes);
      } catch {
        setPrediction(getFallbackPrediction(horizon, resetValues));
      }
    } else {
      setPrediction(getFallbackPrediction(horizon, resetValues));
    }
  };

  const handleApplyHealthyPreset = async () => {
    const healthy = {
      sleep_hours: 8.0,
      study_hours: 4.5,
      study_screen_hours: 4.0,
      leisure_screen_hours: 1.5,
      screen_time_hours: 5.5,
      physical_activity_minutes: 50,
      daily_spending: 50,
      monthly_income: 1500,
      monthly_allowance: 1500,
      study_mode: 'regular',
      mental_mood: 'sharp',
    };
    setWhatIfInputs(healthy);
    if (!offlineMode) {
      try {
        const predRes = await runPrediction({
          horizon,
          whatIf: healthy,
          monthlyIncome: healthy.monthly_income,
        });
        setPrediction(predRes);
      } catch {
        setPrediction(getFallbackPrediction(horizon, healthy));
      }
    } else {
      setPrediction(getFallbackPrediction(horizon, healthy));
    }
  };

  const handleLoadSampleData = async () => {
    setLoadingSample(true);
    try {
      await seedSampleHabits();
      await refreshAllData(horizon, null);
      await loadLetter();
    } catch (err) {
      console.error('Sample data load failed:', err);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleSaveLog = async (entry) => {
    await saveHabitLog(entry);
    await refreshAllData(horizon, whatIfInputs);
    await loadLetter();
  };

  const handleDeleteLog = async (id) => {
    await deleteHabitLog(id);
    await refreshAllData(horizon, whatIfInputs);
    await loadLetter();
  };

  const handleClearAll = async () => {
    setLoadingReset(true);
    try {
      await clearAllHabits();
      await refreshAllData(horizon, whatIfInputs);
      await loadLetter();
    } catch (err) {
      console.error('Reset to zero failed:', err);
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar */}
      <Header
        horizon={horizon}
        setHorizon={setHorizon}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLoadSample={handleLoadSampleData}
        loadingSample={loadingSample}
        hasLogs={logs.length > 0}
        onResetZero={handleClearAll}
        loadingReset={loadingReset}
        onOpenShare={() => handleOpenShare({ cardType: 'improved' })}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        certStatus={certStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Friendly Notice when in Offline/Preview Mode */}
        {offlineMode && (
          <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <strong>Backend not connected.</strong> Showing instant offline simulation preview.
                Connect your Render backend URL in Vercel settings (as <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 font-mono text-xs">VITE_API_URL</code>) to activate live ML sync.
              </div>
            </div>
          </div>
        )}

        {/* Welcome Hint if User Has Zero Habit Logs Yet */}
        {!loadingInitial && !offlineMode && logs.length === 0 && (
          <div className="rounded-3xl p-6 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                  Welcome to HabitTwin! You haven&apos;t logged any days yet.
                </h2>
                <p className="text-xs text-indigo-700/90 dark:text-indigo-300 mt-0.5">
                  Right now you&apos;re seeing an illustrative starting profile. Load our 30-day sample routine or log today&apos;s habits to personalize your twins!
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleLoadSampleData}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
              >
                Load Sample Routine
              </button>
              <button
                onClick={() => setActiveTab('habits')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700"
              >
                Log First Day
              </button>
            </div>
          </div>
        )}

        {/* Clean Tab Navigation Pills */}
        <nav className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Loading State */}
        {loadingInitial ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Simulating your future twins...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Future Twins & Charts */}
            {activeTab === 'twins' && (
              <div className="space-y-8">
                <ScenarioComparison prediction={prediction} onOpenShare={handleOpenShare} />
                <TrajectoryCharts prediction={prediction} logs={logs} onResetZero={handleClearAll} />
              </div>
            )}

            {/* Tab 2: Interactive What-If Lab */}
            {activeTab === 'whatif' && (
              <div className="space-y-8">
                <WhatIfSimulator
                  whatIfInputs={whatIfInputs}
                  onChangeSlider={handleSliderChange}
                  onReset={handleResetWhatIf}
                  onApplyHealthyPreset={handleApplyHealthyPreset}
                  customScenario={prediction?.scenario_custom || prediction?.scenario_a_current}
                  horizon={horizon}
                />
              </div>
            )}

            {/* Tab 3: Gen Z Achievements & Continuous Progress Milestones */}
            {activeTab === 'achievements' && (
              <div className="space-y-8">
                <GenZAchievements
                  logs={logs}
                  analysis={analysis}
                  userName={userName}
                  onOpenShare={handleOpenShare}
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                  certStatus={certStatus}
                  onRefreshCertStatus={refreshUserAndCert}
                />
              </div>
            )}

            {/* Tab 4: Letter From Future Self */}
            {activeTab === 'letter' && (
              <FutureLetter
                letter={letter}
                loadingLetter={loadingLetter}
                scenario={letterScenario}
                setScenario={setLetterScenario}
                tone={letterTone}
                setTone={setLetterTone}
                userFocus={letterFocus}
                setUserFocus={setLetterFocus}
                habitSource={letterHabitSource}
                setHabitSource={setLetterHabitSource}
                userName={userName}
                setUserName={setUserName}
                horizon={horizon}
                onRegenerate={loadLetter}
                onOpenShare={handleOpenShare}
                whatIfInputs={whatIfInputs}
                onChangeSlider={handleSliderChange}
                logs={logs}
              />
            )}

            {/* Tab 4: Daily Check-In & Behavioral Trends */}
            {activeTab === 'habits' && (
              <div className="space-y-8">
                <HabitTracker
                  logs={logs}
                  onSaveLog={handleSaveLog}
                  onDeleteLog={handleDeleteLog}
                  onLoadSample={handleLoadSampleData}
                  onClearAll={handleClearAll}
                  monthlyAllowance={monthlyAllowance}
                  onUpdateAllowance={handleUpdateMonthlyAllowance}
                />
                <BehavioralTrends
                  analysis={analysis}
                  logs={logs}
                  monthlyAllowance={monthlyAllowance}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Friendly Disclaimer Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-start sm:items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Illustrative Simulation Notice:</strong> HabitTwin projections are educational lifestyle simulations built for reflection and motivation—not certified medical, academic, or financial advice.
            </span>
          </div>
          <span className="shrink-0 font-medium text-slate-400">
            Privacy-First • Stored Locally
          </span>
        </div>
      </footer>
      {/* Share Progress Modal */}
      <ShareProgressModal
        isOpen={shareConfig.isOpen}
        onClose={handleCloseShare}
        initialCardType={shareConfig.cardType}
        prediction={prediction}
        logs={logs}
        analysis={analysis}
        userName={userName}
        horizon={horizon}
        letter={letter}
      />
      {/* User Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
