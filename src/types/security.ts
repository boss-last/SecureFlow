export type UserRole = 'admin' | 'auditor' | 'user';

export interface Persona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarInitials: string;
  description: string;
  token: string;
  permissions: string[];
}

export type OWASPCategory = 
  | 'API1:2023 - Broken Object Level Authorization (BOLA)'
  | 'API2:2023 - Broken Authentication'
  | 'API3:2023 - Broken Object Property Level Authorization'
  | 'API5:2023 - Broken Function Level Authorization (BFLA)'
  | 'API8:2023 - Security Misconfiguration & Injection';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SecurityTest {
  id: string;
  name: string;
  owaspId: OWASPCategory;
  category: 'bola' | 'sqli' | 'auth' | 'bfla' | 'mass_assignment';
  severity: SeverityLevel;
  targetEndpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  exploitScenario: string;
  defaultPayload: Record<string, any> | string;
  vulnerableExpectedStatus: number;
  hardenedExpectedStatus: number;
  vulnerableDjangoCode: string;
  hardenedDjangoCode: string;
  remediationAdvice: string;
  cvssScore: number;
  cwe: string;
}

export type FindingStatus = 
  | 'VULNERABILITY_CONFIRMED'
  | 'REMEDIATED'
  | 'PASSED'
  | 'BLOCKED'
  | 'FALSE_POSITIVE'
  | 'NOT_RUN';

export interface AuditLog {
  id: string;
  timestamp: string;
  testId: string;
  testName: string;
  owaspId: OWASPCategory;
  severity: SeverityLevel;
  role: UserRole;
  isHardened: boolean;
  endpoint: string;
  method: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: any;
  latencyMs: number;
  findingStatus: FindingStatus;
  findingDetail: string;
}

export interface STRIDEItem {
  id: string;
  category: 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege';
  threatName: string;
  targetAsset: string;
  impact: string;
  owaspMapping: string;
  mitigationStrategy: string;
  isMitigated: boolean;
}

export interface ProjectData {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  client: string;
  budget: number;
  isClassified: boolean;
  notes: string;
  updatedAt: string;
}
