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
} from './api/habitApi';
import { getFallbackPrediction } from './utils/fallbackPrediction';
import Header from './components/Header';
import ScenarioComparison from './components/ScenarioComparison';
import TrajectoryCharts from './components/TrajectoryCharts';
import WhatIfSimulator from './components/WhatIfSimulator';
import GenZAchievements from './components/GenZAchievements';
import FutureLetter from './components/FutureLetter';
import BehavioralTrends from './components/BehavioralTrends';
import HabitTracker from './components/HabitTracker';

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

  // What-If Simulator State
  const [whatIfInputs, setWhatIfInputs] = useState({
    sleep_hours: 7.5,
    study_hours: 4.0,
    study_screen_hours: 3.5,
    leisure_screen_hours: 2.0,
    screen_time_hours: 5.5,
    physical_activity_minutes: 45,
    daily_spending: 50,
    monthly_income: 1500,
    monthly_allowance: 1500,
    study_mode: 'regular',
    mental_mood: 'balanced',
  });
  const whatIfTimerRef = useRef(null);

  // Future-Self Letter State
  const [letter, setLetter] = useState(null);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [letterScenario, setLetterScenario] = useState('improved');
  const [letterTone, setLetterTone] = useState('motivational');
  const [userName, setUserName] = useState('Alex');

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
    if (offlineMode) return;
    setLoadingLetter(true);
    try {
      const res = await generateFutureLetter({
        scenario: letterScenario,
        horizon,
        tone: letterTone,
        userName: userName.trim() || 'Friend',
      });
      setLetter(res);
    } catch (err) {
      console.error('Could not generate letter:', err);
    } finally {
      setLoadingLetter(false);
    }
  }, [letterScenario, horizon, letterTone, userName, offlineMode]);

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

  // Load letter automatically on startup & whenever tone or scenario changes
  useEffect(() => {
    if (!loadingInitial && !offlineMode) {
      loadLetter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingInitial, offlineMode, letterScenario, letterTone]);

  // Real-time debounced What-If slider handler
  const handleSliderChange = (key, val) => {
    setWhatIfInputs((prev) => {
      const updated = { ...prev, [key]: val };
      if (key === 'study_screen_hours' || key === 'leisure_screen_hours') {
        const sScreen = key === 'study_screen_hours' ? val : (prev.study_screen_hours ?? 3.5);
        const lScreen = key === 'leisure_screen_hours' ? val : (prev.leisure_screen_hours ?? 2.0);
        updated.screen_time_hours = Math.round((sScreen + lScreen) * 10) / 10;
      }
      if (key === 'monthly_allowance' || key === 'monthly_income') {
        updated.monthly_income = val;
        updated.monthly_allowance = val;
        updated.daily_spending = Math.round(val / 30);
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
                <ScenarioComparison prediction={prediction} />
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
                userName={userName}
                setUserName={setUserName}
                horizon={horizon}
                onRegenerate={loadLetter}
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
                />
                <BehavioralTrends analysis={analysis} logs={logs} />
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
    </div>
  );
}
