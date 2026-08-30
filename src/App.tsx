import React, { useState, useEffect } from 'react';
import { ScreenName, CurrentUser, Language, NearMissReport, EnvReport, HealthRemindersSettings } from './types';
import {
  getCurrentUser,
  saveCurrentUser,
  getNearMissReports,
  getEnvReports,
  getHealthRemindersSettings,
} from './lib/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { NearMissReportScreen } from './components/screens/NearMissReportScreen';
import { ChecklistScreen } from './components/screens/ChecklistScreen';
import { PPEScanScreen } from './components/screens/PPEScanScreen';
import { AIHazardDetectionScreen } from './components/screens/AIHazardDetectionScreen';
import { HealthReminderScreen } from './components/screens/HealthReminderScreen';
import { EnvironmentReportScreen } from './components/screens/EnvironmentReportScreen';
import { EmergencyScreen } from './components/screens/EmergencyScreen';
import { SafetyManualScreen } from './components/screens/SafetyManualScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ProfileSettingsScreen } from './components/screens/ProfileSettingsScreen';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(getCurrentUser());
  const [nearMissReports, setNearMissReports] = useState<NearMissReport[]>(getNearMissReports());
  const [envReports, setEnvReports] = useState<EnvReport[]>(getEnvReports());
  const [healthSettings, setHealthSettings] = useState<HealthRemindersSettings>(getHealthRemindersSettings());

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'danger' | 'info'>('success');

  // Pre-fill state for Near Miss form (when transferred from AI Hazard Scanner)
  const [nearMissPrefill, setNearMissPrefill] = useState<any>(null);

  // Refresh data from storage
  const refreshData = () => {
    setNearMissReports(getNearMissReports());
    setEnvReports(getEnvReports());
    setHealthSettings(getHealthRemindersSettings());
    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    refreshData();
  }, [currentScreen]);

  const showToast = (msg: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleLanguageChange = (lang: Language) => {
    const updated = { ...currentUser, language: lang };
    saveCurrentUser(updated);
    setCurrentUser(updated);
    showToast(lang === 'th' ? 'เปลี่ยนภาษา: ภาษาไทย' : 'Language: English');
  };

  const handleNavigate = (screen: ScreenName) => {
    // Scroll smoothly to top when switching views
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentScreen(screen);
  };

  const handleAIHazardToNearMiss = (prefillData: any) => {
    setNearMissPrefill(prefillData);
    handleNavigate('near_miss');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4">
        {currentScreen === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            nearMissReports={nearMissReports}
            envReports={envReports}
            healthSettings={healthSettings}
            onRefreshData={refreshData}
          />
        )}

        {currentScreen === 'near_miss' && (
          <NearMissReportScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onReportSubmitted={(msg) => {
              refreshData();
              showToast(msg, 'success');
            }}
            initialData={nearMissPrefill}
          />
        )}

        {currentScreen === 'checklist' && (
          <ChecklistScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onChecklistSubmitted={(msg) => {
              refreshData();
              showToast(msg, 'success');
            }}
          />
        )}

        {currentScreen === 'ppe_scan' && (
          <PPEScanScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'ai_hazard' && (
          <AIHazardDetectionScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSelectForNearMiss={handleAIHazardToNearMiss}
          />
        )}

        {currentScreen === 'health' && (
          <HealthReminderScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            healthSettings={healthSettings}
            onUpdateSettings={(updated) => {
              setHealthSettings(updated);
            }}
          />
        )}

        {(currentScreen === 'environment' || currentScreen === 'env_report') && (
          <EnvironmentReportScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onEnvReportSubmitted={(msg) => {
              refreshData();
              showToast(msg, 'success');
            }}
          />
        )}

        {currentScreen === 'emergency' && (
          <EmergencyScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onEmergencyTriggered={(msg) => {
              refreshData();
              showToast(msg, 'danger');
            }}
          />
        )}

        {currentScreen === 'manual' && (
          <SafetyManualScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            nearMissReports={nearMissReports}
            envReports={envReports}
            onRefreshData={refreshData}
            onShowToast={(msg, type) => showToast(msg, type || 'success')}
          />
        )}

        {(currentScreen === 'profile' || currentScreen === 'settings') && (
          <ProfileSettingsScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
            }}
            onShowToast={(msg, type) => showToast(msg, type || 'success')}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        currentUser={currentUser}
      />
    </div>
  );
}
export default App;
