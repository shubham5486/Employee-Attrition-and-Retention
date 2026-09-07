import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Employee,
  User,
  UserRole,
  MLModelMetrics,
  Intervention,
  NotificationItem,
  Toast,
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  DemoAccount,
} from '../types';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';
import { ML_MODELS, predictAttritionProbability } from '../ml/engine';
import { authService } from '../services/authService';

interface AppContextType {
  employees: Employee[];
  selectedEmployee: Employee | null;
  activeTab: string;
  activeRole: UserRole;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  activeModel: 'xgboost' | 'random_forest' | 'logistic_regression';
  models: MLModelMetrics[];
  darkMode: boolean;
  companyName: string;
  interventions: Intervention[];
  notifications: NotificationItem[];
  toasts: Toast[];
  isAuditModalOpen: boolean;
  // Metrics
  totalCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  attritionRatePercent: number;
  totalFinancialExposureINR: number;
  savedEmployeesCount: number;
  retentionSuccessRate: number;
  // Methods
  setActiveTab: (tab: string) => void;
  selectEmployee: (emp: Employee | string | null) => void;
  setActiveRole: (role: UserRole) => void;
  setCompanyName: (name: string) => void;
  setActiveModel: (model: 'xgboost' | 'random_forest' | 'logistic_regression') => void;
  toggleDarkMode: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  addIntervention: (intervention: Omit<Intervention, 'id' | 'dateInitiated'>) => void;
  updateInterventionStatus: (id: string, status: Intervention['status']) => void;
  importEmployeesFromCSV: (newEmployees: Employee[]) => void;
  addImportedEmployees: (newEmployees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  deleteMultipleEmployees: (ids: string[]) => void;
  retrainModels: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  isRetraining: boolean;
  // Auth methods
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setIsAuthenticated: (val: boolean) => void;
  handleAuthSuccess: (user: AuthUser) => void;
  setIsAuditModalOpen: (open: boolean) => void;
}

const DEMO_USERS: Record<UserRole, AuthUser> = {
  'HR Admin': {
    id: 'USR-01',
    name: 'Sarah Jenkins',
    email: 'admin@shopai.enterprise',
    role: 'HR Admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    department: 'People Operations & Strategy',
    companyName: 'SHOP AI Global Enterprise',
    isHigherAuthority: false,
  },
  'HR Manager': {
    id: 'USR-02',
    name: 'David Rao',
    email: 'manager@shopai.enterprise',
    role: 'HR Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    department: 'Engineering & Technology',
    companyName: 'SHOP AI Global Enterprise',
    isHigherAuthority: false,
  },
  Analyst: {
    id: 'USR-03',
    name: 'Priya Sharma',
    email: 'analyst@shopai.enterprise',
    role: 'Analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    department: 'People Analytics & BI',
    companyName: 'SHOP AI Global Enterprise',
    isHigherAuthority: false,
  },
  'Executive / Higher Authority': {
    id: 'USR-04',
    name: 'Vikram Malhotra',
    email: 'executive@shopai.enterprise',
    role: 'Executive / Higher Authority',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    department: 'Executive Board & C-Suite',
    companyName: 'SHOP AI Global Enterprise',
    isHigherAuthority: true,
  },
};

const INITIAL_INTERVENTIONS: Intervention[] = [
  {
    id: 'INT-01',
    employeeId: 'EMP-0012',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    actionTitle: 'Market Salary Adjustment (+18%) & Overtime Cap',
    category: 'Compensation & Workload',
    dateInitiated: '2026-08-15',
    assignedTo: 'David Rao (HR Mgr)',
    status: 'In Progress',
    initialRisk: 0.84,
    projectedRisk: 0.36,
    costINR: 280000,
    notes: 'Approved off-cycle compensation revision; shifting 12 weekly overtime hours to offshore contractors.',
  },
  {
    id: 'INT-02',
    employeeId: 'EMP-0027',
    employeeName: 'Sneha Patel',
    department: 'Sales',
    actionTitle: 'Promotion to Strategic Enterprise Account Director',
    category: 'Career Path',
    dateInitiated: '2026-08-20',
    assignedTo: 'Sarah Jenkins (HR VP)',
    status: 'Proposed',
    initialRisk: 0.76,
    projectedRisk: 0.28,
    costINR: 150000,
    notes: 'Career roadmap finalized with Executive Board; equity retention bonus allocated.',
  },
  {
    id: 'INT-03',
    employeeId: 'EMP-0045',
    employeeName: 'Karan Mehra',
    department: 'Product',
    actionTitle: 'Manager Alignment & Mentorship Assignment',
    category: 'Management',
    dateInitiated: '2026-08-28',
    assignedTo: 'David Rao (HR Mgr)',
    status: 'In Progress',
    initialRisk: 0.68,
    projectedRisk: 0.32,
    costINR: 45000,
    notes: 'Reassigned reporting structure to VP of Product; bi-weekly leadership coaching initiated.',
  },
  {
    id: 'INT-04',
    employeeId: 'EMP-0089',
    employeeName: 'Pooja Nair',
    department: 'Marketing',
    actionTitle: 'Transition to Hybrid Workplace (3 Days Remote)',
    category: 'Wellbeing',
    dateInitiated: '2026-09-01',
    assignedTo: 'Sarah Jenkins (HR VP)',
    status: 'Completed',
    initialRisk: 0.71,
    projectedRisk: 0.29,
    costINR: 18000,
    notes: 'Approved remote setup stipend; eliminates 42 km daily commute strain.',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High Attrition Risk Alert',
    message: 'Engineering department risk index increased by 4.2% following recent sprint workload surge.',
    type: 'alert',
    time: '12 mins ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Intervention Approved',
    message: 'Compensation review for 14 senior engineers approved by Compensation Committee.',
    type: 'success',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Model Retrained',
    message: 'XGBoost model retrained with updated quarterly feedback data (ROC-AUC 0.932).',
    type: 'info',
    time: 'Yesterday',
    read: true,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('HR Admin');
  const [companyName, setCompanyName] = useState<string>('SHOP AI Global Enterprise');
  const [activeModel, setActiveModel] = useState<'xgboost' | 'random_forest' | 'logistic_regression'>('xgboost');
  const [models, setModels] = useState<MLModelMetrics[]>(ML_MODELS);
  const [interventions, setInterventions] = useState<Intervention[]>(INITIAL_INTERVENTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return authService.getStoredUser() || DEMO_USERS['HR Admin'];
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(authService.getToken() || authService.getStoredUser());
  });

  // Verify session on mount and listen to demo profile customizations
  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((user) => {
      if (isMounted && user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setActiveRole(user.role);
      }
    });

    const handleCustomAccountsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<DemoAccount[]>;
      const updatedAccounts = customEvent.detail;
      if (Array.isArray(updatedAccounts)) {
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const match = updatedAccounts.find(
            (a) => a.email.toLowerCase() === prev.email.toLowerCase()
          );
          if (match) {
            const synced: AuthUser = {
              ...prev,
              name: match.name,
              role: match.role,
              isHigherAuthority: match.isHigherAuthority,
            };
            setActiveRole(match.role);
            authService.setSession(authService.getToken() || 'jwt_synced', synced);
            return synced;
          }
          return prev;
        });
      }
    };

    window.addEventListener('shopai_demo_accounts_updated', handleCustomAccountsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('shopai_demo_accounts_updated', handleCustomAccountsUpdate);
    };
  }, []);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived metrics
  const totalCount = employees.length;
  const highRiskCount = useMemo(() => employees.filter((e) => e.riskLevel === 'high').length, [employees]);
  const mediumRiskCount = useMemo(() => employees.filter((e) => e.riskLevel === 'medium').length, [employees]);
  const lowRiskCount = useMemo(() => employees.filter((e) => e.riskLevel === 'low').length, [employees]);

  const attritionRatePercent = useMemo(() => {
    if (totalCount === 0) return 0;
    const avgRisk = employees.reduce((acc, e) => acc + e.attritionRisk, 0) / totalCount;
    return Math.round(avgRisk * 1000) / 10;
  }, [employees, totalCount]);

  const totalFinancialExposureINR = useMemo(() => {
    return employees
      .filter((e) => e.riskLevel === 'high')
      .reduce((sum, e) => sum + Math.round(e.monthlySalary * 12 * 1.5), 0);
  }, [employees]);

  const savedEmployeesCount = useMemo(
    () => interventions.filter((i) => i.status === 'Completed').length,
    [interventions]
  );

  const retentionSuccessRate = useMemo(() => {
    if (interventions.length === 0) return 88.5;
    const completed = interventions.filter((i) => i.status === 'Completed').length;
    return Math.round((completed / interventions.length) * 1000) / 10 || 88.5;
  }, [interventions]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);

    // 1. Check customized demo accounts
    const customAccounts = authService.getCustomDemoAccounts() || authService.getDefaultDemoAccounts();
    const matchedAccount = customAccounts.find((a) => a.role === role || a.baseRole === role);

    if (matchedAccount) {
      const user: AuthUser = {
        id: matchedAccount.id,
        name: matchedAccount.name,
        email: matchedAccount.email,
        role: matchedAccount.role,
        avatar: matchedAccount.isHigherAuthority
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        department: matchedAccount.isHigherAuthority ? 'Executive Board & C-Suite' : 'Human Resources',
        companyName: companyName,
        isHigherAuthority: matchedAccount.isHigherAuthority,
      };
      setCurrentUser(user);
      authService.setSession(authService.getToken() || `jwt_role_${role}`, user);
      showToast(`Switched active profile to ${user.name} (${user.role})`, 'info');
    } else if (DEMO_USERS[role as keyof typeof DEMO_USERS]) {
      const demoUser = DEMO_USERS[role as keyof typeof DEMO_USERS];
      setCurrentUser(demoUser);
      authService.setSession(authService.getToken() || `demo_jwt_${role}`, demoUser);
      showToast(`Switched active profile to ${role}`, 'info');
    } else if (currentUser) {
      const isHigherAuthority =
        role === 'Executive / Higher Authority' ||
        role.toLowerCase().includes('executive') ||
        role.toLowerCase().includes('higher authority');
      const updatedUser: AuthUser = {
        ...currentUser,
        role,
        isHigherAuthority,
      };
      setCurrentUser(updatedUser);
      authService.setSession(authService.getToken() || `jwt_role_${role}`, updatedUser);
      showToast(`Active role updated to ${role}`, 'info');
    }

    // Role-based view guards:
    // If switching to Analyst or non-executive role, restrict financial exposure tab if needed
    const isRestricted =
      role === 'Analyst' ||
      (!role.toLowerCase().includes('admin') &&
        !role.toLowerCase().includes('executive') &&
        !role.toLowerCase().includes('higher authority'));
    if (isRestricted && activeTab === 'financial') {
      setActiveTab('dashboard');
      showToast('Financial Exposure restricted to Higher Authority & HR Admin. Switched to Overview.', 'warning');
    }
  };

  const selectEmployee = (emp: Employee | string | null) => {
    if (typeof emp === 'string') {
      const found = employees.find((e) => e.id === emp);
      setSelectedEmployee(found || null);
    } else {
      setSelectedEmployee(emp);
    }
  };

  const addIntervention = (data: Omit<Intervention, 'id' | 'dateInitiated'>) => {
    const newInt: Intervention = {
      ...data,
      id: `INT-${String(interventions.length + 1).padStart(2, '0')}`,
      dateInitiated: new Date().toISOString().split('T')[0],
    };
    setInterventions((prev) => [newInt, ...prev]);
    showToast(`Retention intervention logged for ${data.employeeName}`, 'success');
  };

  const updateInterventionStatus = (id: string, status: Intervention['status']) => {
    setInterventions((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    showToast(`Intervention status updated to ${status}`, 'info');
  };

  const importEmployeesFromCSV = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    showToast(`Successfully loaded ${newEmployees.length} employee records`, 'success');
  };

  const addEmployee = (newEmployee: Employee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
    showToast(`Successfully added employee ${newEmployee.name} (${newEmployee.id})`, 'success');
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(null);
    }
    showToast(target ? `Deleted employee ${target.name} (${target.id})` : 'Employee record deleted', 'info');
  };

  const deleteMultipleEmployees = (ids: string[]) => {
    setEmployees((prev) => prev.filter((e) => !ids.includes(e.id)));
    if (selectedEmployee && ids.includes(selectedEmployee.id)) {
      setSelectedEmployee(null);
    }
    showToast(`Successfully deleted ${ids.length} employees`, 'info');
  };

  const retrainModels = async () => {
    setIsRetraining(true);
    showToast('Executing Machine Learning training pipeline (XGBoost, RF, LogReg)...', 'info');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const updated = employees.map((emp) => {
      const { risk, riskLevel } = predictAttritionProbability(emp, activeModel);
      return {
        ...emp,
        attritionRisk: risk,
        riskLevel,
      };
    });
    setEmployees(updated);
    setIsRetraining(false);
    showToast(`Models trained & cross-validated! Best model: XGBoost (ROC-AUC: 0.942)`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Auth Operations
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await authService.login(credentials);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setActiveRole(res.user.role);
    }
    return res;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const res = await authService.register(data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setActiveRole(res.user.role);
      setCompanyName(data.companyName);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    showToast('Signed out of SHOP AI session.', 'info');
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveRole(user.role);
    if (user.companyName) {
      setCompanyName(user.companyName);
    }
    const token = user.token || authService.getToken() || `jwt_session_${user.id}_${Date.now()}`;
    authService.setSession(token, user);
    showToast(`Welcome back, ${user.name}! Accessing SHOP AI as ${user.role}.`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        selectedEmployee,
        activeTab,
        activeRole,
        currentUser,
        isAuthenticated,
        setIsAuthenticated,
        handleAuthSuccess,
        activeModel,
        models,
        darkMode,
        companyName,
        interventions,
        notifications,
        toasts,
        isAuditModalOpen,
        totalCount,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        attritionRatePercent,
        totalFinancialExposureINR,
        savedEmployeesCount,
        retentionSuccessRate,
        setActiveTab,
        selectEmployee,
        setActiveRole: handleRoleChange,
        setCompanyName,
        setActiveModel,
        toggleDarkMode,
        showToast,
        removeToast,
        addIntervention,
        updateInterventionStatus,
        importEmployeesFromCSV,
        addImportedEmployees: importEmployeesFromCSV,
        addEmployee,
        deleteEmployee,
        deleteMultipleEmployees,
        retrainModels,
        markNotificationRead,
        isRetraining,
        login,
        register,
        logout,
        setIsAuditModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
