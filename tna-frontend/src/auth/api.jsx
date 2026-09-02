const API_BASE_URL = 'http://127.0.0.1:8081/api/v1';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail ||
        (typeof errorData === 'object' ? Object.entries(errorData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : null) ||
        'API request failed';
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  apiRequest,
  auth: {
    me: () => apiRequest('/auth/me/'),
    getUsers: (params = '') => apiRequest(`/auth/users/${params ? `?${params}` : ''}`),
    getUser: (id) => apiRequest(`/auth/users/${id}/`),
    createUser: (data) => apiRequest('/auth/users/', 'POST', data),
    updateUser: (id, data) => apiRequest(`/auth/users/${id}/`, 'PUT', data),
    patchUser: (id, data) => apiRequest(`/auth/users/${id}/`, 'PATCH', data),
    deleteUser: (id) => apiRequest(`/auth/users/${id}/`, 'DELETE'),
    getRoles: () => apiRequest('/auth/roles/'),
    getDepartments: () => apiRequest('/auth/departments/'),
    getDepartment: (id) => apiRequest(`/auth/departments/${id}/`),
    createDepartment: (data) => apiRequest('/auth/departments/', 'POST', data),
    updateDepartment: (id, data) => apiRequest(`/auth/departments/${id}/`, 'PUT', data),
    deleteDepartment: (id) => apiRequest(`/auth/departments/${id}/`, 'DELETE'),
    getPositions: (params = '') => apiRequest(`/auth/positions/${params ? `?${params}` : ''}`),
    getPosition: (id) => apiRequest(`/auth/positions/${id}/`),
    createPosition: (data) => apiRequest('/auth/positions/', 'POST', data),
    updatePosition: (id, data) => apiRequest(`/auth/positions/${id}/`, 'PUT', data),
    deletePosition: (id) => apiRequest(`/auth/positions/${id}/`, 'DELETE'),
  },

  // Backward compatibility alias mapping to auth endpoints
  organizations: {
    getEmployees: () => apiRequest('/auth/users/'),
    getDepartments: () => apiRequest('/auth/departments/'),
    getPositions: () => apiRequest('/auth/positions/'),
    createEmployee: (data) => apiRequest('/auth/users/', 'POST', data),
    updateEmployee: (id, data) => apiRequest(`/auth/users/${id}/`, 'PUT', data),
    deleteEmployee: (id) => apiRequest(`/auth/users/${id}/`, 'DELETE'),
  },

  budget: {
    getBudgets: () => apiRequest('/budget/budgets/'),
    getBudget: (id) => apiRequest(`/budget/budgets/${id}/`),
  },

  tna: {
    getRequests: () => apiRequest('/tna/requests/'),
    getRequest: (id) => apiRequest(`/tna/requests/${id}/`),
    createRequest: (data) => apiRequest('/tna/requests/', 'POST', data),
    approveRequest: (id, actionData) => apiRequest(`/tna/requests/${id}/approve/`, 'POST', actionData),
    getGapAnalysis: (empId) => apiRequest(`/tna/gap-analysis/${empId}/`),
    getRecommendations: (empId) => apiRequest(`/tna/recommendations/${empId}/`),
    getSkillMatrix: (deptId) => apiRequest(`/tna/skill-matrix/${deptId}/`),
  },

  training: {
    getPrograms: () => apiRequest('/training/programs/'),
    createProgram: (data) => apiRequest('/training/programs/', 'POST', data),
    getProviders: () => apiRequest('/training/providers/'),
    createProvider: (data) => apiRequest('/training/providers/', 'POST', data),
    getEnrollments: () => apiRequest('/training/enrollments/'),
    createEnrollment: (data) => apiRequest('/training/enrollments/', 'POST', data),
  },
};
