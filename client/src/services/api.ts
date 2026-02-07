const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string, name: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, name }) }),
  me: () => request('/auth/me'),

  // Dados
  getAllDados: () => request('/dados/all'),

  getVeeamProducts: () => request('/dados/veeam-products'),
  createVeeamProduct: (data: any) => request('/dados/veeam-products', { method: 'POST', body: JSON.stringify(data) }),
  updateVeeamProduct: (id: number, data: any) => request(`/dados/veeam-products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVeeamProduct: (id: number) => request(`/dados/veeam-products/${id}`, { method: 'DELETE' }),

  getPointsIntervals: () => request('/dados/points-intervals'),
  createPointsInterval: (data: any) => request('/dados/points-intervals', { method: 'POST', body: JSON.stringify(data) }),
  updatePointsInterval: (id: number, data: any) => request(`/dados/points-intervals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePointsInterval: (id: number) => request(`/dados/points-intervals/${id}`, { method: 'DELETE' }),

  getManagementPricing: () => request('/dados/management-pricing'),
  createManagementPricing: (data: any) => request('/dados/management-pricing', { method: 'POST', body: JSON.stringify(data) }),
  updateManagementPricing: (id: number, data: any) => request(`/dados/management-pricing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteManagementPricing: (id: number) => request(`/dados/management-pricing/${id}`, { method: 'DELETE' }),

  getStorageOnpremise: () => request('/dados/storage-onpremise'),
  createStorageOnpremise: (data: any) => request('/dados/storage-onpremise', { method: 'POST', body: JSON.stringify(data) }),
  updateStorageOnpremise: (id: number, data: any) => request(`/dados/storage-onpremise/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStorageOnpremise: (id: number) => request(`/dados/storage-onpremise/${id}`, { method: 'DELETE' }),

  getStorageCloud: () => request('/dados/storage-cloud'),
  createStorageCloud: (data: any) => request('/dados/storage-cloud', { method: 'POST', body: JSON.stringify(data) }),
  updateStorageCloud: (id: number, data: any) => request(`/dados/storage-cloud/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStorageCloud: (id: number) => request(`/dados/storage-cloud/${id}`, { method: 'DELETE' }),

  getMargins: () => request('/dados/margins'),
  updateMargin: (id: number, data: any) => request(`/dados/margins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getServerRoi: () => request('/dados/server-roi'),
  updateServerRoi: (id: number, data: any) => request(`/dados/server-roi/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getManagementMultipliers: () => request('/dados/management-multipliers'),
  updateManagementMultiplier: (id: number, data: any) => request(`/dados/management-multipliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getTaxConfig: () => request('/dados/tax-config'),
  updateTaxConfig: (id: number, data: any) => request(`/dados/tax-config/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Scenarios
  getScenarios: () => request('/scenarios'),
  getScenario: (id: number) => request(`/scenarios/${id}`),
  createScenario: (data: any) => request('/scenarios', { method: 'POST', body: JSON.stringify(data) }),
  updateScenario: (id: number, data: any) => request(`/scenarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteScenario: (id: number) => request(`/scenarios/${id}`, { method: 'DELETE' }),
  calculatePreview: (data: any) => request('/scenarios/calculate', { method: 'POST', body: JSON.stringify(data) }),
};
