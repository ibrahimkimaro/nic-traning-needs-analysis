const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:8081/api/v1`;

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
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }

      const errorMsg = errorData.detail || errorData.message ||
        (typeof errorData === 'object' ? Object.entries(errorData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : null) ||
        'API request failed';
      throw new Error(errorMsg);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  apiRequest,
  auth: {
    login: (credentials) => apiRequest('/auth/login/', 'POST', credentials),
    me: () => apiRequest('/auth/me/'),
    changePassword: (data) => apiRequest('/auth/change-password/', 'POST', data),
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
    getRecipients: () => apiRequest('/tna/recipients/'),
    getRequests: () => apiRequest('/tna/requests/'),
    getMyRequests: () => apiRequest('/tna/requests/me/'),
    getRequest: (id) => apiRequest(`/tna/requests/${id}/`),
    createRequest: (data) => apiRequest('/tna/requests/create/', 'POST', data),
    getParticipantCandidates: (search = '') => apiRequest(`/tna/participants/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    addRequestComment: (requestId, body) => apiRequest(`/tna/requests/${requestId}/comments/`, 'POST', { body }),
    respondToRequest: (requestId, response) => apiRequest(`/tna/requests/${requestId}/participant-response/`, 'POST', { response }),
    uploadAttachment: (requestId, file, documentType, itemId = null) => {
      const formData = new FormData();
      formData.append('file', file);
      if (documentType) {
        formData.append('document_type', documentType);
      }
      if (itemId) {
        formData.append('item_id', itemId);
      }
      return apiRequest(`/tna/requests/${requestId}/attachments/`, 'POST', formData);
    },
    approveRequest: (id, actionData) => apiRequest(`/tna/requests/${id}/approve/`, 'POST', actionData),
    deleteRequest: (id) => apiRequest(`/tna/requests/${id}/`, 'DELETE'),
    getGapAnalysis: (empId) => apiRequest(`/tna/analysis/${empId}/`),
    getRecommendations: (empId) => apiRequest(`/tna/recommendations/${empId}/`),
    getSkillMatrix: (deptId) => apiRequest(`/tna/skill-matrix/${deptId}/`),

    // Deterministic Enterprise Macro Features (Zero AI)
    evaluateBottleneck: (data) => apiRequest('/tna/macro/bottleneck-evaluate/', 'POST', data),
    getWeightedSkillMatrix: () => apiRequest('/tna/macro/weighted-matrix/'),
    getTelemetryStreams: () => apiRequest('/tna/macro/telemetry/'),
    getEarlyWarnings: () => apiRequest('/tna/macro/early-warnings/'),
    getAnonymizedMacroNeeds: () => apiRequest('/tna/macro/anonymized-needs/'),
  },

  training: {
    getPrograms: () => apiRequest('/training/programs/'),
    createProgram: (data) => apiRequest('/training/programs/', 'POST', data),
    getProviders: () => apiRequest('/training/providers/'),
    createProvider: (data) => apiRequest('/training/providers/', 'POST', data),
    getEnrollments: () => apiRequest('/training/enrollments/'),
    createEnrollment: (data) => apiRequest('/training/enrollments/', 'POST', data),
  },

  compliance: {
    getCertifications: () => apiRequest('/compliance/certifications/'),
    createCertification: (data) => apiRequest('/compliance/certifications/', 'POST', data),
    getRequirements: () => apiRequest('/compliance/requirements/'),
    createRequirement: (data) => apiRequest('/compliance/requirements/', 'POST', data),
    getExpiring: () => apiRequest('/compliance/expiring/'),
  },

  competencies: {
    getCompetencies: () => apiRequest('/competencies/competencies/'),
    getPositionRequirements: (posId) => apiRequest(`/competencies/positions/${posId}/requirements/`),
  },

  notifications: {
    getMine: () => apiRequest('/notifications/'),
    markRead: () => apiRequest('/notifications/read/', 'PATCH', {}),
    clear: () => apiRequest('/notifications/clear/', 'DELETE'),
  },
};