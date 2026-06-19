const API_BASE_URL = 'http://localhost:3000/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) return null
  return response.json()
}

export default {
  // Entreprise
  getCompany: () => request('/company'),
  updateCompany: (data) => request('/company', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Actifs
  getAssets: () => request('/assets'),
  createAsset: (data) => request('/assets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAsset: (id, data) => request(`/assets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAsset: (id) => request(`/assets/${id}`, {
    method: 'DELETE',
  }),

  // Vulnérabilités
  getVulnerabilities: () => request('/vulnerabilities'),
  createVulnerability: (data) => request('/vulnerabilities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Risque
  calculateRisk: () => request('/risk/calculate', {
    method: 'POST',
  }),
}