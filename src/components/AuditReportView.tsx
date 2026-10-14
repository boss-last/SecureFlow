import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  BookOpen,
  Printer
} from 'lucide-react';
import { AuditLog, SecurityTest, STRIDEItem } from '../types/security';
import { 
  generateExecutiveReport, 
  generatePytestSuite, 
  generateSecurityMd 
} from '../services/codeGenerator';

interface AuditReportViewProps {
  tests: SecurityTest[];
  auditLogs: AuditLog[];
  strideItems: STRIDEItem[];
  isHardened: boolean;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  tests,
  auditLogs,
  strideItems,
  isHardened,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'security_md' | 'pytest' | 'semgrep'>('report');
  const [copied, setCopied] = useState(false);

  const reportMarkdown = generateExecutiveReport(tests, auditLogs, strideItems, isHardened);
  const securityMdText = generateSecurityMd();
  const pytestSuiteText = generatePytestSuite();

  const semgrepYaml = `rules:
  - id: django-injection-sql-brute-non-parametree
    languages: [python]
    message: "Détection d'une concaténation de chaîne dans cursor.execute(). Utilisez l'ORM Django ou transmettez les paramètres dans une liste sécurisée pour empêcher les injections SQL (CWE-89)."
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: $CURSOR.execute(f"...")
          - pattern: $CURSOR.execute("..." % ...)
          - pattern: $CURSOR.execute("...".format(...))
    metadata:
      cwe: "CWE-89"
      owasp: "API8:2023 - Mauvaise configuration de sécurité & Injection"

  - id: django-vue-non-scopee-risque-bola
    languages: [python]
    message: "Détection d'une vue ou d'un ViewSet sans filtrage par request.user dans get_queryset(). Risque élevé de vulnérabilité BOLA/IDOR (CWE-639)."
    severity: WARNING
    patterns:
      - pattern: |
          def get_queryset(self):
              return $MODEL.objects.all()
    metadata:
      cwe: "CWE-639"
      owasp: "API1:2023 - Autorisation défaillante au niveau objet"
`;

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'report': return reportMarkdown;
      case 'security_md': return securityMdText;
      case 'pytest': return pytestSuiteText;
      case 'semgrep': return semgrepYaml;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getCurrentContent();
    let filename = 'Rapport-Audit-Securite-SecureFlow.md';
    if (activeTab === 'security_md') filename = 'SECURITY.md';
    if (activeTab === 'pytest') filename = 'test_api_security.py';
    if (activeTab === 'semgrep') filename = 'semgrep-rules.yml';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Bannière d'en-tête */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Livrables d'Audit & Conformité</span>
              <span aria-hidden="true">·</span>
              <span>Automatisation CI/CD</span>
              <span aria-hidden="true">·</span>
              <span>Conforme ISO 27001 / SOC 2</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              Rapport d'Audit Exécutif & Documentation AppSec
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exportez des livrables professionnels prêts à être intégrés à votre dépôt GitHub : rapport d'audit au format exécutif, 
              suite de tests de non-régression Pytest, règles d'analyse statique Semgrep et politique <code className="text-cyan-400">SECURITY.md</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-cyan-600/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le Fichier</span>
            </button>

            {activeTab === 'report' && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Imprimer ou Enregistrer en PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Imprimer / PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Onglets de sélection du livrable */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'report' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rapport d'Audit Exécutif (Markdown / PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab('security_md')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security_md' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SECURITY.md (Politique GitHub)</span>
          </button>

          <button
            onClick={() => setActiveTab('pytest')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pytest' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>test_api_security.py (Tests Automatisés Pytest)</span>
          </button>

          <button
            onClick={() => setActiveTab('semgrep')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'semgrep' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>semgrep-rules.yml (Règles SAST)</span>
          </button>
        </div>
      </div>

      {/* Visualiseur de Contenu */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-3 border-b border-slate-800 font-mono">
          <span>
            Document affiché : {activeTab === 'report' ? 'Rapport-Audit-Securite-SecureFlow.md' :
                               activeTab === 'security_md' ? 'SECURITY.md' :
                               activeTab === 'pytest' ? 'tests/test_api_security.py' : 'semgrep-rules.yml'}
          </span>
          <span>Encodage UTF-8</span>
        </div>

        <pre className="bg-[#0A0D14] border border-slate-800 p-5 rounded-lg text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-[640px] whitespace-pre-wrap select-text">
          {getCurrentContent()}
        </pre>
      </div>
    </div>
  );
};
