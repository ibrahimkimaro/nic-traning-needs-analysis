const API_BASE_URL = 'http://127.0.0.1:8081/api/v1';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('accessToken');
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.statusText === 'Unauthorized') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }

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
    getMyRequests: () => apiRequest('/tna/requests/me/'),
    getRequest: (id) => apiRequest(`/tna/requests/${id}/`),
    createRequest: (data) => apiRequest('/tna/requests/create/', 'POST', data),
    uploadAttachment: (requestId, file, documentType) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      return apiRequest(`/tna/requests/${requestId}/attachments/`, 'POST', formData);
    },
    approveRequest: (id, actionData) => apiRequest(`/tna/requests/${id}/approve/`, 'POST', actionData),
    getGapAnalysis: (empId) => apiRequest(`/tna/analysis/${empId}/`),
    getRecommendations: (empId) => apiRequest(`/tna/recommendations/${empId}/`),
    getSkillMatrix: (deptId) => apiRequest(`/tna/skill-matrix/${deptId}/`),
  },

  ai: {
    queryKnowledge: (query, requestId = null, limit = 5) => apiRequest('/ai/knowledge/query/', 'POST', {
      query,
      request_id: requestId,
      limit,
    }),
    answerKnowledge: (query, requestId = null, limit = 5) => apiRequest('/ai/knowledge/answer/', 'POST', {
      query,
      request_id: requestId,
      limit,
    }),
    reviewAttachment: (attachmentId, approvalStatus) => apiRequest(
      `/ai/attachments/${attachmentId}/review/`,
      'POST',
      { approval_status: approvalStatus },
    ),
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
