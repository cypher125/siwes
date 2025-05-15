// User Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'supervisor' | 'admin';
}

// Student Types
export interface StudentProfile {
  id: number;
  user: User;
  department: string;
  matric_number: string;
  level: string;
  phone_number: string;
  profile_picture: string | null;
  is_approved: boolean;
}

// Supervisor Types
export interface SupervisorProfile {
  id: number;
  user: User;
  department: string;
  title: string;
  phone_number: string;
  profile_picture: string | null;
  is_approved: boolean;
}

// Logbook Types
export interface LogbookEntry {
  id: number;
  student: StudentProfile;
  date: string;
  activities: string;
  skills_acquired: string;
  challenges: string;
  supervisor_comment: string | null;
  is_approved: boolean;
}

// Evaluation Types
export interface Evaluation {
  id: number;
  student: StudentProfile;
  supervisor: SupervisorProfile;
  technical_skills: number;
  communication_skills: number;
  teamwork: number;
  initiative: number;
  punctuality: number;
  overall_performance: number;
  comments: string;
  date_submitted: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'supervisor' | 'admin';
  admin_code?: string;
  level?: string;
  matric_number?: string;
  department?: string;
}

// Token Types
export interface TokenResponse {
  access: string;
  refresh: string;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
} 