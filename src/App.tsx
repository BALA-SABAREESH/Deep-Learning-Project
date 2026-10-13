import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ImageDetection } from './pages/ImageDetection';
import { VideoDetection } from './pages/VideoDetection';
import { AnalysisHistory } from './pages/AnalysisHistory';
import { ModelInformation } from './pages/ModelInformation';
import { AnalysisRecord } from './types/detection';
import { checkBackendHealth, getModelInfo } from './services/api';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [activeInspectRecord, setActiveInspectRecord] = useState<AnalysisRecord | null>(null);

  // Health and Model status
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<string>('yolo_v8');

  const verifyHealth = useCallback(async () => {
    setCheckingHealth(true);
    try {
      const res = await checkBackendHealth();
      setBackendConnected(true);
      if (res.detector) {
        setModelMode(res.detector);
      }
    } catch {
      setBackendConnected(false);
    } finally {
      setCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, [verifyHealth]);

  const handleAddHistory = (record: AnalysisRecord) => {
    setHistory((prev) => [record, ...prev]);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear current session history?')) {
      setHistory([]);
      setActiveInspectRecord(null);
    }
  };

  const handleSelectRecord = (record: AnalysisRecord) => {
    setActiveInspectRecord(record);
    if (record.type === 'image') {
      setCurrentTab('image');
    } else {
      setCurrentTab('video');
    }
  };

  // Session stats for sidebar
  const sessionStats = {
    totalImages: history.filter((h) => h.type === 'image').length,
    totalVideos: history.filter((h) => h.type === 'video').length,
    violations: history.reduce((sum, h) => sum + h.helmet_violations + h.vest_violations, 0),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        backendConnected={backendConnected}
        checkingHealth={checkingHealth}
        onRefreshHealth={verifyHealth}
        modelMode={modelMode}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setActiveInspectRecord(null);
            setCurrentTab(tab);
          }}
          sessionStats={sessionStats}
        />

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          {/* Connection Alert Banner when backend is starting or connecting */}
          {!backendConnected && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold text-amber-300">
                    Connecting to YOLO Detection Backend...
                  </span>
                  <p className="text-amber-300/80 mt-0.5">
                    FastAPI server on port 8000 is initializing. Pre-loaded inspection samples and client-side visualization remain active.
                  </p>
                </div>
              </div>
              <button
                onClick={verifyHealth}
                disabled={checkingHealth}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition-colors whitespace-nowrap"
              >
                Retry Link
              </button>
            </div>
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              history={history}
              onSelectRecord={handleSelectRecord}
            />
          )}

          {currentTab === 'image' && (
            <ImageDetection
              onAddHistory={handleAddHistory}
              activeInspectRecord={activeInspectRecord}
              onClearInspectRecord={() => setActiveInspectRecord(null)}
            />
          )}

          {currentTab === 'video' && (
            <VideoDetection
              onAddHistory={handleAddHistory}
              activeInspectRecord={activeInspectRecord}
            />
          )}

          {currentTab === 'history' && (
            <AnalysisHistory
              history={history}
              onClearHistory={handleClearHistory}
              onInspectRecord={handleSelectRecord}
            />
          )}

          {currentTab === 'model' && <ModelInformation />}
        </main>
      </div>
    </div>
  );
}
