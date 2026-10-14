import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Code2, 
  ShieldAlert, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';
import { SecurityTest } from '../types/security';

interface HardeningDiffViewProps {
  tests: SecurityTest[];
  selectedTestId: string;
  onSelectTest: (testId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const HardeningDiffView: React.FC<HardeningDiffViewProps> = ({
  tests,
  selectedTestId,
  onSelectTest,
  onNavigateToTab,
}) => {
  const currentTest = tests.find(t => t.id === selectedTestId) || tests[0];
  const [copiedVulnerable, setCopiedVulnerable] = useState(false);
  const [copiedHardened, setCopiedHardened] = useState(false);

  const handleCopy = (text: string, type: 'vulnerable' | 'hardened') => {
    navigator.clipboard.writeText(text);
    if (type === 'vulnerable') {
      setCopiedVulnerable(true);
      setTimeout(() => setCopiedVulnerable(false), 2000);
    } else {
      setCopiedHardened(true);
      setTimeout(() => setCopiedHardened(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête & Présentation */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Référence d'Ingénierie AppSec</span>
            <span aria-hidden="true">·</span>
            <span>Django REST Framework</span>
            <span aria-hidden="true">·</span>
            <span>Durcissement PostgreSQL & ORM</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
            Différences de Code Source : Avant vs Après Sécurisation
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
            Analysez le code Python / Django exact permettant de corriger chaque vulnérabilité de l'OWASP Top 10 API. 
            Comparez les requêtes ORM globales non filtrées aux querysets scopés par utilisateur, la concaténation SQL brute 
            aux requêtes paramétrées, et les sérialiseurs permissifs aux sérialiseurs avec champs en lecture seule stricts.
          </p>
        </div>

        {/* Sélecteur de scénario */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
          {tests.map(test => {
            const isSelected = test.id === currentTest.id;
            return (
              <button
                key={test.id}
                onClick={() => onSelectTest(test.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="font-mono text-[11px] opacity-75">{test.owaspId.split(' - ')[0]}</span>
                <span>{test.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Affichage Comparatif Côte à Côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gauche : Implémentation Vulnérable (Avant) */}
        <div className="bg-[#111726] border border-rose-900/40 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-rose-950/30 border-b border-rose-900/40 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-300">
                AVANT : Implémentation Vulnérable (Exploitable)
              </span>
            </div>
            <button
              onClick={() => handleCopy(currentTest.vulnerableDjangoCode, 'vulnerable')}
              className="text-xs text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer bg-rose-950/60 px-2 py-1 rounded border border-rose-800/50"
            >
              {copiedVulnerable ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedVulnerable ? 'Copié !' : 'Copier le Code'}</span>
            </button>
          </div>

          <div className="p-4 flex-1 bg-[#0A0D14]">
            <pre className="text-xs font-mono text-rose-200/90 leading-relaxed overflow-x-auto">
              {currentTest.vulnerableDjangoCode}
            </pre>
          </div>

          <div className="bg-slate-900/90 border-t border-slate-800 p-4 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-rose-400 block">Analyse de la Cause Première :</span>
            <p className="text-slate-400 leading-relaxed">
              {currentTest.exploitScenario}
            </p>
          </div>
        </div>

        {/* Droite : Implémentation Sécurisée (Après) */}
        <div className="bg-[#111726] border border-emerald-900/40 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-emerald-950/30 border-b border-emerald-900/40 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                APRÈS : Implémentation Sécurisée (Production)
              </span>
            </div>
            <button
              onClick={() => handleCopy(currentTest.hardenedDjangoCode, 'hardened')}
              className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/50"
            >
              {copiedHardened ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHardened ? 'Copié !' : 'Copier le Code'}</span>
            </button>
          </div>

          <div className="p-4 flex-1 bg-[#0A0D14]">
            <pre className="text-xs font-mono text-emerald-200/90 leading-relaxed overflow-x-auto">
              {currentTest.hardenedDjangoCode}
            </pre>
          </div>

          <div className="bg-slate-900/90 border-t border-slate-800 p-4 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-emerald-400 block">Mécanisme de Remédiation :</span>
            <p className="text-slate-400 leading-relaxed">
              {currentTest.remediationAdvice}
            </p>
          </div>
        </div>

      </div>

      {/* Guide des Bonnes Pratiques AppSec */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Bonnes Pratiques AppSec & Liste de Contrôle de Défense en Profondeur
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-2">
            <span className="font-semibold text-cyan-300 block">1. Isolation au Niveau Base de Données</span>
            <p className="text-slate-400 leading-relaxed">
              Ne jamais faire confiance aux paramètres d'URL du client. Les querysets dans les vues Django doivent toujours être restreints avec <code className="text-cyan-400">owner=request.user</code>.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-2">
            <span className="font-semibold text-cyan-300 block">2. Paramétrisation Automatique ORM</span>
            <p className="text-slate-400 leading-relaxed">
              Proscrire formellement la concaténation de chaînes dans les requêtes SQL. Utiliser les filtres paramétrés (<code className="text-cyan-400">title__icontains</code>) ou les tuples de paramètres préparés.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-2">
            <span className="font-semibold text-cyan-300 block">3. Liste Blanche Stricte des Sérialiseurs</span>
            <p className="text-slate-400 leading-relaxed">
              Bannir <code className="text-rose-400">fields = '__all__'</code> dans les sérialiseurs en écriture. Isoler expressément les attributs de privilège (<code className="text-cyan-400">is_superuser</code>, <code className="text-cyan-400">role</code>) dans <code className="text-cyan-400">read_only_fields</code>.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Vous souhaitez tester ces comportements en direct sur l'API ?
          </span>
          <button
            onClick={() => onNavigateToTab('test-suite')}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            <span>Passer au Laboratoire de Test</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
