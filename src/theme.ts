export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  borderSubtle: string;
  borderDefault: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  nodeWorkstation: string;
  nodeControlPlane: string;
  nodeWorkerNode: string;
  nodeWorkload: string;
  nodeNetwork: string;
  nodeConfig: string;
  nodeStorage: string;
  statusIdle: string;
  statusActive: string;
  statusSuccess: string;
  statusError: string;
  statusWarning: string;
}

export const themes: Record<ThemeMode, ThemeColors> = {
  dark: {
    bgPrimary: '#0f141c',
    bgSecondary: '#161e2b',
    bgTertiary: '#1e293b',
    borderSubtle: '#263447',
    borderDefault: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    accent: '#38bdf8',
    accentHover: '#0ea5e9',
    nodeWorkstation: '#475569',
    nodeControlPlane: '#3b82f6',
    nodeWorkerNode: '#10b981',
    nodeWorkload: '#6366f1',
    nodeNetwork: '#06b6d4',
    nodeConfig: '#f59e0b',
    nodeStorage: '#8b5cf6',
    statusIdle: '#64748b',
    statusActive: '#38bdf8',
    statusSuccess: '#22c55e',
    statusError: '#ef4444',
    statusWarning: '#f59e0b',
  },
  light: {
    bgPrimary: '#f8fafc',
    bgSecondary: '#ffffff',
    bgTertiary: '#f1f5f9',
    borderSubtle: '#e2e8f0',
    borderDefault: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#0284c7',
    accentHover: '#0369a1',
    nodeWorkstation: '#64748b',
    nodeControlPlane: '#2563eb',
    nodeWorkerNode: '#059669',
    nodeWorkload: '#4f46e5',
    nodeNetwork: '#0891b2',
    nodeConfig: '#d97706',
    nodeStorage: '#7c3aed',
    statusIdle: '#94a3b8',
    statusActive: '#0284c7',
    statusSuccess: '#16a34a',
    statusError: '#dc2626',
    statusWarning: '#d97706',
  },
};
