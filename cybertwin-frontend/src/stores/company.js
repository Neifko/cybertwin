import { defineStore } from 'pinia'
import { mockCompany } from '../services/mockData'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    company: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCompany() {
      this.loading = true
      this.error = null
      try {
        // TODO: remplacer par apiService.getCompany() quand le back sera prêt
        await new Promise((resolve) => setTimeout(resolve, 300))
        this.company = { ...mockCompany }
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    updateCompany(updatedData) {
      this.company = { ...this.company, ...updatedData }
      // TODO: appeler apiService.updateCompany(updatedData)
    },
  },
})