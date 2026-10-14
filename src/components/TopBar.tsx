import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Persona } from '../types/security';

interface TopBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activePersona: Persona;
  onChangePersona: (personaKey: 'user' | 'auditor' | 'admin') => void;
  isHardened: boolean;
  onToggleHardening: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  activePersona,
  onChangePersona,
  isHardened,
  onToggleHardening,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0E131F]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Zone 1 : Nom de marque en un seul élément de texte */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <button 
            onClick={() => onSelectTab('dashboard')} 
            className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap text-left cursor-pointer"
          >
            SecureFlow
          </button>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            sécurité-api
          </span>
        </div>

        {/* Zone 2 : Liens de navigation concis sur une seule ligne */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer ${
              currentTab === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1' : 'py-1'
            }`}
          >
            Tableau de Bord
          </button>
          <button
            onClick={() => onSelectTab('test-suite')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer ${
              currentTab === 'test-suite' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1' : 'py-1'
            }`}
          >
            Laboratoire OWASP
          </button>
          <button
            onClick={() => onSelectTab('hardening-diff')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer ${
              currentTab === 'hardening-diff' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1' : 'py-1'
            }`}
          >
            Durcissement du Code
          </button>
          <button
            onClick={() => onSelectTab('threat-model')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer ${
              currentTab === 'threat-model' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1' : 'py-1'
            }`}
          >
            Menaces & Architecture
          </button>
          <button
            onClick={() => onSelectTab('audit-report')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer ${
              currentTab === 'audit-report' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1' : 'py-1'
            }`}
          >
            Rapports d'Audit
          </button>
        </nav>

        {/* Zone 3 : Sélecteur de rôle & Interrupteur d'état de durcissement */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Bouton d'activation du mode sécurisé */}
          <button
            onClick={onToggleHardening}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isHardened
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-rose-950/40 border-rose-700/50 text-rose-300 hover:bg-rose-900/50'
            }`}
            title="Cliquer pour basculer entre le Mode Vulnérable et le Mode Sécurisé"
          >
            {isHardened ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mode Sécurisé (Corrigé)</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Mode Vulnérable (Lab d'Audit)</span>
              </>
            )}
          </button>

          {/* Menu déroulant de sélection du Persona */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-md p-1">
            <span className="text-xs text-slate-500 pl-1.5 hidden lg:inline">Rôle :</span>
            <select
              value={activePersona.role}
              onChange={(e) => onChangePersona(e.target.value as 'user' | 'auditor' | 'admin')}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-2"
            >
              <option value="user" className="bg-slate-900 text-slate-200">Alex (Utilisateur standard)</option>
              <option value="auditor" className="bg-slate-900 text-slate-200">Sarah (Auditeur de sécurité)</option>
              <option value="admin" className="bg-slate-900 text-slate-200">Roland (Administrateur)</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
