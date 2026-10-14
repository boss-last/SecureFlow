import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { TestSuiteView } from './components/TestSuiteView';
import { HardeningDiffView } from './components/HardeningDiffView';
import { ThreatModelView } from './components/ThreatModelView';
import { AuditReportView } from './components/AuditReportView';
import { 
  PERSONAS, 
  SECURITY_TESTS, 
  STRIDE_THREAT_MODEL 
} from './data/securityTests';
import { executeSecurityProbe } from './services/securityEngine';
import { AuditLog, Persona, SecurityTest } from './types/security';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activePersonaKey, setActivePersonaKey] = useState<'user' | 'auditor' | 'admin'>('user');
  const [isHardened, setIsHardened] = useState<boolean>(false);
  const [selectedTestId, setSelectedTestId] = useState<string>(SECURITY_TESTS[0].id);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  const activePersona: Persona = PERSONAS[activePersonaKey];

  // Initialize with initial seed audit run
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return SECURITY_TESTS.map(test => {
      return executeSecurityProbe({
        test,
        persona: PERSONAS.user,
        isHardened: false,
      });
    });
  });

  const [latestLog, setLatestLog] = useState<AuditLog | undefined>(auditLogs[0]);

  // Execute a single test probe
  const handleExecuteProbe = (test: SecurityTest, customPayload?: any, customEndpoint?: string) => {
    const newLog = executeSecurityProbe({
      test,
      persona: activePersona,
      isHardened,
      customPayload,
      customEndpoint,
    });
    setLatestLog(newLog);
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Run all tests sequentially
  const handleRunAllTests = () => {
    setIsRunningAll(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < SECURITY_TESTS.length) {
        const test = SECURITY_TESTS[index];
        const log = executeSecurityProbe({
          test,
          persona: activePersona,
          isHardened,
        });
        setLatestLog(log);
        setAuditLogs(prev => [log, ...prev]);
        index++;
      } else {
        clearInterval(interval);
        setIsRunningAll(false);
      }
    }, 350);
  };

  const handleToggleHardening = () => {
    setIsHardened(prev => !prev);
  };

  const handleChangePersona = (role: 'user' | 'auditor' | 'admin') => {
    setActivePersonaKey(role);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Top Bar following contract */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activePersona={activePersona}
        onChangePersona={handleChangePersona}
        isHardened={isHardened}
        onToggleHardening={handleToggleHardening}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            tests={SECURITY_TESTS}
            auditLogs={auditLogs}
            activePersona={activePersona}
            isHardened={isHardened}
            onRunAllTests={handleRunAllTests}
            isRunningAll={isRunningAll}
            onSelectTest={setSelectedTestId}
            onNavigateToTab={setCurrentTab}
            onToggleHardening={handleToggleHardening}
          />
        )}

        {currentTab === 'test-suite' && (
          <TestSuiteView
            tests={SECURITY_TESTS}
            selectedTestId={selectedTestId}
            onSelectTest={setSelectedTestId}
            activePersona={activePersona}
            isHardened={isHardened}
            onToggleHardening={handleToggleHardening}
            onExecuteProbe={handleExecuteProbe}
            latestLog={latestLog}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'hardening-diff' && (
          <HardeningDiffView
            tests={SECURITY_TESTS}
            selectedTestId={selectedTestId}
            onSelectTest={setSelectedTestId}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'threat-model' && (
          <ThreatModelView
            strideItems={STRIDE_THREAT_MODEL}
            isHardened={isHardened}
          />
        )}

        {currentTab === 'audit-report' && (
          <AuditReportView
            tests={SECURITY_TESTS}
            auditLogs={auditLogs}
            strideItems={STRIDE_THREAT_MODEL}
            isHardened={isHardened}
          />
        )}
      </main>

      {/* Pied de page éditorial sobre sans télémétrie superflue */}
      <footer className="border-t border-slate-900 bg-[#0A0D14] py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">SecureFlow</span>
            <span aria-hidden="true">·</span>
            <span>Plateforme d'Audit & Sécurisation d'API</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">secureflow-api-security</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Référentiel OWASP API Security Top 10</span>
            <span aria-hidden="true">·</span>
            <span>Django REST Framework & PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
