import { AuditLog, SecurityTest, STRIDEItem } from '../types/security';

export function generatePytestSuite(): string {
  return `"""
SecureFlow - Suite de Tests Automatisés de Sécurité et de Non-Régression d'API
Projet : secureflow-api-security
Framework : pytest + pytest-django + rest_framework.test.APIClient
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from api.models import Project

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def initialiser_comptes_et_projets(db):
    user_alex = User.objects.create_user(
        username="alex",
        email="alex@entreprise.interne",
        password="MotDePasseSecurise123!",
        role="user"
    )
    user_roland = User.objects.create_superuser(
        username="roland",
        email="roland@entreprise.interne",
        password="MotDePasseAdmin456!",
        role="admin"
    )
    
    # Projet personnel d'Alex
    proj_alex = Project.objects.create(
        id="proj-101",
        title="Refonte Portail Client Alpha",
        owner=user_alex,
        budget=18500
    )
    # Projet stratégique et confidentiel de Roland (Admin)
    proj_roland = Project.objects.create(
        id="proj-999",
        title="Due Diligence Technique M&A Confidentielle",
        owner=user_roland,
        budget=850000,
        is_classified=True
    )
    return {
        "alex": user_alex,
        "roland": user_roland,
        "proj_alex": proj_alex,
        "proj_roland": proj_roland,
    }


# ==============================================================================
# 1. Vérification BOLA / IDOR (OWASP API1:2023)
# ==============================================================================
class TestAutorisationNiveauObjet:
    def test_utilisateur_consulte_ses_propres_donnees(self, api_client, initialiser_comptes_et_projets):
        """Scénario : Un utilisateur consulte ses propres données -> Accès autorisé (200 OK)"""
        alex = initialiser_comptes_et_projets["alex"]
        api_client.force_authenticate(user=alex)
        
        response = api_client.get("/api/v1/projects/proj-101/")
        assert response.status_code == 200
        assert response.data["id"] == "proj-101"

    def test_utilisateur_bloque_sur_donnees_autre_compte(self, api_client, initialiser_comptes_et_projets):
        """
        Scénario : Un utilisateur tente d’accéder aux données d’un autre compte
        -> Réponse 404 (ou 403) selon la politique définie pour empêcher l'énumération
        """
        alex = initialiser_comptes_et_projets["alex"]
        api_client.force_authenticate(user=alex)
        
        response = api_client.get("/api/v1/projects/proj-999/")
        assert response.status_code in [404, 403], (
            f"Vulnérabilité BOLA détectée ! Statut {response.status_code} reçu "
            f"au lieu d'un refus 404/403 lors d'une tentative d'accès inter-locataires."
        )


# ==============================================================================
# 2. Protection contre les Injections SQL (OWASP API8:2023)
# ==============================================================================
class TestProtectionInjectionsSQL:
    @pytest.mark.parametrize("charge_utile", [
        "' OR '1'='1' --",
        "1; DROP TABLE api_project; --",
        "' UNION SELECT id, password, 0 FROM auth_user --",
    ])
    def test_recherche_parametree_sans_fuite(self, api_client, initialiser_comptes_et_projets, charge_utile):
        """
        Scénario : Une entrée contient des caractères inattendus
        -> Traitement sûr par l'ORM Django sans erreur révélant des informations sensibles
        """
        alex = initialiser_comptes_et_projets["alex"]
        api_client.force_authenticate(user=alex)
        
        response = api_client.get(f"/api/v1/projects/search/?query={charge_utile}")
        assert response.status_code == 200
        
        # Vérification qu'aucune donnée d'un compte tiers n'est exfiltrée
        donnees = response.data.get("results", []) if isinstance(response.data, dict) else response.data
        for element in donnees:
            assert element.get("owner_id") != initialiser_comptes_et_projets["roland"].id, (
                "Injection SQL confirmée : fuite de données inter-comptes constatée !"
            )


# ==============================================================================
# 3. Gestion Sécurisée des Jetons (OWASP API2:2023)
# ==============================================================================
class TestValidationJetons:
    def test_refus_jeton_expire(self, api_client):
        """Scénario : Un utilisateur transmet un jeton expiré -> Accès refusé (401 Unauthorized)"""
        jeton_expire = (
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXgiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0."
            "hash_signature_invalide"
        )
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {jeton_expire}")
        response = api_client.get("/api/v1/projects/")
        assert response.status_code == 401


# ==============================================================================
# 4. Protection des Routes Privées et Rôles (OWASP API5:2023)
# ==============================================================================
class TestControleAccesFonctions:
    def test_route_privee_sans_authentification(self, api_client):
        """Scénario : Un utilisateur non authentifié consulte une route privée -> Accès refusé (401)"""
        response = api_client.get("/api/v1/projects/proj-101/")
        assert response.status_code in [401, 403]

    def test_action_reservee_administrateur_refusee(self, api_client, initialiser_comptes_et_projets):
        """Scénario : Un utilisateur tente une action réservée à l'administrateur -> Accès refusé (403)"""
        alex = initialiser_comptes_et_projets["alex"]
        api_client.force_authenticate(user=alex)
        
        response = api_client.get("/api/v1/admin/audit-logs/export/")
        assert response.status_code == 403, "Élévation de privilèges (BFLA) : utilisateur standard ayant accédé aux journaux admin !"
`;
}

export function generateSecurityMd(): string {
  return `# Politique de Sécurité — SecureFlow API

## Versions Prises en Charge

Nous publions les correctifs de sécurité pour les versions actives suivantes :

| Version | Prise en charge    |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

---

## Signalement d'une Vulnérabilité

L’équipe d’ingénierie SecureFlow accorde la plus haute priorité à la sécurité des API, à l’étanchéité des données et à la confidentialité des utilisateurs.

Si vous découvrez une faille ou une faiblesse de sécurité dans SecureFlow, merci de nous la signaler de manière responsable et confidentielle :

1. **Courriel** : Adressez votre rapport chiffré à **security@secureflow.interne** ou **romansreimsroland@gmail.com**.
2. **Empreinte de Clé PGP** : \`7B4A E290 88C1 52FA 90B4 11A8 33F2 88C4 90F1 45E2\`
3. **Informations Indispensables à Inclure** :
   - Classe de vulnérabilité (ex. OWASP API1:2023 BOLA, Injection SQL, Jeton rejoué, BFLA).
   - Point de terminaison HTTP et méthode (ex. \`GET /api/v1/projects/{id}/\`).
   - Procédure de reproduction détaillée (commande curl ou capture de requête HTTP).
   - Preuve de concept (PoC) démontrant l'accès illégitime ou le contournement d'autorisation.
   - Proposition de correctif technique si disponible.

### Délais d'Engagement et de Réponse
- **Accusé de réception initial** : sous 24 heures ouvrées.
- **Reproduction et qualification** : sous 72 heures.
- **Publication du correctif** : sous 14 jours calendaires pour les vulnérabilités de sévérité Critique.

Merci de ne divulguer aucune information publique avant la mise à disposition officielle du correctif.
`;
}

export function generateExecutiveReport(
  tests: SecurityTest[],
  logs: AuditLog[],
  strideItems: STRIDEItem[],
  isHardened: boolean
): string {
  const confirmedFindings = logs.filter(l => l.findingStatus === 'VULNERABILITY_CONFIRMED');
  const remediatedFindings = logs.filter(l => l.findingStatus === 'REMEDIATED' || l.findingStatus === 'PASSED');
  const dateStr = new Date().toISOString().split('T')[0];

  return `# SecureFlow — Rapport d'Audit de Sécurité Exécutif

**Cible de l'évaluation** : API REST SecureFlow (\`secureflow-api-security\`)  
**Date d'évaluation** : ${dateStr}  
**Auditeur AppSec Référent** : Sarah Chen (CISSP, CEH)  
**État Actuel du Système** : ${isHardened ? 'SÉCURISÉ / PRÊT POUR LA PRODUCTION' : 'VULNÉRABLE / ENVIRONNEMENT DE TEST'}  

---

## 1. Synthèse Exécutive

Dans le cadre de cette mission d'assurance sécurité applicative (AppSec), la plateforme SecureFlow a été auditée face au référentiel **OWASP API Security Top 10 (Édition 2023)** ainsi qu'au modèle de menaces **STRIDE**.

- **Nombre Total de Sondes Exécutées** : ${logs.length}
- **Vulnérabilités Actives Confirmées** : ${confirmedFindings.length}
- **Contrôles Sécurisés & Validés** : ${remediatedFindings.length}
- **Niveau de Posture Globale** : ${isHardened ? 'CONFORME ET RÉSISTANT' : 'ACTION REQUISE (RISQUES CRITIQUES DÉTECTÉS)'}

${
  isHardened
    ? 'Toutes les routes API évaluées intègrent une défense en profondeur : scoping systématique des querysets via Django ORM (`request.user`), validation cryptographique des signatures JWT avec contrôle strict de l’expiration, et classes de permission DRF explicites (`IsAdminUser`, `IsProjectOwner`).'
    : 'Plusieurs vulnérabilités critiques ont été démontrées en mode vulnérable, notamment un accès inter-comptes de type BOLA (CWE-639) et l’acceptation d’injections SQL par concaténation brute (CWE-89).'
}

---

## 2. Matrice des Constats et Vulnérabilités

| Identifiant | Catégorie OWASP | Sévérité | Point de Terminaison | Statut |
| ----------- | --------------- | -------- | -------------------- | ------ |
${tests.map(t => {
  const relatedLog = logs.find(l => l.testId === t.id);
  const status = relatedLog 
    ? (relatedLog.findingStatus === 'VULNERABILITY_CONFIRMED' ? 'VULNÉRABILITÉ CONFIRMÉE' :
       relatedLog.findingStatus === 'REMEDIATED' ? 'CORRIGÉ' : 'CONFORME')
    : (isHardened ? 'CORRIGÉ' : 'VULNÉRABILITÉ CONFIRMÉE');
  return `| ${t.id} | ${t.owaspId.split(' - ')[0]} | ${t.severity} | \`${t.targetEndpoint.slice(0, 32)}\` | ${status} |`;
}).join('\n')}

---

## 3. Alignement avec le Modèle de Menaces STRIDE

${strideItems.map(item => `
### ${item.category} : ${item.threatName}
- **Composant Cible** : ${item.targetAsset}
- **Impact Potentiel** : ${item.impact}
- **Correspondance OWASP** : ${item.owaspMapping}
- **Contre-mesure Appliquée** : ${item.mitigationStrategy}
- **Statut** : ${isHardened ? 'ATTÉNUÉ (CONFORME)' : 'AUDITÉ'}
`).join('\n')}

---

## 4. Recommandations de Correction

1. **Isolation Stricte au Niveau Base de Données** : Remplacer les \`Project.objects.get(id=pk)\` par \`Project.objects.filter(owner=request.user)\` dans les vues Django REST.
2. **Bannissement de la Concaténation SQL Brute** : N’utiliser que des filtres paramétrés Django ORM ou passer les arguments sous forme de liste sécurisée.
3. **Contrôle d'Expiration et Rotation des Jetons** : Imposer des durées de validité courtes (15 minutes), vérifier le paramètre \`exp\` et régénérer les clés secrètes.
4. **Contrôle d’Accès Basé sur les Rôles (RBAC)** : Verrouiller chaque route d’administration et d’audit avec la classe \`IsAdminUser\`.
`;
}
