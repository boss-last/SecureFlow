import React, { useState } from 'react';
import { 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  Code2, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  RefreshCw,
  Terminal,
  ExternalLink,
  Info
} from 'lucide-react';
import { AuditLog, Persona, SecurityTest } from '../types/security';

interface TestSuiteViewProps {
  tests: SecurityTest[];
  selectedTestId: string;
  onSelectTest: (testId: string) => void;
  activePersona: Persona;
  isHardened: boolean;
  onToggleHardening: () => void;
  onExecuteProbe: (test: SecurityTest, customPayload?: any, customEndpoint?: string) => void;
  latestLog?: AuditLog;
  onNavigateToTab: (tab: string) => void;
}

export const TestSuiteView: React.FC<TestSuiteViewProps> = ({
  tests,
  selectedTestId,
  onSelectTest,
  activePersona,
  isHardened,
  onToggleHardening,
  onExecuteProbe,
  latestLog,
  onNavigateToTab,
}) => {
  const currentTest = tests.find(t => t.id === selectedTestId) || tests[0];

  const [customEndpoint, setCustomEndpoint] = useState<string>(currentTest.targetEndpoint);
  const [customPayloadString, setCustomPayloadString] = useState<string>(
    typeof currentTest.defaultPayload === 'object'
      ? JSON.stringify(currentTest.defaultPayload, null, 2)
      : String(currentTest.defaultPayload || '')
  );
  const [inspectorTab, setInspectorTab] = useState<'response' | 'request' | 'remediation'>('response');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSelectTest = (testId: string) => {
    onSelectTest(testId);
    const target = tests.find(t => t.id === testId);
    if (target) {
      setCustomEndpoint(target.targetEndpoint);
      setCustomPayloadString(
        typeof target.defaultPayload === 'object'
          ? JSON.stringify(target.defaultPayload, null, 2)
          : String(target.defaultPayload || '')
      );
    }
  };

  const handleRunProbe = () => {
    setIsExecuting(true);
    let parsedPayload: any = customPayloadString;
    try {
      if (customPayloadString.trim().startsWith('{')) {
        parsedPayload = JSON.parse(customPayloadString);
      }
    } catch {
      parsedPayload = customPayloadString;
    }

    setTimeout(() => {
      onExecuteProbe(currentTest, parsedPayload, customEndpoint);
      setIsExecuting(false);
    }, 280);
  };

  const activeLog = (latestLog && latestLog.testId === currentTest.id) ? latestLog : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Sélecteur de scénario OWASP */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-medium text-slate-400 mb-2">Choisir un scénario de test de vulnérabilité :</div>
        <div className="flex flex-wrap items-center gap-2">
          {tests.map(test => {
            const isSelected = test.id === currentTest.id;
            return (
              <button
                key={test.id}
                onClick={() => handleSelectTest(test.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="font-mono text-[11px] opacity-75">{test.owaspId.split(' - ')[0]}</span>
                <span className="truncate max-w-[200px]">{test.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Laboratoire d'Exécution en 2 Colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Colonne Gauche : Spécifications & Établi d'injection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 space-y-4">
            {/* Titre et métadonnées */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-cyan-400 font-bold">{currentTest.owaspId}</span>
                <span className="font-mono text-slate-400">Score CVSS {currentTest.cvssScore}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentTest.name}
              </h2>
              <div className="mt-1 text-xs font-mono text-slate-500">
                {currentTest.cwe}
              </div>
            </div>

            {/* Description du scénario d'attaque */}
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Scénario d'Exploitation & Vecteur d'Attaque :
              </div>
              <p className="leading-relaxed text-slate-400">
                {currentTest.exploitScenario}
              </p>
            </div>

            {/* Champ Point de Terminaison REST */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Point de Terminaison REST Cible :</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs">
                <span className="text-cyan-400 font-bold">{currentTest.httpMethod}</span>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="bg-transparent text-slate-200 w-full focus:outline-none text-xs font-mono"
                />
              </div>
            </div>

            {/* Éditeur de charge utile si applicable */}
            {currentTest.httpMethod !== 'GET' || currentTest.category === 'sqli' ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Charge Utile (Payload) / Paramètres :</label>
                  <button
                    onClick={() => {
                      setCustomPayloadString(
                        typeof currentTest.defaultPayload === 'object'
                          ? JSON.stringify(currentTest.defaultPayload, null, 2)
                          : String(currentTest.defaultPayload || '')
                      );
                    }}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customPayloadString}
                  onChange={(e) => setCustomPayloadString(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            ) : null}

            {/* En-tête Persona actif */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Profil Authentifié :</span>
                <span className="font-semibold text-white">{activePersona.name}</span>
                <span className="text-slate-400 font-mono ml-2">({activePersona.role})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Jeton Bearer :</span>
                <span className="text-[11px] font-mono text-cyan-400">Bearer {activePersona.token.slice(0, 14)}...</span>
              </div>
            </div>

            {/* Bouton d'envoi de la sonde */}
            <div className="pt-2">
              <button
                onClick={handleRunProbe}
                disabled={isExecuting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm shadow-cyan-600/30 cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${isExecuting ? 'animate-bounce' : ''}`} />
                <span>{isExecuting ? 'Transmission de la requête...' : `Envoyer la Sonde de Test (${currentTest.httpMethod})`}</span>
              </button>
            </div>

            {/* Indicateur de Mode de durcissement */}
            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              isHardened 
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' 
                : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {isHardened ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>
                  Mode Actif : <strong>{isHardened ? 'Mode Sécurisé (ORM Scopé)' : 'Mode Vulnérable (Lab d’Audit)'}</strong>
                </span>
              </div>
              <button
                onClick={onToggleHardening}
                className="text-xs underline cursor-pointer text-slate-200 hover:text-white"
              >
                Changer
              </button>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Inspecteur Réseau & Diagnostic (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 space-y-4">
            {/* Sélecteur d'onglets de l'inspecteur */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <button
                  onClick={() => setInspectorTab('response')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    inspectorTab === 'response' 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Réponse HTTP (JSON)
                </button>
                <button
                  onClick={() => setInspectorTab('request')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    inspectorTab === 'request' 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Inspecteur de Requête
                </button>
                <button
                  onClick={() => setInspectorTab('remediation')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    inspectorTab === 'remediation' 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Remédiation & Défense
                </button>
              </div>

              {activeLog && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">Statut :</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    activeLog.responseStatus === 200 && activeLog.findingStatus === 'VULNERABILITY_CONFIRMED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : activeLog.responseStatus >= 400
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {activeLog.responseStatus}
                  </span>
                  <span className="text-slate-500">({activeLog.latencyMs} ms)</span>
                </div>
              )}
            </div>

            {/* Bannière de Diagnostic de Sécurité */}
            {activeLog ? (
              <div className={`p-4 rounded-lg border text-xs space-y-1.5 ${
                activeLog.findingStatus === 'VULNERABILITY_CONFIRMED'
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  : activeLog.findingStatus === 'REMEDIATED'
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    {activeLog.findingStatus === 'VULNERABILITY_CONFIRMED' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>
                      {activeLog.findingStatus === 'VULNERABILITY_CONFIRMED' 
                        ? 'FAILLE DE SÉCURITÉ CONFIRMÉE (VULNÉRABLE)'
                        : 'CONTRÔLE VALIDÉ ET PROTÉGÉ (SÉCURISÉ)'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] opacity-75">
                    {new Date(activeLog.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="leading-relaxed font-mono text-[11px]">
                  {activeLog.findingDetail}
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 p-4 rounded-lg text-center text-xs text-slate-400">
                Cliquez sur <strong>"Envoyer la Sonde de Test"</strong> pour exécuter la requête et inspecter la réponse en direct.
              </div>
            )}

            {/* Onglet 1 : Corps de la réponse HTTP */}
            {inspectorTab === 'response' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Corps de la Réponse du Serveur (JSON) :</span>
                  <span className="font-mono text-[11px]">Content-Type: application/json</span>
                </div>
                <pre className="bg-[#0A0D14] border border-slate-800 p-4 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto max-h-[360px] leading-relaxed">
                  {activeLog 
                    ? JSON.stringify(activeLog.responseBody, null, 2)
                    : '// En attente d\'exécution. Cliquez sur "Envoyer la Sonde" pour interroger l\'API.'}
                </pre>

                {/* En-têtes de réponse */}
                {activeLog && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-slate-400 block mb-1">En-têtes HTTP de Réponse :</span>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                      {Object.entries(activeLog.responseHeaders).map(([cle, val]) => (
                        <div key={cle}>
                          <span className="text-slate-500">{cle}:</span> {val}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Onglet 2 : Inspecteur de Requête HTTP */}
            {inspectorTab === 'request' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">Trame HTTP Sortante Reconstituée :</div>
                <div className="bg-[#0A0D14] border border-slate-800 p-4 rounded-lg text-xs font-mono space-y-2 text-slate-300">
                  <div className="text-cyan-400 font-bold">
                    {currentTest.httpMethod} {customEndpoint} HTTP/1.1
                  </div>
                  <div className="text-slate-400 border-t border-slate-800 pt-2 space-y-1">
                    <div>Host: api.secureflow.interne</div>
                    <div>Authorization: Bearer {activePersona.token}</div>
                    <div>X-User-Role: {activePersona.role}</div>
                    <div>Accept: application/json</div>
                    <div>Content-Type: application/json</div>
                  </div>
                  {currentTest.httpMethod !== 'GET' && (
                    <div className="border-t border-slate-800 pt-2">
                      <div className="text-slate-500 mb-1">// Corps de requête (JSON)</div>
                      <pre className="text-slate-200">{customPayloadString}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Onglet 3 : Remédiation & Défense */}
            {inspectorTab === 'remediation' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-white mb-1">Guide de Remédiation & Durcissement</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {currentTest.remediationAdvice}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200 block">Comparer le Code Source Django / Python</span>
                    <span className="text-slate-400 text-[11px]">Visualisez le code vulnérable et le code corrigé côte à côte</span>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('hardening-diff')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium rounded-md cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Voir le Diff</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
