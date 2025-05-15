import axios from 'axios';
import { ApiResponse, LoginCredentials, RegisterCredentials, TokenResponse } from '@/types/api';
import Cookies from 'js-cookie';

// Token storage using cookies with appropriate security settings
const tokenStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return Cookies.get(key);
    }
    return null;
  },
  setItem: (key: string, value: string, expiresInDays?: number): void => {
    if (typeof window !== 'undefined') {
      Cookies.set(key, value, { 
        expires: expiresInDays || 7, 
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      Cookies.remove(key);
    }
  }
};

// User data still uses localStorage as it's not needed by middleware
const userStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token to requests
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data.access) {
          tokenStorage.setItem('access_token', response.data.access);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out the user
        tokenStorage.removeItem('access_token');
        tokenStorage.removeItem('refresh_token');
        userStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const auth = {
  login: async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post('/token/', { email, password });
      const { access, refresh, user } = response.data;
      
      // Store tokens in cookies
      tokenStorage.setItem('access_token', access, 1); // 1 day for access token
      tokenStorage.setItem('refresh_token', refresh, 7); // 7 days for refresh token
      
      // Store user data in localStorage
      userStorage.setItem('user', JSON.stringify(user));
      
      return { data: { user, access, refresh } };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Login failed' };
    }
  },

  loginWithStaffId: async ({ staffId, password }: { staffId: string; password: string }) => {
    try {
      // First find the supervisor account by staff ID to get their email
      const supervisorResponse = await api.get(`/supervisors/lookup/?staff_id=${encodeURIComponent(staffId)}`);
      
      if (!supervisorResponse.data || !supervisorResponse.data.email) {
        return { error: 'Invalid staff ID. Please check and try again.' };
      }

      const email = supervisorResponse.data.email;
      console.log('Found email for staff ID:', email);
      
      // Now login with email and password
      const response = await api.post('/token/', { email, password });
      console.log('Token response:', response.data);
      
      const { access, refresh, user } = response.data;
      
      console.log('Login successful, user data:', JSON.stringify(user));
      
      if (!user.role) {
        console.warn('User role is missing from response, defaulting to "supervisor"');
        user.role = 'supervisor'; // Force the role if missing
      }
      
      // Store tokens in cookies
      tokenStorage.setItem('access_token', access, 1); // 1 day for access token
      tokenStorage.setItem('refresh_token', refresh, 7); // 7 days for refresh token
      
      // Store user data in localStorage
      userStorage.setItem('user', JSON.stringify(user));
      
      return { data: { user, access, refresh } };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.response?.data?.detail || 'Invalid staff ID or password.' };
    }
  },

  lookupStudentBySurname: async ({ surname, password }: { surname: string; password: string }) => {
    try {
      // Use a direct URL format like the supervisor lookup function
      const response = await api.get(`/students/lookup/?surname=${encodeURIComponent(surname)}${password ? `&password=${encodeURIComponent(password)}` : ''}`);
      console.log("Student lookup URL:", `/students/lookup/?surname=${encodeURIComponent(surname)}${password ? `&password=${encodeURIComponent(password)}` : ''}`);
      return { data: response.data };
    } catch (error: any) {
      console.error('Student lookup error:', error);
      return { error: error.response?.data?.detail || 'Student not found with provided surname and password.' };
    }
  },

  loginStudent: async ({ email }: { email: string }) => {
    try {
      // For student login, we use a special endpoint that doesn't require password
      const response = await api.post('/token/student/', { email });
      const { access, refresh, user } = response.data;
      
      // Store tokens in cookies
      tokenStorage.setItem('access_token', access, 1); // 1 day for access token
      tokenStorage.setItem('refresh_token', refresh, 7); // 7 days for refresh token
      
      // Store user data in localStorage
      userStorage.setItem('user', JSON.stringify(user));
      
      return { data: { user, access, refresh } };
    } catch (error: any) {
      console.error('Student login error:', error);
      return { error: error.response?.data?.detail || 'Failed to login student.' };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<void>> => {
    try {
      if (credentials.role === 'admin') {
        await api.post('/admin/register/', credentials);
      } else if (credentials.role === 'student') {
        await api.post('/students/register/', credentials);
      } else if (credentials.role === 'supervisor') {
        await api.post('/supervisors/register/', credentials);
      } else {
        throw new Error('Invalid role specified');
      }
      return { message: 'Registration successful' };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract the most specific error message possible
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        // Try to extract various forms of error details from Django REST responses
        if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.non_field_errors) {
          // Some DRF responses return errors as arrays
          errorMessage = Array.isArray(error.response.data.non_field_errors) 
            ? error.response.data.non_field_errors.join(' ') 
            : error.response.data.non_field_errors;
        } else if (typeof error.response.data === 'object') {
          // Handle field-specific errors (common in Django validations)
          const fieldErrors = [];
          for (const field in error.response.data) {
            if (Array.isArray(error.response.data[field])) {
              fieldErrors.push(`${field}: ${error.response.data[field].join(' ')}`);
            } else {
              fieldErrors.push(`${field}: ${error.response.data[field]}`);
            }
          }
          if (fieldErrors.length) {
            errorMessage = fieldErrors.join('; ');
          }
        }
      }
      
      return { 
        error: errorMessage
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Try to invalidate the token on the server
      const token = tokenStorage.getItem('access_token');
      if (token) {
        // Use the token for one last request - to logout
        await api.post('/logout/', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during server logout:', error);
      // Continue with local logout even if server logout fails
    } finally {
      // Always clear tokens and user data locally
      tokenStorage.removeItem('access_token');
      tokenStorage.removeItem('refresh_token');
      userStorage.removeItem('user');
    }
  },
  
  getCurrentUser: () => {
    const userStr = userStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const student = {
  getProfile: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/students/profile/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch profile' };
    }
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put('/students/profile/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to update profile' };
    }
  },
};

export const supervisor = {
  getProfile: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/supervisors/profile/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch profile' };
    }
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put('/supervisors/profile/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to update profile' };
    }
  },
  
  getAssignedStudents: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/supervisors/students/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch assigned students' };
    }
  },
  
  getPendingEntries: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/supervisors/evaluations/?status=pending');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch pending entries' };
    }
  },
  
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/supervisors/dashboard/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch dashboard statistics' };
    }
  },
  
  getStudentDetails: async (studentId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/supervisors/students/${studentId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch student details' };
    }
  },
  
  getStudentLogbook: async (studentId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/supervisors/students/${studentId}/logbook/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch student logbook entries' };
    }
  },
  
  getLogbookEntry: async (entryId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/supervisors/logbook/${entryId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch logbook entry' };
    }
  },
  
  reviewLogbookEntry: async (entryId: number, data: { status: string; feedback: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await api.patch(`/supervisors/logbook/${entryId}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to review logbook entry' };
    }
  },
  
  getReports: async (period?: string): Promise<ApiResponse<any>> => {
    try {
      const query = period ? `?period=${period}` : '';
      const response = await api.get(`/supervisors/reports${query}`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch reports' };
    }
  },
  
  getStudentReports: async (studentId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/supervisors/students/${studentId}/reports/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch student reports' };
    }
  }
};

export const logbook = {
  getEntries: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/logbook/entries/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch logbook entries' };
    }
  },

  createEntry: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/logbook/entries/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to create logbook entry' };
    }
  },
};

export const evaluation = {
  getEvaluations: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/evaluations/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch evaluations' };
    }
  },

  createEvaluation: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/evaluations/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to create evaluation' };
    }
  },
  
  getEvaluationById: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/evaluations/${id}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch evaluation details' };
    }
  },
  
  submitFeedback: async (id: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/evaluations/${id}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to submit feedback' };
    }
  }
};

// Admin API functions
export const admin = {
  // Dashboard Statistics
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/dashboard/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch dashboard statistics' };
    }
  },
  
  // Students Management
  getStudents: async (options?: { params?: Record<string, any> }): Promise<ApiResponse<any>> => {
    try {
      let url = '/admin/students/';
      
      // Add query parameters if provided
      if (options?.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      const response = await api.get(url);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch students' };
    }
  },

  getStudentDetails: async (studentId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/admin/students/${studentId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch student details' };
    }
  },

  createStudent: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/admin/students/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to create student' };
    }
  },

  updateStudent: async (studentId: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/admin/students/${studentId}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to update student' };
    }
  },

  deleteStudent: async (studentId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/admin/students/${studentId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to delete student' };
    }
  },

  // Supervisors Management
  getSupervisors: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/supervisors/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch supervisors' };
    }
  },

  getSupervisorDetails: async (supervisorId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/admin/supervisors/${supervisorId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch supervisor details' };
    }
  },

  createSupervisor: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/admin/supervisors/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to create supervisor' };
    }
  },

  updateSupervisor: async (supervisorId: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/admin/supervisors/${supervisorId}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to update supervisor' };
    }
  },

  deleteSupervisor: async (supervisorId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/admin/supervisors/${supervisorId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to delete supervisor' };
    }
  },

  // Assignments Management
  getAssignments: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/assignments/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch assignments' };
    }
  },

  createAssignment: async (data: any): Promise<ApiResponse<any>> => {
    try {
      // If the data contains supervisor field and it's a profile ID not a user ID,
      // we need to look it up in the cache of supervisors
      const response = await api.post('/admin/assignments/', data);
      return { data: response.data };
    } catch (error: any) {
      console.error('Assignment creation error:', error);
      return { 
        error: error.response?.data?.detail || 
              (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : 'Failed to create assignment') 
      };
    }
  },

  updateAssignment: async (assignmentId: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/admin/assignments/${assignmentId}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to update assignment' };
    }
  },

  deleteAssignment: async (assignmentId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/admin/assignments/${assignmentId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to delete assignment' };
    }
  },

  // Departments
  getDepartments: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/departments/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch departments' };
    }
  },
  
  createDepartment: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/admin/departments/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to create department' };
    }
  },
  
  updateDepartment: async (departmentId: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.patch(`/admin/departments/${departmentId}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to update department' };
    }
  },
  
  deleteDepartment: async (departmentId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/admin/departments/${departmentId}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to delete department' };
    }
  },
  
  getDepartmentStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/department-stats/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch department statistics' };
    }
  },

  // Companies
  getCompanies: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/companies/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch companies' };
    }
  },
};

export default api; 