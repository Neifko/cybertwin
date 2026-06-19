<script setup>
import { onMounted, computed } from 'vue'
import { useCompanyStore } from '../stores/company'
import { useAssetsStore } from '../stores/assets'
import { useVulnerabilitiesStore } from '../stores/vulnerabilities'
import { useRiskStore } from '../stores/risk'

const companyStore = useCompanyStore()
const assetsStore = useAssetsStore()
const vulnStore = useVulnerabilitiesStore()
const riskStore = useRiskStore()

onMounted(async () => {
  await Promise.all([
    companyStore.fetchCompany(),
    assetsStore.fetchAssets(),
    vulnStore.fetchVulnerabilities(),
  ])
  riskStore.calculateRisk()
})

const riskColors = {
  faible: '#34d399',
  moyen: '#fbbf24',
  élevé: '#f87171',
}
const riskColor = computed(() => riskColors[riskStore.level] || '#94a3b8')

const today = computed(() =>
  new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
)

const recommendations = computed(() => {
  const recs = []
  const crit = vulnStore.byCriticality

  if ((crit['élevée'] || 0) > 0) {
    recs.push("Corriger en priorité les vulnérabilités critiques identifiées, notamment les logiciels obsolètes et mots de passe faibles.")
  }
  if (assetsStore.assets.some(a => a.internetExposed)) {
    recs.push("Réduire la surface d'exposition Internet en limitant les services accessibles publiquement au strict nécessaire.")
  }
  if (vulnStore.vulnerabilities.some(v => v.name === 'Absence de sauvegarde')) {
    recs.push("Mettre en place une politique de sauvegarde automatisée et testée régulièrement.")
  }
  if (vulnStore.vulnerabilities.some(v => v.name === 'Mot de passe faible')) {
    recs.push("Renforcer la politique de mots de passe et envisager une authentification à plusieurs facteurs.")
  }
  recs.push("Effectuer un audit de sécurité régulier afin de suivre l'évolution du niveau de risque dans le temps.")

  return recs
})

function vulnForAsset(assetId) {
  return vulnStore.vulnerabilities.filter(v => v.assetId === assetId)
}

function printReport() {
  window.print()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4 print:hidden">
      <h1 class="text-2xl font-display font-bold text-white">
        <i class="ti ti-file-text text-cyber-cyan mr-2"></i>Rapport
      </h1>
      <button @click="printReport" class="btn-cyber">
        <i class="ti ti-printer mr-1"></i> Exporter / Imprimer
      </button>
    </div>

    <div v-if="companyStore.company" class="panel p-8 space-y-8" id="report-content">
      <!-- En-tête -->
      <div class="text-center border-b border-white/5 pb-6">
        <i class="ti ti-shield-lock text-4xl text-cyber-cyan"></i>
        <h2 class="text-2xl font-display font-bold text-white mt-2">Rapport d'analyse de risque cyber</h2>
        <p class="text-slate-500 mt-1">Généré le {{ today }}</p>
      </div>

      <!-- 1. Présentation entreprise -->
      <section>
        <h3 class="text-lg font-display font-bold text-cyber-cyan mb-3 flex items-center gap-2">
          <i class="ti ti-building"></i> 1. Présentation de l'entreprise
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-slate-500">Nom</p>
            <p class="text-white">{{ companyStore.company.name }}</p>
          </div>
          <div>
            <p class="text-slate-500">Secteur</p>
            <p class="text-white">{{ companyStore.company.sector }}</p>
          </div>
          <div>
            <p class="text-slate-500">Employés</p>
            <p class="text-white">{{ companyStore.company.employeesCount }}</p>
          </div>
          <div>
            <p class="text-slate-500">Serveurs</p>
            <p class="text-white">{{ companyStore.company.serversCount }}</p>
          </div>
          <div>
            <p class="text-slate-500">Postes clients</p>
            <p class="text-white">{{ companyStore.company.clientWorkstationsCount }}</p>
          </div>
          <div>
            <p class="text-slate-500">Services exposés</p>
            <p class="text-white">{{ companyStore.company.exposedServices.join(', ') }}</p>
          </div>
        </div>
      </section>

      <!-- 2. Inventaire des actifs -->
      <section>
        <h3 class="text-lg font-display font-bold text-cyber-cyan mb-3 flex items-center gap-2">
          <i class="ti ti-stack-2"></i> 2. Inventaire des actifs ({{ assetsStore.totalAssets }})
        </h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-white/5">
              <th class="py-2 pr-4 font-medium">Nom</th>
              <th class="py-2 pr-4 font-medium">Type</th>
              <th class="py-2 pr-4 font-medium">Exposition</th>
              <th class="py-2 font-medium">Vulnérabilités</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in assetsStore.assets" :key="asset.id" class="border-b border-white/5 last:border-0">
              <td class="py-2 pr-4 text-white">{{ asset.name }}</td>
              <td class="py-2 pr-4 text-slate-400">{{ asset.type }}</td>
              <td class="py-2 pr-4">
                <span :class="asset.internetExposed ? 'text-risk-high' : 'text-slate-500'">
                  {{ asset.internetExposed ? 'Exposé' : 'Interne' }}
                </span>
              </td>
              <td class="py-2 text-slate-400">{{ vulnForAsset(asset.id).length }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 3. Vulnérabilités détectées -->
      <section>
        <h3 class="text-lg font-display font-bold text-cyber-cyan mb-3 flex items-center gap-2">
          <i class="ti ti-bug"></i> 3. Vulnérabilités détectées ({{ vulnStore.totalVulnerabilities }})
        </h3>
        <div class="flex gap-3 mb-4 text-sm">
          <span class="px-3 py-1 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/20">
            Faible : {{ vulnStore.byCriticality.faible || 0 }}
          </span>
          <span class="px-3 py-1 rounded-full bg-risk-medium/10 text-risk-medium border border-risk-medium/20">
            Moyenne : {{ vulnStore.byCriticality.moyenne || 0 }}
          </span>
          <span class="px-3 py-1 rounded-full bg-risk-high/10 text-risk-high border border-risk-high/20">
            Élevée : {{ vulnStore.byCriticality['élevée'] || 0 }}
          </span>
        </div>
        <ul class="space-y-2 text-sm">
          <li v-for="vuln in vulnStore.vulnerabilities" :key="vuln.id" class="flex items-start gap-2">
            <i class="ti ti-point-filled text-xs mt-1" :style="{ color: riskColors[vuln.criticality === 'élevée' ? 'élevé' : vuln.criticality] }"></i>
            <span class="text-slate-400">
              <span class="text-white">{{ vuln.name }}</span> — {{ vuln.description }}
            </span>
          </li>
        </ul>
      </section>

      <!-- 4. Niveau de risque -->
      <section>
        <h3 class="text-lg font-display font-bold text-cyber-cyan mb-3 flex items-center gap-2">
          <i class="ti ti-alert-triangle"></i> 4. Niveau de risque global
        </h3>
        <div class="flex items-center gap-4">
          <span
            class="text-3xl font-display font-bold"
            :style="{ color: riskColor }"
          >
            {{ riskStore.score }}/100
          </span>
          <span
            class="px-4 py-1.5 rounded-full text-sm capitalize border"
            :style="{ color: riskColor, borderColor: riskColor + '40', backgroundColor: riskColor + '15' }"
          >
            Risque {{ riskStore.level }}
          </span>
        </div>
      </section>

      <!-- 5. Recommandations -->
      <section>
        <h3 class="text-lg font-display font-bold text-cyber-cyan mb-3 flex items-center gap-2">
          <i class="ti ti-bulb"></i> 5. Recommandations de sécurité
        </h3>
        <ul class="space-y-2 text-sm">
          <li v-for="(rec, index) in recommendations" :key="index" class="flex items-start gap-2 text-slate-400">
            <i class="ti ti-check text-cyber-cyan mt-0.5"></i>
            {{ rec }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>