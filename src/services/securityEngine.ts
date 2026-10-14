import { AuditLog, FindingStatus, Persona, SecurityTest } from '../types/security';
import { INITIAL_PROJECTS } from '../data/securityTests';

export interface ExecuteProbeParams {
  test: SecurityTest;
  persona: Persona;
  isHardened: boolean;
  customPayload?: any;
  customEndpoint?: string;
}

export function executeSecurityProbe(params: ExecuteProbeParams): AuditLog {
  const { test, persona, isHardened, customPayload } = params;
  const endpoint = params.customEndpoint || test.targetEndpoint;
  const startTime = performance.now();

  const requestHeaders: Record<string, string> = {
    'Host': 'api.secureflow.interne',
    'User-Agent': 'SecureFlow-Sonde-AppSec/2.4 (Moteur d’Audit Automatisé)',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${persona.token.slice(0, 28)}...`,
    'X-Request-ID': `req-${Math.random().toString(36).substring(2, 9)}`,
  };

  const responseHeaders: Record<string, string> = {
    'Server': 'gunicorn/21.2.0 (Django 5.1/DRF 3.15)',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': isHardened ? 'nosniff' : 'none',
    'X-Frame-Options': isHardened ? 'DENY' : 'SAMEORIGIN',
    'Strict-Transport-Security': isHardened ? 'max-age=31536000; includeSubDomains' : 'none',
    'Date': new Date().toUTCString(),
  };

  let responseStatus = 200;
  let responseBody: any = null;
  let findingStatus: FindingStatus = 'NOT_RUN';
  let findingDetail = '';

  switch (test.category) {
    case 'bola': {
      // Test BOLA : Alex tente d'accéder au projet proj-999 de Roland
      const targetId = endpoint.includes('proj-999') ? 'proj-999' : 'proj-101';
      const targetProject = INITIAL_PROJECTS.find(p => p.id === targetId) || INITIAL_PROJECTS[2];

      if (!isHardened) {
        // Mode Vulnérable : Accès direct sans vérifier le propriétaire
        responseStatus = 200;
        responseHeaders['X-Tenancy-Scope'] = 'GLOBAL_NON_FILTRE';
        responseBody = {
          statut: 'succes',
          donnees: {
            id: targetProject.id,
            titre: targetProject.title,
            proprietaire_id: targetProject.ownerId,
            proprietaire_nom: targetProject.ownerName,
            client: targetProject.client,
            budget: targetProject.budget,
            confidentiel: targetProject.isClassified,
            notes: targetProject.notes,
            mis_a_jour_le: targetProject.updatedAt,
          },
          alerte_securite: 'VULNÉRABILITÉ DÉTECTÉE : Données renvoyées sans vérification d’appartenance du compte',
        };

        if (persona.role !== 'admin' && targetProject.ownerId !== persona.id) {
          findingStatus = 'VULNERABILITY_CONFIRMED';
          findingDetail = `FAILLE CRITIQUE BOLA CONFIRMÉE : L’utilisateur ${persona.name} (${persona.id}) a pu lire le projet confidentiel '${targetProject.title}' appartenant à ${targetProject.ownerName}. Absence de filtrage de propriété dans la vue Django.`;
        } else {
          findingStatus = 'BLOCKED';
          findingDetail = `Accès autorisé légitime : L’utilisateur ${persona.name} est propriétaire de ce projet ou administrateur.`;
        }
      } else {
        // Mode Sécurisé : Requête restreinte avec get_queryset
        if (persona.role === 'admin' || targetProject.ownerId === persona.id) {
          responseStatus = 200;
          responseBody = {
            statut: 'succes',
            donnees: targetProject,
          };
          findingStatus = 'PASSED';
          findingDetail = `Accès autorisé et conforme : Requête autorisée sous la politique de propriété d’objet.`;
        } else {
          // BOLA neutralisé : 404 Not Found (recommandation OWASP anti-énumération)
          responseStatus = 404;
          responseBody = {
            detail: 'Non trouvé ou ressource inexistante.',
            code: 'ressource_introuvable',
            statut_http: 404,
          };
          findingStatus = 'REMEDIATED';
          findingDetail = `PROTECTION BOLA ACTIVE : La requête Django ORM restreinte a renvoyé 404 Not Found pour une ressource non possédée. Isolation des locataires garantie.`;
        }
      }
      break;
    }

    case 'sqli': {
      // Test Injection SQL
      const payload = customPayload || test.defaultPayload;
      const queryString = typeof payload === 'object' ? payload.query || '' : String(payload);
      const isSqlInjectionPayload = queryString.includes("'") || queryString.toLowerCase().includes('or 1=1') || queryString.includes('--');

      if (!isHardened) {
        if (isSqlInjectionPayload) {
          responseStatus = 200;
          responseHeaders['X-ORM-Mode'] = 'SQL_BRUT_CONCATENE_SANS_PARAMETRAGE';
          responseBody = {
            requete_executee: `SELECT id, title, budget, client FROM api_project WHERE title ILIKE '%${queryString}%'`,
            total_trouve: INITIAL_PROJECTS.length,
            resultats: INITIAL_PROJECTS.map(p => ({
              id: p.id,
              titre: p.title,
              budget: p.budget,
              client: p.client,
              confidentiel: p.isClassified,
            })),
            alerte_base: 'AVERTISSEMENT : L’exécution brute par curseur a contourné les sécurités de l’ORM Django.',
          };
          findingStatus = 'VULNERABILITY_CONFIRMED';
          findingDetail = `FAILLE CRITIQUE INJECTION SQL : Le payload a altéré la condition SQL WHERE. Les ${INITIAL_PROJECTS.length} projets de la base ont été exfiltrés, y compris les données M&A confidentielles.`;
        } else {
          responseStatus = 200;
          responseBody = {
            total_trouve: 1,
            resultats: [INITIAL_PROJECTS[0]],
          };
          findingStatus = 'BLOCKED';
          findingDetail = 'Requête standard exécutée sans charge malveillante.';
        }
      } else {
        // Mode Sécurisé : Paramétrisation Django ORM avec filtre locataire
        responseStatus = 200;
        responseHeaders['X-ORM-Mode'] = 'REQUETE_PREPAREE_PARAMETREE_DJANGO';
        
        const userProjects = persona.role === 'admin' 
          ? INITIAL_PROJECTS 
          : INITIAL_PROJECTS.filter(p => p.ownerId === persona.id);

        const safeResults = userProjects.filter(p => 
          p.title.toLowerCase().includes(queryString.toLowerCase().replace(/['"%-]/g, ''))
        );

        responseBody = {
          total_trouve: safeResults.length,
          resultats: safeResults.map(p => ({
            id: p.id,
            titre: p.title,
            client: p.client,
          })),
          notice_securite: 'Requête paramétrée Django ORM : les métacaractères SQL sont traités comme de simples chaînes littérales.',
        };
        findingStatus = 'REMEDIATED';
        findingDetail = `INJECTION SQL NEUTRALISÉE : Entrée paramétrée avec succès via Django ORM (title__icontains). Les caractères d’injection ont été neutralisés sans fuite de base.`;
      }
      break;
    }

    case 'auth': {
      // Test Jeton expiré ou falsifié
      if (!isHardened) {
        responseStatus = 200;
        responseHeaders['X-JWT-Validation'] = 'VERIFICATION_SIGNATURE_DESACTIVEE';
        responseBody = {
          session_valide: true,
          utilisateur_authentifie: {
            id: 'usr-101',
            email: 'alex.rivera@entreprise.interne',
            role: 'user',
          },
          alerte_securite: 'Authentification acceptée malgré un jeton expiré ou non signé car verify_exp=False.',
        };
        findingStatus = 'VULNERABILITY_CONFIRMED';
        findingDetail = `FAILLE D’AUTHENTIFICATION CONFIRMÉE : Le serveur a accepté un jeton JWT expiré/falsifié. Décodage sans validation de signature ni d’expiration, permettant le rejeu de sessions.`;
      } else {
        responseStatus = 401;
        responseHeaders['WWW-Authenticate'] = 'Bearer error="jeton_invalide", error_description="Signature de jeton invalide ou expiree."';
        responseBody = {
          detail: 'Jeton fourni non valide pour le type de session requis',
          code: 'jeton_invalide',
          erreurs: [
            {
              classe_jeton: 'AccessToken',
              type: 'access',
              message: 'Le jeton a expiré ou la signature cryptographique est incorrecte.',
            },
          ],
        };
        findingStatus = 'REMEDIATED';
        findingDetail = `CONTRÔLE DE JETON RÉUSSI : Erreur 401 Unauthorized renvoyée. La validation cryptographique stricte a immédiatement rejeté le jeton corrompu.`;
      }
      break;
    }

    case 'bfla': {
      // Test Escalade de privilèges sur route admin
      if (!isHardened) {
        responseStatus = 200;
        responseBody = {
          export_id: 'export-sys-20261014-998',
          total_enregistrements: 1420,
          metriques_systeme: {
            hote_base_de_donnees: 'db-interne-postgres.cloud.interne',
            fournisseur_auth: 'django_simplejwt_hs256',
            comptes_admin: 2,
            sessions_actives: 48,
          },
          extraits_journaux: [
            { evenement: 'CONNEXION_UTILISATEUR', utilisateur: 'roland.vance@entreprise.interne', ip: '10.0.4.12', date: '2026-10-14T14:10:00Z' },
            { evenement: 'ROTATION_CLE_SECRETE', utilisateur: 'systeme', ip: '127.0.0.1', date: '2026-10-14T00:00:00Z' },
          ],
        };

        if (persona.role === 'user') {
          findingStatus = 'VULNERABILITY_CONFIRMED';
          findingDetail = `FAILLE BFLA CONFIRMÉE : L’utilisateur standard ${persona.name} a pu accéder à l’export des journaux d’audit administrateur. Classe de permission IsAdminUser absente.`;
        } else {
          findingStatus = 'BLOCKED';
          findingDetail = `Accès autorisé : Le rôle ${persona.role} dispose des droits d’audit ou d’administration.`;
        }
      } else {
        if (persona.role === 'admin' || persona.role === 'auditor') {
          responseStatus = 200;
          responseBody = {
            export_id: 'export-sys-20261014-998',
            acteur_autorise: persona.email,
            statut: 'succes',
          };
          findingStatus = 'PASSED';
          findingDetail = `RBAC VÉRIFIÉ : Opération autorisée pour le profil '${persona.role}'.`;
        } else {
          responseStatus = 403;
          responseBody = {
            detail: 'Vous n’avez pas la permission d’effectuer cette action. Rôle Administrateur ou Auditeur requis.',
            code: 'permission_refusee',
            role_requis: 'admin',
          };
          findingStatus = 'REMEDIATED';
          findingDetail = `RBAC RESPECTÉ : Erreur 403 Forbidden retournée à l’utilisateur standard ${persona.name}. Accès aux fonctions privilégiées strictement verrouillé.`;
        }
      }
      break;
    }

    case 'mass_assignment': {
      // Test Assignation de masse
      const payload = customPayload || test.defaultPayload;
      
      if (!isHardened) {
        responseStatus = 200;
        responseBody = {
          id: persona.id,
          nom: payload.name || persona.name,
          email: persona.email,
          role: payload.role || 'admin',
          is_superuser: payload.is_superuser !== undefined ? payload.is_superuser : true,
          statut: 'profil_mis_a_jour',
          alerte_critique: 'CRITIQUE : Le sérialiseur avec fields="__all__" a accepté les champs role et is_superuser !',
        };
        findingStatus = 'VULNERABILITY_CONFIRMED';
        findingDetail = `FAILLE D’ASSIGNATION DE MASSE : Le sérialiseur a validé et persisté les champs non autorisés ('role: admin', 'is_superuser: true'), accordant une élévation de privilège illégitime.`;
      } else {
        responseStatus = 200;
        responseBody = {
          id: persona.id,
          nom: payload.name || persona.name,
          email: persona.email,
          role: persona.role, // Non modifié !
          is_superuser: false,
          statut: 'profil_mis_a_jour',
          champs_ignores: ['role', 'is_superuser'],
          notice_securite: 'La directive read_only_fields de Django REST a empêché la modification des attributs de privilège.',
        };
        findingStatus = 'REMEDIATED';
        findingDetail = `ASSIGNATION DE MASSE NEUTRALISÉE : Les champs 'role' et 'is_superuser' ont été ignorés. Le compte reste avec son rôle d’origine '${persona.role}'.`;
      }
      break;
    }
  }

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime + Math.random() * 18 + 8);

  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    testId: test.id,
    testName: test.name,
    owaspId: test.owaspId,
    severity: test.severity,
    role: persona.role,
    isHardened,
    endpoint,
    method: test.httpMethod,
    requestHeaders,
    requestBody: customPayload || test.defaultPayload,
    responseStatus,
    responseHeaders,
    responseBody,
    latencyMs,
    findingStatus,
    findingDetail,
  };
}
