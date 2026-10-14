import { Persona, SecurityTest, STRIDEItem, ProjectData } from '../types/security';

export const PERSONAS: Record<string, Persona> = {
  user: {
    id: 'usr-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@entreprise.interne',
    role: 'user',
    title: 'Développeur Standard',
    avatarInitials: 'AR',
    description: 'Compte utilisateur standard disposant uniquement des permissions nécessaires pour gérer ses propres projets.',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyLTEwMSIsImVtYWlsIjoiYWxleC5yaXZlcmFAZW50cmVwcmlzZS5pbnRlcm5lIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3Mjg4MDAwMDAsImV4cCI6MTc2MDM1MjAwMH0.s1G_mock_valid_alex_token',
    permissions: ['lecture:propres_projets', 'ecriture:propres_projets', 'lecture:propre_profil', 'maj:propre_profil'],
  },
  auditor: {
    id: 'usr-202',
    name: 'Sarah Chen',
    email: 'sarah.chen@appsec.audit',
    role: 'auditor',
    title: 'Auditeur de Sécurité AppSec',
    avatarInitials: 'SC',
    description: 'Rôle d’audit habilité à inspecter les scans de vulnérabilités, les métriques d’intrusion et les rapports de conformité.',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyLTIwMiIsImVtYWlsIjoic2FyYWguY2hlbkBhcHBzZWMuYXVkaXQiLCJyb2xlIjoiYXVkaXRvciIsImlhdCI6MTcyODgwMDAwMCwiZXhwIjoxNzYwMzUyMDAwfQ.s1G_mock_valid_sarah_auditor',
    permissions: ['lecture:propres_projets', 'lecture:rapports_securite', 'execution:scans_api', 'lecture:modele_menaces', 'export:donnees_audit'],
  },
  admin: {
    id: 'usr-999',
    name: 'Roland Vance',
    email: 'roland.vance@entreprise.interne',
    role: 'admin',
    title: 'Administrateur Système',
    avatarInitials: 'RV',
    description: 'Super-administrateur avec privilèges complets, visibilité globale des données et accès aux journaux d’audit.',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyLTk5OSIsImVtYWlsIjoicm9sYW5kLnZhbmNlQGVudHJlcHJpc2UuaW50ZXJuZSIsInJvbGUiOiJhZG1pbiIsImlzX3N1cGVydXNlciI6dHJ1ZSwiaWF0IjoxNzI4ODAwMDAwLCJleHAiOjE3NjAzNTIwMDB9.s1G_mock_valid_roland_admin',
    permissions: ['*'],
  },
};

export const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: 'proj-101',
    title: 'Refonte Portail Client Alpha',
    ownerId: 'usr-101',
    ownerName: 'Alex Rivera',
    client: 'Starlight Commerce SARL',
    budget: 18500,
    isClassified: false,
    notes: 'Mission client standard. Modernisation du tunnel de commande et du panier.',
    updatedAt: '2026-10-12T10:14:00Z',
  },
  {
    id: 'proj-102',
    title: 'Microservice Passerelle API Interne',
    ownerId: 'usr-101',
    ownerName: 'Alex Rivera',
    client: 'Pôle Technique Interne',
    budget: 9200,
    isClassified: false,
    notes: 'Expérimentation de routage inverse Node.js / Vite pour l’outillage interne.',
    updatedAt: '2026-10-13T14:32:00Z',
  },
  {
    id: 'proj-999',
    title: 'Due Diligence Technique M&A Confidentielle',
    ownerId: 'usr-999',
    ownerName: 'Roland Vance (Admin)',
    client: 'Comité Exécutif de Direction',
    budget: 850000,
    isClassified: true,
    notes: 'STRICTEMENT CONFIDENTIEL : Valorisation financière, audit de code source sous NDA et identifiants de la cible d’acquisition.',
    updatedAt: '2026-10-14T09:00:00Z',
  },
];

export const SECURITY_TESTS: SecurityTest[] = [
  {
    id: 'test-bola-01',
    name: 'BOLA / IDOR : Accès Non Autorisé Inter-Comptes',
    owaspId: 'API1:2023 - Broken Object Level Authorization (BOLA)',
    category: 'bola',
    severity: 'CRITICAL',
    targetEndpoint: '/api/v1/projects/proj-999/',
    httpMethod: 'GET',
    description: 'Vérifie si un utilisateur standard authentifié peut consulter ou modifier le projet confidentiel d’un autre utilisateur en modifiant simplement l’identifiant dans l’URL.',
    exploitScenario: 'L’utilisateur Alex (usr-101) envoie une requête authentifiée à `/api/v1/projects/proj-999/`. Côté backend vulnérable, l’ORM fait un `Project.objects.get(id=pk)` direct sans filtrer par `owner=request.user`, exposant le projet stratégique M&A et son budget de 850 000 €.',
    defaultPayload: {},
    vulnerableExpectedStatus: 200,
    hardenedExpectedStatus: 404,
    cvssScore: 8.8,
    cwe: 'CWE-639 : Contournement d’autorisation par clé contrôlée par l’utilisateur',
    remediationAdvice: 'Restreindre systématiquement les requêtes ORM avec `request.user` dans `get_queryset()` de Django REST Framework ou créer une classe de permission `IsProjectOwner`. Renvoyer 404 Not Found (ou 403) pour empêcher l’énumération des identifiants.',
    vulnerableDjangoCode: `# ❌ VULNÉRABLE : Recherche directe sans validation de propriété
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        # Faille : Aucune vérification que request.user est propriétaire du projet !
        project = Project.objects.get(id=project_id)
        return Response(ProjectSerializer(project).data)`,
    hardenedDjangoCode: `# ✅ SÉCURISÉ : Requête restreinte via get_queryset & permission DRF
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated

class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or request.user.is_staff

class ProjectDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsProjectOwner]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        # Isolation étanche des données au niveau de la requête SQL
        if self.request.user.is_staff:
            return Project.objects.all()
        return Project.objects.filter(owner=self.request.user)`,
  },
  {
    id: 'test-sqli-02',
    name: 'Injection SQL via Paramètre de Recherche',
    owaspId: 'API8:2023 - Security Misconfiguration & Injection',
    category: 'sqli',
    severity: 'CRITICAL',
    targetEndpoint: "/api/v1/projects/search/?query=' OR '1'='1' --",
    httpMethod: 'GET',
    description: 'Vérifie si les entrées utilisateur de recherche sont correctement paramétrées par l’ORM ou si une concaténation brute de chaîne permet de manipuler la requête SQL.',
    exploitScenario: "Un attaquant soumet `' OR '1'='1' --` dans le champ de recherche. Un code vulnérable concatène directement la chaîne dans la requête SQL brute, retournant l’ensemble des projets de tous les clients et révélant la structure de la base.",
    defaultPayload: { query: "' OR '1'='1' --" },
    vulnerableExpectedStatus: 200,
    hardenedExpectedStatus: 200,
    cvssScore: 9.3,
    cwe: 'CWE-89 : Neutralisation incorrecte des éléments spéciaux dans une commande SQL',
    remediationAdvice: 'Utiliser exclusivement les filtres paramétrés de l’ORM Django comme `title__icontains=query` ou passer les paramètres dans une liste `cursor.execute(sql, [params])`. Bannir formellement les f-strings dans les requêtes SQL.',
    vulnerableDjangoCode: `# ❌ VULNÉRABLE : Concaténation de chaîne dans requête SQL brute
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response

class ProjectSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('query', '')
        # Faille : Concaténation directe permettant l'injection SQL !
        sql = f"SELECT id, title, budget FROM api_project WHERE title ILIKE '%{query}%'"
        with connection.cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
        return Response({'results': rows})`,
    hardenedDjangoCode: `# ✅ SÉCURISÉ : Requête paramétrée Django ORM avec filtre utilisateur
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ProjectSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query', '').strip()
        # Sécurisé : Django ORM paramètre automatiquement les valeurs (protection SQLi)
        projects = Project.objects.filter(
            owner=request.user,
            title__icontains=query
        )[:50]
        return Response(ProjectSerializer(projects, many=True).data)`,
  },
  {
    id: 'test-auth-03',
    name: 'Validation de Jeton Expiré ou Falsifié',
    owaspId: 'API2:2023 - Broken Authentication',
    category: 'auth',
    severity: 'HIGH',
    targetEndpoint: '/api/v1/auth/verify-session/',
    httpMethod: 'POST',
    description: 'Valide que le mécanisme d’authentification rejette rigoureusement les jetons JWT expirés, les signatures non vérifiées et les jetons rejoués.',
    exploitScenario: 'Un client transmet un jeton JWT expiré (émis en 2020) ou dont la signature a été altérée. Si le middleware décode le jeton avec `verify_exp=False` ou sans vérifier la signature HMAC, la session est acceptée à tort.',
    defaultPayload: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyLTEwMSIsImV4cCI6MTU3Nzg0NjQwMH0.invalid_signature_replayed_token',
      tamperType: 'expire_et_non_signe'
    },
    vulnerableExpectedStatus: 200,
    hardenedExpectedStatus: 401,
    cvssScore: 8.1,
    cwe: 'CWE-287 : Authentification incorrecte',
    remediationAdvice: 'Configurer `rest_framework_simplejwt` avec signature HMAC-SHA256, clé secrète forte, vérification obligatoire de l’expiration (`verify_exp: True`) et durée de vie courte (15 minutes).',
    vulnerableDjangoCode: `# ❌ VULNÉRABLE : Désactivation de la vérification d'expiration
import jwt
from rest_framework.authentication import BaseAuthentication

class WeakJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '')
        # Faille : verify_exp=False accepte les jetons expirés indéfiniment !
        payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
        user = User.objects.get(id=payload['user_id'])
        return (user, None)`,
    hardenedDjangoCode: `# ✅ SÉCURISÉ : Vérification cryptographique stricte de signature et TTL
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Configuration Django settings.py :
# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
#     'SIGNING_KEY': settings.SECRET_KEY,
#     'ALGORITHM': 'HS256',
#     'AUTH_HEADER_TYPES': ('Bearer',),
# }

class StrictJWTAuthentication(JWTAuthentication):
    def get_validated_token(self, raw_token):
        # Valide automatiquement la signature HMAC, l'expiration et le type de jeton
        return super().get_validated_token(raw_token)`,
  },
  {
    id: 'test-bfla-04',
    name: 'Escalade de Privilèges sur Route Admin (BFLA)',
    owaspId: 'API5:2023 - Broken Function Level Authorization (BFLA)',
    category: 'bfla',
    severity: 'HIGH',
    targetEndpoint: '/api/v1/admin/audit-logs/export/',
    httpMethod: 'GET',
    description: 'Vérifie si un utilisateur standard non administrateur peut appeler des routes de diagnostic privilégiées ou exporter les journaux de sécurité.',
    exploitScenario: 'L’utilisateur Alex (rôle `user`) tente d’appeler la route administrative `/api/v1/admin/audit-logs/export/`. La vue vérifie uniquement `IsAuthenticated` sans exiger le rôle administrateur (`IsAdminUser`), exposant tous les journaux système.',
    defaultPayload: {},
    vulnerableExpectedStatus: 200,
    hardenedExpectedStatus: 403,
    cvssScore: 7.9,
    cwe: 'CWE-285 : Autorisation incorrecte',
    remediationAdvice: 'Appliquer systématiquement des classes de contrôle d’accès basé sur les rôles (RBAC) telles que `permissions.IsAdminUser` ou une permission personnalisée `IsSecurityAuditor`.',
    vulnerableDjangoCode: `# ❌ VULNÉRABLE : Vérification de rôle manquante sur route sensible
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class AdminAuditLogExportView(APIView):
    # Faille : N'importe quel utilisateur connecté passe le contrôle !
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = SecurityAuditLog.objects.all().order_by('-created_at')
        return Response(AuditLogSerializer(logs, many=True).data)`,
    hardenedDjangoCode: `# ✅ SÉCURISÉ : Contrôle d'accès strict basé sur les rôles (RBAC)
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, BasePermission

class IsSecurityAuditorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['admin', 'auditor'] or request.user.is_staff
        )

class AdminAuditLogExportView(APIView):
    permission_classes = [IsSecurityAuditorOrAdmin]

    def get(self, request):
        logs = SecurityAuditLog.objects.all().order_by('-created_at')
        return Response(AuditLogSerializer(logs, many=True).data)`,
  },
  {
    id: 'test-mass-05',
    name: 'Assignation de Masse & Altération de Rôle (BOPLA)',
    owaspId: 'API3:2023 - Broken Object Property Level Authorization',
    category: 'mass_assignment',
    severity: 'MEDIUM',
    targetEndpoint: '/api/v1/users/profile/',
    httpMethod: 'PATCH',
    description: 'Teste si des clients peuvent injecter des champs sensibles non autorisés (tels que `role: "admin"` ou `is_superuser: true`) dans le corps de requête de mise à jour.',
    exploitScenario: 'Alex envoie `{"role": "admin", "is_superuser": true, "name": "Alex R."}` sur son profil. Le sérialiseur accepte tous les champs en écriture, accordant les privilèges administrateur à Alex sans contrôle.',
    defaultPayload: {
      name: 'Alex Rivera',
      role: 'admin',
      is_superuser: true,
    },
    vulnerableExpectedStatus: 200,
    hardenedExpectedStatus: 200,
    cvssScore: 6.5,
    cwe: 'CWE-915 : Modification non contrôlée des attributs d’un objet',
    remediationAdvice: 'Déclarer `read_only_fields = (\'role\', \'is_superuser\', \'is_staff\')` ou lister explicitement les champs modifiables dans les sérialiseurs Django REST.',
    vulnerableDjangoCode: `# ❌ VULNÉRABLE : Le sérialiseur autorise la modification de tous les champs
from rest_framework import serializers

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Faille : '__all__' permet au client de réécrire 'role' et 'is_superuser' !
        fields = '__all__'`,
    hardenedDjangoCode: `# ✅ SÉCURISÉ : Déclaration explicite des read_only_fields
from rest_framework import serializers

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'bio', 'role', 'is_superuser']
        # Protégé : les attributs sensibles ne peuvent pas être modifiés par le client
        read_only_fields = ['id', 'email', 'role', 'is_superuser']`,
  },
];

export const STRIDE_THREAT_MODEL: STRIDEItem[] = [
  {
    id: 'stride-1',
    category: 'Spoofing',
    threatName: 'Usurpation d’Identité & Falsification de Signature JWT',
    targetAsset: 'Middleware d’Authentification API Gateway',
    impact: 'Un attaquant peut forger de fausses identités ou contourner l’expiration des sessions.',
    owaspMapping: 'API2:2023 Authentification Défaillante',
    mitigationStrategy: 'Validation cryptographique de signature HMAC-SHA256, rotation des clés et contrôle strict du champ exp.',
    isMitigated: true,
  },
  {
    id: 'stride-2',
    category: 'Tampering',
    threatName: 'Assignation de Masse & Falsification des Rôles',
    targetAsset: 'Sérialiseur REST du Profil Utilisateur',
    impact: 'Les utilisateurs standards peuvent s’attribuer le rôle administrateur ou altérer les données d’autres comptes.',
    owaspMapping: 'API3:2023 Autorisation Défaillante au Niveau Propriété',
    mitigationStrategy: 'Définition des champs sensibles en read_only_fields dans les sérialiseurs Django REST.',
    isMitigated: true,
  },
  {
    id: 'stride-3',
    category: 'Repudiation',
    threatName: 'Absence de Traçabilité des Actions Administratives',
    targetAsset: 'Base de Données des Journaux d’Audit & Télémétrie',
    impact: 'Impossibilité d’imputer des modifications malveillantes à un utilisateur ou à une session spécifique.',
    owaspMapping: 'API8:2023 Mauvaise Configuration de Sécurité',
    mitigationStrategy: 'Journalisation immuable et structurée (append-only) avec identifiants de corrélation de requêtes.',
    isMitigated: true,
  },
  {
    id: 'stride-4',
    category: 'Information Disclosure',
    threatName: 'Fuite Inter-Comptes via BOLA / IDOR',
    targetAsset: 'Vues ORM de Gestion des Projets',
    impact: 'Fuite des données confidentielles, des budgets et des notes stratégiques d’autres clients.',
    owaspMapping: 'API1:2023 Autorisation Défaillante au Niveau Objet',
    mitigationStrategy: 'Filtrage strict via request.user dans get_queryset() et retour de codes 404 pour les objets non possédés.',
    isMitigated: true,
  },
  {
    id: 'stride-5',
    category: 'Denial of Service',
    threatName: 'Consommation Excessive de Ressources par Requêtes Brutes',
    targetAsset: 'Points de Terminaison de Recherche et Filtrage',
    impact: 'Saturation des connexions de base de données PostgreSQL par des requêtes sauvages non paramétrées.',
    owaspMapping: 'API4:2023 Consommation Non Restreinte de Ressources',
    mitigationStrategy: 'Limitation de débit (AnonRateThrottle / UserRateThrottle) et pagination obligatoire des résultats.',
    isMitigated: true,
  },
  {
    id: 'stride-6',
    category: 'Elevation of Privilege',
    threatName: 'Accès Non Autorisé aux Fonctions Administratives (BFLA)',
    targetAsset: 'Points d’Export d’Audit et Télémétrie Système',
    impact: 'Les utilisateurs standards exécutent des opérations réservées aux administrateurs système.',
    owaspMapping: 'API5:2023 Autorisation Défaillante au Niveau Fonction',
    mitigationStrategy: 'Application rigoureuse des classes de permissions DRF IsAdminUser et IsSecurityAuditor.',
    isMitigated: true,
  },
];
