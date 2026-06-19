import { defineStore } from 'pinia'
import { useAssetsStore } from './assets'
import { useVulnerabilitiesStore } from './vulnerabilities'

const CRITICALITY_WEIGHTS = {
  faible: 1,
  moyenne: 2,
  élevée: 3,
}

export const useRiskStore = defineStore('risk', {
  state: () => ({
    score: 0,
    level: null,
  }),

  actions: {
    calculateRisk() {
      const assetsStore = useAssetsStore()
      const vulnStore = useVulnerabilitiesStore()

      const assetsCount = assetsStore.totalAssets
      const vulnCount = vulnStore.totalVulnerabilities
      const exposedCount = assetsStore.assets.filter((a) => a.internetExposed).length

      const criticalityScore = vulnStore.vulnerabilities.reduce(
        (sum, v) => sum + (CRITICALITY_WEIGHTS[v.criticality] || 1),
        0
      )

      // Formule simple, à affiner avec le binôme backend
      const rawScore =
        vulnCount * 2 + criticalityScore * 3 + exposedCount * 4 + assetsCount * 0.5

      this.score = Math.min(100, Math.round(rawScore))

      if (this.score < 30) this.level = 'faible'
      else if (this.score < 60) this.level = 'moyen'
      else this.level = 'élevé'

      return { score: this.score, level: this.level }
    },
  },
})