import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  BarChart3, 
  Radar as RadarIcon,
  Info,
  CheckCircle2
} from 'lucide-react';

interface SecurityEvolutionChartProps {
  isHardened: boolean;
  onToggleHardening: () => void;
}

export const SECURITY_EVOLUTION_DATA = [
  {
    id: 'bola',
    vecteur: 'BOLA (API1)',
    nomComplet: 'BOLA : Accès Inter-Comptes',
    avantDurcissement: 88,
    apresDurcissement: 8,
    reduction: '91%',
    protection: 'Scoping ORM get_queryset()',
  },
  {
    id: 'sqli',
    vecteur: 'SQLi (API8)',
    nomComplet: 'Injection SQL / Recherche',
    avantDurcissement: 93,
    apresDurcissement: 5,
    reduction: '95%',
    protection: 'Requêtes paramétrées Django',
  },
  {
    id: 'auth',
    vecteur: 'Auth JWT (API2)',
    nomComplet: 'Jetons Expirés & HMAC',
    avantDurcissement: 81,
    apresDurcissement: 10,
    reduction: '88%',
    protection: 'Contrôle signature & TTL exp',
  },
  {
    id: 'bfla',
    vecteur: 'BFLA (API5)',
    nomComplet: 'Escalade Privilèges Admin',
    avantDurcissement: 79,
    apresDurcissement: 12,
    reduction: '85%',
    protection: 'Permissions IsAdminUser',
  },
  {
    id: 'mass',
    vecteur: 'BOPLA (API3)',
    nomComplet: 'Assignation de Masse',
    avantDurcissement: 65,
    apresDurcissement: 6,
    reduction: '91%',
    protection: 'read_only_fields stricts',
  },
];

// Tooltip personnalisé avec design sombre élégant
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const itemData = SECURITY_EVOLUTION_DATA.find(d => d.vecteur === label || d.nomComplet === label);
    return (
      <div className="bg-[#0B0F17] border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <div className="font-bold text-slate-100 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{itemData?.nomComplet || label}</span>
        </div>
        <div className="flex items-center justify-between text-rose-400">
          <span>Score Risque Avant :</span>
          <span className="font-mono font-bold">{payload[0]?.value} / 100</span>
        </div>
        <div className="flex items-center justify-between text-emerald-400">
          <span>Score Risque Après :</span>
          <span className="font-mono font-bold">{payload[1]?.value} / 100</span>
        </div>
        {itemData && (
          <div className="mt-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold">Atténuation : </span>
            {itemData.protection} ({itemData.reduction} de risque éliminé)
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const SecurityEvolutionChart: React.FC<SecurityEvolutionChartProps> = ({
  isHardened,
  onToggleHardening,
}) => {
  const [chartType, setChartType] = useState<'barres' | 'radar'>('barres');

  // Calcul des scores globaux
  const scoreInitialMoyen = Math.round(
    SECURITY_EVOLUTION_DATA.reduce((acc, curr) => acc + curr.avantDurcissement, 0) / SECURITY_EVOLUTION_DATA.length
  );
  const scoreSecuriseMoyen = Math.round(
    SECURITY_EVOLUTION_DATA.reduce((acc, curr) => acc + curr.apresDurcissement, 0) / SECURITY_EVOLUTION_DATA.length
  );
  const reductionPourcentage = Math.round(
    ((scoreInitialMoyen - scoreSecuriseMoyen) / scoreInitialMoyen) * 100
  );

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 space-y-6">
      {/* En-tête du module graphique */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Visualisation Recharts</span>
            <span aria-hidden="true">·</span>
            <span>Évaluation Comparative CVSS / Risque OWASP</span>
          </div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            Évolution du Score de Vulnérabilité : Avant vs Après Durcissement
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mesure comparative de la surface d'attaque sur 100 points avant l'application des correctifs Django et après durcissement
          </p>
        </div>

        {/* Boutons de bascule de visualisation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setChartType('barres')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                chartType === 'barres'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barres Groupées</span>
            </button>
            <button
              onClick={() => setChartType('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                chartType === 'radar'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span>Surface Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Résumé synthétique de l'impact du durcissement */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Score Vulnérabilité Initial</span>
            <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
              {scoreInitialMoyen} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </span>
            <span className="text-[10px] text-rose-400/80 block mt-0.5">Risque Critique & Élevé</span>
          </div>
          <ShieldAlert className="w-6 h-6 text-rose-500/60 shrink-0" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Score Vulnérabilité Après Correctif</span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {scoreSecuriseMoyen} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Risque Résiduel Minime</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-500/60 shrink-0" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Réduction Globale du Risque</span>
            <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
              -{reductionPourcentage}%
            </span>
            <span className="text-[10px] text-cyan-400/80 block mt-0.5">5 vecteurs OWASP neutralisés</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 font-bold text-xs">
            ✓
          </div>
        </div>
      </div>

      {/* Rendu du Graphique Recharts */}
      <div className="bg-[#0A0D14] border border-slate-800/90 rounded-xl p-4 pt-6">
        {chartType === 'barres' ? (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SECURITY_EVOLUTION_DATA}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="vecteur" 
                  stroke="#94A3B8" 
                  fontSize={11}
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  dx={-5}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '11px' }}
                />
                <Bar 
                  name="Score Vulnérabilité Avant Durcissement (Lab)" 
                  dataKey="avantDurcissement" 
                  fill="#F43F5E" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={38}
                />
                <Bar 
                  name="Score Vulnérabilité Après Durcissement (Sécurisé)" 
                  dataKey="apresDurcissement" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="75%" 
                data={SECURITY_EVOLUTION_DATA}
              >
                <PolarGrid stroke="#1F2937" />
                <PolarAngleAxis dataKey="vecteur" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar
                  name="Avant Durcissement (Lab)"
                  dataKey="avantDurcissement"
                  stroke="#F43F5E"
                  fill="#F43F5E"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Après Durcissement (Sécurisé)"
                  dataKey="apresDurcissement"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.5}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Légende contextuelle & bouton d'action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              État courant du banc d'essai :{' '}
              <strong className={isHardened ? 'text-emerald-400' : 'text-rose-400'}>
                {isHardened ? 'Mode Sécurisé (Scoping ORM et permissions actives)' : 'Mode Vulnérable (Failles actives)'}
              </strong>
            </span>
          </div>

          <button
            onClick={onToggleHardening}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isHardened
                ? 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/50'
                : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/50'
            }`}
          >
            {isHardened ? 'Tester en Mode Vulnérable' : 'Appliquer le Durcissement (Sécuriser)'}
          </button>
        </div>
      </div>
    </div>
  );
};
