export type RiskLevel = 'high' | 'medium' | 'low';

export type StandardUserRole = 'HR Admin' | 'HR Manager' | 'Analyst' | 'Executive / Higher Authority';
export type UserRole = StandardUserRole | (string & {});

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  companyName?: string;
  isHigherAuthority?: boolean;
}

export interface AuthUser extends User {
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  companyName: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'ELEVATED_ACCESS' | 'INTERVENTION_COMMITTED' | 'REPORT_EXPORT';
  details: string;
  ipAddress: string;
}

export interface DemoAccount {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  passwordHint: string;
  description: string;
  badge: string;
  isHigherAuthority?: boolean;
  baseRole?: StandardUserRole;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  role: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  yearsAtCompany: number;
  yearsInCurrentRole: number;
  yearsSincePromotion: number;
  monthlySalary: number; // in INR (₹)
  satisfactionScore: number; // 1 to 5
  environmentSatisfaction: number; // 1 to 5
  workLifeBalance: number; // 1 to 5
  overtimeHoursWeekly: number;
  hasOvertime: boolean;
  performanceRating: number; // 1 to 5
  distanceFromHomeKm: number;
  trainingTimesLastYear: number;
  managerRelationshipScore: number; // 1 to 5
  remoteWorkOption: 'Full-time' | 'Hybrid' | 'On-site';
  education: string;
  attritionRisk: number; // 0.0 to 1.0 (e.g. 0.84 = 84%)
  riskLevel: RiskLevel;
  primaryRiskFactor: string;
  historicalAttrition?: boolean;
}

export interface SHAPContribution {
  factor: string;
  featureKey: string;
  value: string | number;
  impact: number; // positive = increases attrition risk, negative = reduces risk
  category: 'Compensation' | 'Workload' | 'Career Growth' | 'Environment' | 'Tenure';
  description: string;
}

export interface RetentionRecommendation {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  expectedImpactPercent: number; // e.g., 25% reduction in risk
  estimatedCostINR: number;
  estimatedBenefitINR: number;
  roiMultiplier: number;
  category: 'Compensation' | 'Workload' | 'Career Path' | 'Wellbeing' | 'Managerial';
  applied?: boolean;
}

export interface Intervention {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  actionTitle: string;
  category: string;
  dateInitiated: string;
  assignedTo: string;
  status: 'Proposed' | 'In Progress' | 'Approved' | 'Completed';
  initialRisk: number;
  projectedRisk: number;
  costINR: number;
  notes: string;
}

export interface WhatIfInput {
  salaryIncreasePercent: number;
  reduceOvertimeHours: number;
  isPromoted: boolean;
  trainingEnrolled: boolean;
  improveManagerRelationship: boolean;
  boostSatisfactionScore: number;
  remoteOption: 'Full-time' | 'Hybrid' | 'On-site';
}

export interface WhatIfResult {
  originalRisk: number;
  simulatedRisk: number;
  riskDifference: number;
  originalRiskLevel: RiskLevel;
  simulatedRiskLevel: RiskLevel;
  retentionProbability: number;
  annualReplacementCostINR: number;
  interventionCostINR: number;
  netEstimatedSavingsINR: number;
  roiPercent: number;
}

export interface MLModelMetrics {
  name: string;
  type: 'logistic_regression' | 'random_forest' | 'xgboost';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  trainingTimeMs: number;
  isBest: boolean;
}

export interface GlobalFeatureImportance {
  feature: string;
  importance: number; // 0 to 1
  impactDirection: 'Increases Attrition' | 'Decreases Attrition';
  category: string;
}

export interface DepartmentMetric {
  department: string;
  headcount: number;
  attritionRate: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  avgSalaryINR: number;
  avgTenureYears: number;
  avgSatisfaction: number;
  avgOvertimeHours: number;
  totalFinancialExposureINR: number;
  topRiskFactors: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  time: string;
  read: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
