export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  preferredCurrency?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  userId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface GeneralExpense {
  id: string;
  description: string;
  amount: number;
  currency?: string;
  date: string;
  category?: string;
  userId: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TimelineEvent {
  id: string;
  type: 'note' | 'call' | 'update';
  content: string;
  date: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  status: TaskStatus;
  dueDate?: string;
  timezone?: string;
  difficulty: number; // 1-10
  estimatedHours?: number;
  actualHours?: number;
  expectedRevenue?: number;
  currency?: string;
  expenses?: Expense[];
  subtasks?: Subtask[];
  timeline?: TimelineEvent[];
  userId: string;
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
