/**
 * SITEPULSE STUDIO v3.0 - TIPOS TYPESCRIPT
 * Definições de tipos para todos os componentes
 */

// ============================================
// TIPOS BASE
// ============================================

export type EngineStatus = 'online' | 'offline' | 'busy' | 'error';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EngineType = 
  | 'intent' 
  | 'context' 
  | 'evidence' 
  | 'memory' 
  | 'learning' 
  | 'decision' 
  | 'action' 
  | 'predictive' 
  | 'autonomous' 
  | 'security';

// ============================================
// TIPOS DE COMPONENTES UI
// ============================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'loose' | 'flat' | 'elevated';
  interactive?: boolean;
  header?: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  icon?: React.ReactNode;
  label?: string;
  helperText?: string;
  errorText?: string;
}

export interface BadgeProps {
  severity?: SeverityLevel;
  status?: 'online' | 'offline' | 'busy' | 'error';
  variant?: 'default' | 'pulse' | 'counter';
  count?: number;
  children?: React.ReactNode;
  className?: string;
}

// ============================================
// TIPOS DE MOTORES
// ============================================

export interface EngineConfig {
  id: EngineType;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: EngineStatus;
  score: number;
  lastActivity: Date;
}

export interface EngineCardProps {
  engine: EngineConfig;
  metrics?: EngineMetric[];
  actions?: EngineAction[];
  onClick?: () => void;
  className?: string;
}

export interface EngineMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface EngineAction {
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  icon?: React.ReactNode;
}

// ============================================
// TIPOS DE LAYOUT
// ============================================

export interface SidebarProps {
  engines: EngineConfig[];
  activeEngine?: EngineType;
  onEngineClick?: (engine: EngineType) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  notifications?: number;
  onNotificationsClick?: () => void;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

// ============================================
// TIPOS DE TEMA
// ============================================

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: Record<string, string>;
}

// ============================================
// TIPOS DE ANIMAÇÃO
// ============================================

export interface AnimationProps {
  delay?: number;
  duration?: number;
  stagger?: number;
}

// ============================================
// TIPOS DE SEGURANÇA
// ============================================

export interface Vulnerability {
  id: string;
  name: string;
  severity: SeverityLevel;
  location: string;
  cwe?: string;
  cvss?: number;
  evidence?: string[];
  remediation?: string;
}

export interface SecurityScore {
  overall: number;
  letter: string;
  breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// ============================================
// TIPOS DE RELATÓRIO
// ============================================

export interface AuditReport {
  id: string;
  target: string;
  date: Date;
  duration: number;
  score: SecurityScore;
  vulnerabilities: Vulnerability[];
  summary: string;
  recommendations: string[];
}
