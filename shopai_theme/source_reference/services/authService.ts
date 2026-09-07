import { AuthUser, LoginCredentials, RegisterData, AuthResponse, DemoAccount, AuditLogEntry, UserRole } from '../types';

const TOKEN_KEY = 'shopai_auth_jwt_token';
const USER_KEY = 'shopai_auth_user_data';
const CUSTOM_ACCOUNTS_KEY = 'shopai_custom_demo_accounts';

export const DEFAULT_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin',
    role: 'HR Admin',
    name: 'Sarah Jenkins',
    email: 'admin@shopai.enterprise',
    passwordHint: 'ShopAI@2026',
    description: 'Full People Operations authorization, intervention approval, and staff directory management.',
    badge: 'Admin Access',
    isHigherAuthority: false,
    baseRole: 'HR Admin',
  },
  {
    id: 'demo-manager',
    role: 'HR Manager',
    name: 'David Rao',
    email: 'manager@shopai.enterprise',
    passwordHint: 'ShopAI@2026',
    description: 'Department-level retention simulation, cohort health diagnostics, and team coaching.',
    badge: 'Manager Access',
    isHigherAuthority: false,
    baseRole: 'HR Manager',
  },
  {
    id: 'demo-analyst',
    role: 'Analyst',
    name: 'Priya Sharma',
    email: 'analyst@shopai.enterprise',
    passwordHint: 'ShopAI@2026',
    description: 'Workforce telemetry, predictive modeling diagnostics, and anonymized/masked salary inspection.',
    badge: 'Analyst Access',
    isHigherAuthority: false,
    baseRole: 'Analyst',
  },
  {
    id: 'demo-executive',
    role: 'Executive / Higher Authority',
    name: 'Vikram Malhotra',
    email: 'executive@shopai.enterprise',
    passwordHint: 'ShopAI@2026',
    description: 'Elevated C-Suite clearance: organization-wide financial exposure, board dossiers, and strategy controls.',
    badge: 'Higher Authority',
    isHigherAuthority: true,
    baseRole: 'Executive / Higher Authority',
  },
];

export const authService = {
  // Get default accounts
  getDefaultDemoAccounts(): DemoAccount[] {
    return JSON.parse(JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
  },

  // Get custom accounts from storage
  getCustomDemoAccounts(): DemoAccount[] | null {
    const raw = localStorage.getItem(CUSTOM_ACCOUNTS_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  },

  // Save customized accounts
  saveDemoAccounts(accounts: DemoAccount[]): void {
    localStorage.setItem(CUSTOM_ACCOUNTS_KEY, JSON.stringify(accounts));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shopai_demo_accounts_updated', { detail: accounts }));
    }
    fetch('/api/auth/demo-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accounts }),
    }).catch(() => {});
  },

  // Reset demo accounts back to default
  resetDemoAccounts(): DemoAccount[] {
    localStorage.removeItem(CUSTOM_ACCOUNTS_KEY);
    const defaults = this.getDefaultDemoAccounts();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shopai_demo_accounts_updated', { detail: defaults }));
    }
    return defaults;
  },

  // Store token and user
  setSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Clear session
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get current token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get current cached user
  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Fetch demo accounts from storage or backend API
  async getDemoAccounts(): Promise<DemoAccount[]> {
    // 1. Check user customizations first
    const custom = this.getCustomDemoAccounts();
    if (custom && custom.length > 0) {
      return custom;
    }

    try {
      const res = await fetch('/api/auth/demo-accounts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.accounts) && data.accounts.length > 0) {
          return data.accounts;
        }
      }
    } catch (err) {
      console.warn('[SHOP AI] Falling back to standard demo accounts', err);
    }

    // Default accounts matching backend
    return this.getDefaultDemoAccounts();
  },

  // Login via API with fallback
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const customAccounts = this.getCustomDemoAccounts() || this.getDefaultDemoAccounts();
    const matchedCustom = customAccounts.find(
      (a) => a.email.toLowerCase() === credentials.email.toLowerCase().trim()
    );

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        // If user has customized this account's display name or role title, apply it
        const finalUser: AuthUser = {
          ...data.user,
          name: matchedCustom ? matchedCustom.name : data.user.name,
          role: matchedCustom ? matchedCustom.role : data.user.role,
        };
        this.setSession(data.token, finalUser);
        return {
          ...data,
          user: finalUser,
          message: `Welcome back, ${finalUser.name}! Access authorized as ${finalUser.role}.`,
        };
      }

      return {
        success: false,
        message: data.message || 'Invalid credentials. Please verify your email and password.',
      };
    } catch (err: any) {
      // Local graceful fallback if backend is momentarily restarting or offline
      const email = credentials.email.toLowerCase().trim();
      const accounts = await this.getDemoAccounts();
      const matched = accounts.find((a) => a.email.toLowerCase() === email);

      if (matched) {
        const dummyToken = `jwt_mock_${matched.role}_${Date.now()}`;
        const user: AuthUser = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          avatar:
            matched.role === 'Executive / Higher Authority'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          department: matched.isHigherAuthority ? 'Executive Board' : 'Human Resources',
          companyName: 'SHOP AI Global Enterprise',
          isHigherAuthority: matched.isHigherAuthority,
          token: dummyToken,
        };
        this.setSession(dummyToken, user);
        return { success: true, token: dummyToken, user, message: `Welcome back, ${user.name}!` };
      }

      // If arbitrary email provided
      const fallbackRole: UserRole = email.includes('exec')
        ? 'Executive / Higher Authority'
        : email.includes('analyst')
        ? 'Analyst'
        : email.includes('manager')
        ? 'HR Manager'
        : 'HR Admin';
      const dummyToken = `jwt_mock_user_${Date.now()}`;
      const user: AuthUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: email.split('@')[0].replace('.', ' ').replace(/^./, (s) => s.toUpperCase()) || 'Corporate User',
        email: credentials.email,
        role: fallbackRole,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        department: fallbackRole === 'Executive / Higher Authority' ? 'Executive Board' : 'Human Resources',
        companyName: 'SHOP AI Global Enterprise',
        isHigherAuthority: fallbackRole === 'Executive / Higher Authority',
        token: dummyToken,
      };
      this.setSession(dummyToken, user);
      return { success: true, token: dummyToken, user, message: `Welcome, ${user.name}!` };
    }
  },

  // Register via API
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      if (res.ok && responseData.success && responseData.token && responseData.user) {
        this.setSession(responseData.token, responseData.user);
        return responseData;
      }

      return {
        success: false,
        message: responseData.message || 'Account registration failed.',
      };
    } catch (err: any) {
      // Fallback registration
      const dummyToken = `jwt_mock_new_${Date.now()}`;
      const user: AuthUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: data.role === 'Executive / Higher Authority' ? 'Executive Board' : 'Human Resources',
        companyName: data.companyName || 'Enterprise Organization',
        isHigherAuthority: data.role === 'Executive / Higher Authority',
        token: dummyToken,
      };
      this.setSession(dummyToken, user);
      return { success: true, token: dummyToken, user, message: `Account created for ${user.name}!` };
    }
  },

  // Check current session
  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (err) {
      console.warn('[SHOP AI] Me verification check offline, using stored session');
    }

    return this.getStoredUser();
  },

  // Logout
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('[SHOP AI] Logout notification failed to reach server');
      }
    }
    this.clearSession();
  },

  // Forgot Password request
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: true,
        message: `Password reset instructions sent to ${email}. (Demo reset PIN: 928-401)`,
      };
    }
  },

  // Audit Logs (Higher Authority & Admin only)
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const token = this.getToken();
    if (!token) return [];

    try {
      const res = await fetch('/api/auth/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.logs || [];
      }
    } catch (err) {
      console.warn('[SHOP AI] Failed to fetch audit logs');
    }

    return [];
  },
};
