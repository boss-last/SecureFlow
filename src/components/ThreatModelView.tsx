import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Server, 
  Database, 
  Key, 
  Lock, 
  Layers, 
  Network, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { STRIDEItem } from '../types/security';

interface ThreatModelViewProps {
  strideItems: STRIDEItem[];
  isHardened: boolean;
}

export const ThreatModelView: React.FC<ThreatModelViewProps> = ({
  strideItems,
  isHardened,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* En-tête de Présentation */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Modélisation des Menaces</span>
            <span aria-hidden="true">·</span>
            <span>Méthodologie STRIDE</span>
            <span aria-hidden="true">·</span>
            <span>Surface d'Attaque API REST</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
            Diagramme d'Architecture & Modèle de Menaces STRIDE
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
            Cartographie complète des vecteurs d'attaque, des frontières de confiance et des mécanismes de défense applicative. 
            Évalue les risques d'usurpation d'identité, d'altération de requêtes, de divulgation de données sensibles et d'élévation de privilèges.
          </p>
        </div>
      </div>

      {/* Diagramme d'Architecture des Frontières de Confiance */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              Architecture Multi-Locataires & Frontières de Confiance SecureFlow
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolement réseau, filtres cryptographiques d'authentification et requêtes ORM cloisonnées
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Frontières de Confiance : 3 Définies
          </span>
        </div>

        {/* Schéma d'Architecture Hybride */}
        <div className="bg-[#0A0D14] border border-slate-800 rounded-xl p-6 overflow-x-auto">
          <div className="min-w-[760px] grid grid-cols-4 gap-4 relative">
            
            {/* Zone 0 : Clients & Sondes */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                  <span>ZONE 0 : NON SÉCURISÉE</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-2">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Clients & Sondes de Test</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Navigateur web, application mobile ou sonde d’audit automatisée.
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
                Protocole : HTTPS / TLS 1.3<br />
                En-tête : Bearer JWT
              </div>
            </div>

            {/* Zone 1 : Passerelle & Auth */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3 relative">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                  <span>ZONE 1 : DMZ</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-2">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Passerelle API & Auth</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Valide la signature HMAC, vérifie la date d’expiration du jeton et limite les débits.
                </p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400/90 bg-slate-950 p-2 rounded border border-slate-800">
                Règle : Exp & Sig vérifiés<br />
                Rejet : 401 Unauthorized
              </div>
            </div>

            {/* Zone 2 : Backend Django REST */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                  <span>ZONE 2 : BACKEND</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-2">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Moteur Django REST</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Applique les permissions de rôles (<code className="text-cyan-400">IsAdminUser</code>) et scope les querysets.
                </p>
              </div>
              <div className="text-[10px] font-mono text-cyan-400 bg-slate-950 p-2 rounded border border-slate-800">
                Scoping : filter(owner=user)<br />
                Anti-BOLA/BFLA : 404/403
              </div>
            </div>

            {/* Zone 3 : PostgreSQL */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                  <span>ZONE 3 : DONNÉES</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-2">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Base PostgreSQL</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Requêtes préparées et paramétrées, données cloisonnées par schéma.
                </p>
              </div>
              <div className="text-[10px] font-mono text-purple-400 bg-slate-950 p-2 rounded border border-slate-800">
                Aucune concaténation SQL<br />
                Audit : Table append-only
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tableau de la Matrice STRIDE */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Matrice d'Évaluation des Menaces STRIDE</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Catégorisation des menaces, analyse d'impact et contre-mesures techniques appliquées
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>6/6 Menaces Documentées</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-3">Catégorie STRIDE</th>
                <th className="py-3 px-3">Scénario de Menace</th>
                <th className="py-3 px-3">Composant Cible</th>
                <th className="py-3 px-3">Correspondance OWASP</th>
                <th className="py-3 px-3">Contre-Mesure Appliquée</th>
                <th className="py-3 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {strideItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-cyan-400 whitespace-nowrap">
                    {item.category === 'Spoofing' ? 'Usurpation (Spoofing)' :
                     item.category === 'Tampering' ? 'Altération (Tampering)' :
                     item.category === 'Repudiation' ? 'Répudiation' :
                     item.category === 'Information Disclosure' ? 'Divulgation d’Info' :
                     item.category === 'Denial of Service' ? 'Déni de Service (DoS)' :
                     'Élévation de Privilège'}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">
                    {item.threatName}
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.impact}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {item.targetAsset}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {item.owaspMapping.split(' - ')[0]}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {item.mitigationStrategy}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Atténué (Conforme)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
