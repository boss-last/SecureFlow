import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search,
  Filter,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AuditLog, Persona, SecurityTest } from '../types/security';
import { SecurityEvolutionChart } from './SecurityEvolutionChart';

interface DashboardViewProps {
  tests: SecurityTest[];
  auditLogs: AuditLog[];
  activePersona: Persona;
  isHardened: boolean;
  onRunAllTests: () => void;
  isRunningAll: boolean;
  onSelectTest: (testId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onToggleHardening: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tests,
  auditLogs,
  activePersona,
  isHardened,
  onRunAllTests,
  isRunningAll,
  onSelectTest,
  onNavigateToTab,
  onToggleHardening,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const confirmedCount = auditLogs.filter(l => l.findingStatus === 'VULNERABILITY_CONFIRMED').length;
  const remediatedCount = auditLogs.filter(l => l.findingStatus === 'REMEDIATED' || l.findingStatus === 'PASSED').length;
  const blockedCount = auditLogs.filter(l => l.findingStatus === 'BLOCKED').length;

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.findingDetail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && log.findingStatus === statusFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Bannière principale & Contexte de test */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Évaluation AppSec</span>
              <span aria-hidden="true">·</span>
              <span>Cible : secureflow-api-security</span>
              <span aria-hidden="true">·</span>
              <span>Référentiel OWASP API Top 10 (2023)</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Cockpit de Sécurité API & Moniteur de Vulnérabilités
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Testez et observez en conditions réelles les vulnérabilités majeures d’API REST : autorisation brisée 
              au niveau objet (BOLA), injection SQL par concaténation brute, jetons expirés ou falsifiés, et élévation de privilèges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onRunAllTests}
              disabled={isRunningAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-cyan-600/20 cursor-pointer whitespace-nowrap"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
              <span>{isRunningAll ? 'Exécution des sondes...' : 'Lancer l’Audit Complet'}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('audit-report')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Exporter le Rapport Exécutif</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Ligne d'état du Persona et du Backend */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
              {activePersona.avatarInitials}
            </div>
            <div>
              <span className="font-semibold text-white">{activePersona.name}</span>
              <span className="text-slate-500"> ({activePersona.title})</span>
            </div>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-mono">Rôle : {activePersona.role}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">État actif du backend :</span>
              <span className={`font-semibold ${isHardened ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isHardened ? 'Mode Sécurisé (ORM Scopé)' : 'Mode Vulnérable (Failles Actives)'}
              </span>
            </div>
            <button
              onClick={onToggleHardening}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Basculer l'état
            </button>
          </div>
        </div>
      </div>

      {/* Grille des Métriques Clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrique 1 */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total des Sondes Exécutées</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {auditLogs.length}
            </span>
            <span className="text-xs text-slate-500">analyses enregistrées</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span>5 suites de tests OWASP configurées</span>
          </div>
        </div>

        {/* Métrique 2 */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vulnérabilités Confirmées</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {confirmedCount}
            </span>
            <span className="text-xs text-rose-400/80">risques non corrigés</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {isHardened ? '0 risque actif en mode sécurisé' : 'Failles exploitables en lab'}
          </div>
        </div>

        {/* Métrique 3 */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Contrôles Corrigés & Conformes</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {remediatedCount}
            </span>
            <span className="text-xs text-emerald-400/80">vérifications réussies</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <span>Protégé par Django ORM & RBAC</span>
          </div>
        </div>

        {/* Métrique 4 */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Niveau de Posture Sécurité</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2">
            <span className={`text-base font-bold ${isHardened ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isHardened ? 'SÉCURISÉ & CONFORME' : 'ACTION REQUISE'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Modèle STRIDE : 6/6 Atténués</span>
            <button 
              onClick={() => onNavigateToTab('threat-model')}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Détails
            </button>
          </div>
        </div>
      </div>

      {/* Visualisation Recharts de l'Évolution de la Sécurité */}
      <SecurityEvolutionChart
        isHardened={isHardened}
        onToggleHardening={onToggleHardening}
      />

      {/* Matrice Rapide de la Suite OWASP */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Matrice d'Évaluation OWASP API Security</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Posture actuelle sur les 5 vecteurs de tests sous le profil actif ({activePersona.name})
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('test-suite')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Ouvrir le Laboratoire de Test</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => {
            const isVulnerableNow = !isHardened && (
              (test.category === 'bola' && activePersona.role === 'user') ||
              test.category === 'sqli' ||
              test.category === 'auth' ||
              (test.category === 'bfla' && activePersona.role === 'user') ||
              test.category === 'mass_assignment'
            );

            return (
              <div 
                key={test.id} 
                className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <span className="font-mono text-cyan-400 font-semibold">{test.owaspId.split(' - ')[0]}</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                      test.severity === 'CRITICAL' ? 'border-rose-900/60 text-rose-400 bg-rose-950/30' :
                      test.severity === 'HIGH' ? 'border-amber-900/60 text-amber-400 bg-amber-950/30' :
                      'border-slate-700 text-slate-300 bg-slate-800/40'
                    }`}>
                      {test.severity === 'CRITICAL' ? 'CRITIQUE' : test.severity === 'HIGH' ? 'ÉLEVÉE' : 'MOYENNE'}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 mb-1">
                    {test.name}
                  </h3>

                  <div className="text-xs font-mono text-slate-400 truncate mb-2">
                    <span className="text-slate-500">{test.httpMethod}</span> {test.targetEndpoint}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {test.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isHardened ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Corrigé & Protégé
                      </span>
                    ) : isVulnerableNow ? (
                      <span className="text-rose-400 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Vulnérable
                      </span>
                    ) : (
                      <span className="text-slate-400">Autorisé / Profil Admin</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onSelectTest(test.id);
                      onNavigateToTab('test-suite');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    Tester &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flux d'Audit et Journaux des Requêtes en Direct */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Journal d'Audit AppSec en Direct</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historique des sondes exécutées, réponses HTTP brutes et diagnostics de vulnérabilités
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Champ de recherche */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrer les journaux..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
              />
            </div>

            {/* Onglets de filtrage par statut */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter('VULNERABILITY_CONFIRMED')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'VULNERABILITY_CONFIRMED' ? 'bg-rose-950/60 text-rose-300' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Vulnérabilités
              </button>
              <button
                onClick={() => setStatusFilter('REMEDIATED')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'REMEDIATED' ? 'bg-emerald-950/60 text-emerald-300' : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                Corrigés
              </button>
            </div>
          </div>
        </div>

        {/* Table des journaux */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Horodatage</th>
                <th className="py-2.5 px-3">Scénario de Test</th>
                <th className="py-2.5 px-3">Point de Terminaison</th>
                <th className="py-2.5 px-3">Statut HTTP</th>
                <th className="py-2.5 px-3">Profil</th>
                <th className="py-2.5 px-3">Diagnostic de Sécurité</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Aucun journal trouvé. Cliquez sur "Lancer l’Audit Complet" pour exécuter les tests.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 10).map((log) => {
                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {log.testName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 truncate max-w-[200px]">
                        <span className="text-cyan-400 font-semibold">{log.method}</span> {log.endpoint}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          log.responseStatus === 200 && log.findingStatus === 'VULNERABILITY_CONFIRMED'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                            : log.responseStatus === 404 || log.responseStatus === 403 || log.responseStatus === 401
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                        }`}>
                          {log.responseStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 uppercase font-mono text-[11px]">
                        {log.role}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold ${
                          log.findingStatus === 'VULNERABILITY_CONFIRMED' ? 'text-rose-400' :
                          log.findingStatus === 'REMEDIATED' ? 'text-emerald-400' :
                          'text-slate-300'
                        }`}>
                          {log.findingStatus === 'VULNERABILITY_CONFIRMED' ? 'Faille Confirmée' :
                           log.findingStatus === 'REMEDIATED' ? 'Corrigé & Protégé' :
                           log.findingStatus === 'BLOCKED' ? 'Bloqué' : 'Conforme'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                        >
                          Inspecter &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'Inspection Rapide */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedLog.testName}</h3>
                <span className="text-xs font-mono text-cyan-400">{selectedLog.method} {selectedLog.endpoint}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-300">Diagnostic de Sécurité :</span>
                <p className="mt-1 text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 font-mono leading-relaxed">
                  {selectedLog.findingDetail}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-300">Statut Réseau : </span>
                <span className="font-mono text-cyan-300 font-bold">{selectedLog.responseStatus}</span>
                <span className="text-slate-500 ml-2">({selectedLog.latencyMs} ms de latence)</span>
              </div>

              <div>
                <span className="font-semibold text-slate-300">Corps de la Réponse JSON :</span>
                <pre className="mt-1 bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 overflow-x-auto font-mono text-[11px]">
                  {JSON.stringify(selectedLog.responseBody, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
