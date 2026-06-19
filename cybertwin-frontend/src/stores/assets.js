import { defineStore } from 'pinia'
import { mockAssets } from '../services/mockData'

export const useAssetsStore = defineStore('assets', {
  state: () => ({
    assets: [],
    loading: false,
    error: null,
  }),

  getters: {
    assetsByType: (state) => {
      return state.assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1
        return acc
      }, {})
    },
    totalAssets: (state) => state.assets.length,
  },

  actions: {
    async fetchAssets() {
      this.loading = true
      this.error = null
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        this.assets = [...mockAssets]
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    addAsset(asset) {
      const newAsset = { ...asset, id: Date.now() }
      this.assets.push(newAsset)
      // TODO: apiService.createAsset(asset)
    },

    updateAsset(id, updatedData) {
      const index = this.assets.findIndex((a) => a.id === id)
      if (index !== -1) {
        this.assets[index] = { ...this.assets[index], ...updatedData }
      }
      // TODO: apiService.updateAsset(id, updatedData)
    },

    deleteAsset(id) {
      this.assets = this.assets.filter((a) => a.id !== id)
      // TODO: apiService.deleteAsset(id)
    },
  },
})