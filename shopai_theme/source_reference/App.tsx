import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { ToastContainer } from './components/common/ToastContainer';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { EmployeeRiskAnalysis } from './components/employees/EmployeeRiskAnalysis';
import { EmployeeDetailModal } from './components/employees/EmployeeDetailModal';
import { WhatIfSimulator } from './components/simulator/WhatIfSimulator';
import { RetentionRecommendationsView } from './components/recommendations/RetentionRecommendationsView';
import { FinancialImpactDashboard } from './components/financial/FinancialImpactDashboard';
import { DepartmentAnalytics } from './components/department/DepartmentAnalytics';
import { ReportsView } from './components/reports/ReportsView';
import { ModelStudio } from './components/ml/ModelStudio';
import { InterventionsView } from './components/interventions/InterventionsView';
import { CsvUploadModal } from './components/common/CsvUploadModal';
import { AuthPage } from './components/auth/AuthPage';
import { AuditLogsModal } from './components/auth/AuditLogsModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isAuthenticated,
    handleAuthSuccess,
    darkMode,
    toggleDarkMode,
    showToast,
    isAuditModalOpen,
    setIsAuditModalOpen,
    setActiveRole,
  } = useApp();

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // If user is not authenticated, display Enterprise Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-slate-900">
        <AuthPage
          onAuthSuccess={(user) => {
            handleAuthSuccess(user);
          }}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          showToast={(msg, type) => showToast(msg, type === 'alert' ? 'error' : type)}
        />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar onOpenUpload={() => setIsCsvModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onOpenUpload={() => setIsCsvModalOpen(true)} />

        {/* Dynamic Page View Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'dashboard' && <ExecutiveDashboard onOpenUpload={() => setIsCsvModalOpen(true)} />}
            {activeTab === 'risk-table' && <EmployeeRiskAnalysis />}
            {activeTab === 'recommendations' && <RetentionRecommendationsView />}
            {activeTab === 'simulator' && <WhatIfSimulator />}
            {activeTab === 'financial' && <FinancialImpactDashboard />}
            {activeTab === 'departments' && <DepartmentAnalytics />}
            {activeTab === 'interventions' && <InterventionsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'model-studio' && <ModelStudio />}
          </div>
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <EmployeeDetailModal />
      <CsvUploadModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} />
      <AuditLogsModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
