import { defineStore } from 'pinia'
import { mockVulnerabilities } from '../services/mockData'

export const useVulnerabilitiesStore = defineStore('vulnerabilities', {
  state: () => ({
    vulnerabilities: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalVulnerabilities: (state) => state.vulnerabilities.length,

    byCriticality: (state) => {
      return state.vulnerabilities.reduce((acc, v) => {
        acc[v.criticality] = (acc[v.criticality] || 0) + 1
        return acc
      }, {})
    },

    vulnerabilitiesByAsset: (state) => (assetId) => {
      return state.vulnerabilities.filter((v) => v.assetId === assetId)
    },
  },

  actions: {
    async fetchVulnerabilities() {
      this.loading = true
      this.error = null
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        this.vulnerabilities = [...mockVulnerabilities]
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    addVulnerability(vuln) {
      const newVuln = { ...vuln, id: Date.now() }
      this.vulnerabilities.push(newVuln)
      // TODO: apiService.createVulnerability(vuln)
    },
  },
})