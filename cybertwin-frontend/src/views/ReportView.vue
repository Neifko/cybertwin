<script setup>
import { onMounted, computed } from 'vue'
import { useCompanyStore } from '../stores/company'
import { useAssetsStore } from '../stores/assets'
import { useVulnerabilitiesStore } from '../stores/vulnerabilities'
import { useRiskStore } from '../stores/risk'
import { useAuth0 } from '@auth0/auth0-vue'
import { getScoreRecommendation } from '../utils/riskRecommendations'

const companyStore = useCompanyStore()
const assetsStore = useAssetsStore()
const vulnStore = useVulnerabilitiesStore()
const riskStore = useRiskStore()
const { getAccessTokenSilently } = useAuth0()

const selectedCompany = computed(() => companyStore.selectedCompany)
const selectedReport = computed(() =>
  riskStore.reportByCompanyId(selectedCompany.value?.id),
)
const scoreRecommendation = computed(() =>
  getScoreRecommendation(selectedReport.value?.score ?? 0),
)

onMounted(async () => {
  const token = await getAccessTokenSilently()

  await companyStore.fetchCompanies(token)
  await Promise.all([
    assetsStore.fetchAssets(token),
    vulnStore.fetchVulnerabilities(token),
  ])

  await riskStore.calculateAllRisks(token)
})

async function onCompanyChange(event) {
  companyStore.selectCompany(Number(event.target.value))
}

const riskColors = {
  faible: '#059669',
  moyenne: '#d97706',
  moyen: '#d97706',
  élevée: '#dc2626',
  élevé: '#dc2626',
}

const riskColor = computed(
  () => riskColors[selectedReport.value?.level] || '#94a3b8',
)

const today = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
)

const recommendations = computed(() => {
  const recs = [...(scoreRecommendation.value.recommendations || [])]
  const crit = vulnStore.byCriticality

  if ((crit['élevée'] || 0) > 0) {
    recs.push(
      'Corriger en priorité les vulnérabilités critiques identifiées, notamment les logiciels obsolètes et mots de passe faibles.',
    )
  }
  if (assetsStore.assetsForSelectedCompany.some((a) => a.internetExposed)) {
    recs.push(
      "Réduire la surface d'exposition Internet en limitant les services accessibles publiquement au strict nécessaire.",
    )
  }
  if (
    vulnStore.vulnerabilitiesForSelectedCompany.some(
      (v) => v.name === 'Absence de sauvegarde',
    )
  ) {
    recs.push(
      'Mettre en place une politique de sauvegarde automatisée et testée régulièrement.',
    )
  }
  if (
    vulnStore.vulnerabilitiesForSelectedCompany.some(
      (v) => v.name === 'Mot de passe faible',
    )
  ) {
    recs.push(
      'Renforcer la politique de mots de passe et envisager une authentification à plusieurs facteurs.',
    )
  }

  return [...new Set(recs)]
})

function vulnForAsset(assetId) {
  return vulnStore.vulnerabilitiesForSelectedCompany.filter(
    (v) => v.assetId === assetId,
  )
}

function printReport() {
  window.print()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4 print:hidden">
      <div>
        <h1 class="text-2xl font-display font-bold text-slate-800">
          <i class="ti ti-file-text text-blue-600 mr-2"></i>Rapport
        </h1>
        <p v-if="selectedCompany" class="text-sm text-slate-500 mt-1">
          Entreprise : {{ selectedCompany.name }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <select
          v-if="companyStore.companies.length > 0"
          :value="companyStore.selectedCompanyId"
          @change="onCompanyChange"
          class="input-cyber min-w-[220px]"
        >
          <option
            v-for="company in companyStore.companies"
            :key="company.id"
            :value="company.id"
          >
            {{ company.name }}
          </option>
        </select>
        <button @click="printReport" class="btn-cyber" :disabled="!selectedCompany">
          <i class="ti ti-printer mr-1"></i> Exporter / Imprimer
        </button>
      </div>
    </div>

    <div
      v-if="companyStore.loading || assetsStore.loading || vulnStore.loading || riskStore.loading"
      class="panel p-8 text-center text-slate-500"
    >
      Génération du rapport en cours...
    </div>

    <div
      v-else-if="companyStore.selectedCompany"
      class="panel p-8 space-y-8 bg-white"
      id="report-content"
    >
      <div class="text-center border-b border-slate-100 pb-6">
        <i class="ti ti-shield-lock text-4xl text-blue-600"></i>
        <h2 class="text-2xl font-display font-bold text-slate-800 mt-2">
          Rapport d'analyse de risque cyber
        </h2>
        <p class="text-slate-500 mt-1">{{ selectedCompany.name }}</p>
        <p class="text-slate-400 text-sm mt-1">Généré le {{ today }}</p>
      </div>

      <section>
        <h3 class="text-lg font-display font-bold text-blue-600 mb-3 flex items-center gap-2">
          <i class="ti ti-building"></i> 1. Présentation de l'entreprise
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p class="text-slate-500">Nom</p>
            <p class="text-slate-900 font-medium">{{ selectedCompany.name }}</p>
          </div>
          <div>
            <p class="text-slate-500">Secteur</p>
            <p class="text-slate-900 font-medium">{{ selectedCompany.sector }}</p>
          </div>
          <div>
            <p class="text-slate-500">Employés</p>
            <p class="text-slate-900 font-medium">{{ selectedCompany.employeesCount }}</p>
          </div>
          <div>
            <p class="text-slate-500">Serveurs</p>
            <p class="text-slate-900 font-medium">{{ selectedCompany.serversCount }}</p>
          </div>
          <div>
            <p class="text-slate-500">Postes clients</p>
            <p class="text-slate-900 font-medium">{{ selectedCompany.clientWorkstationsCount }}</p>
          </div>
          <div>
            <p class="text-slate-500">Services exposés</p>
            <p class="text-slate-900 font-medium">
              {{
                selectedCompany.exposedServices.length > 0
                  ? selectedCompany.exposedServices.join(', ')
                  : 'Aucun'
              }}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 class="text-lg font-display font-bold text-blue-600 mb-3 flex items-center gap-2">
          <i class="ti ti-stack-2"></i> 2. Inventaire des actifs ({{ assetsStore.totalAssets }})
        </h3>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
              <th class="py-2 pl-3 pr-4 font-medium rounded-tl-lg">Nom</th>
              <th class="py-2 pr-4 font-medium">Type</th>
              <th class="py-2 pr-4 font-medium">Exposition</th>
              <th class="py-2 pr-3 font-medium rounded-tr-lg">Vulnérabilités</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="asset in assetsStore.assetsForSelectedCompany"
              :key="asset.id"
              class="border-b border-slate-100 last:border-0"
            >
              <td class="py-3 pl-3 pr-4 text-slate-900 font-medium">{{ asset.name }}</td>
              <td class="py-3 pr-4 text-slate-600">{{ asset.type }}</td>
              <td class="py-3 pr-4">
                <span :class="asset.internetExposed ? 'text-red-600 font-medium' : 'text-slate-500'">
                  {{ asset.internetExposed ? 'Exposé' : 'Interne' }}
                </span>
              </td>
              <td class="py-3 pr-3 text-slate-600">{{ vulnForAsset(asset.id).length }}</td>
            </tr>
            <tr v-if="assetsStore.assetsForSelectedCompany.length === 0">
              <td colspan="4" class="py-4 text-center text-slate-500 italic">
                Aucun actif enregistré.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3 class="text-lg font-display font-bold text-blue-600 mb-3 flex items-center gap-2">
          <i class="ti ti-bug"></i> 3. Vulnérabilités détectées ({{ vulnStore.totalVulnerabilities }})
        </h3>
        <div class="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <p class="font-semibold">{{ scoreRecommendation.title }}</p>
          <p class="mt-1 leading-relaxed">{{ scoreRecommendation.message }}</p>
        </div>
        <div class="flex gap-3 mb-4 text-sm font-medium">
          <span class="px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
            Faible : {{ vulnStore.byCriticality.faible || 0 }}
          </span>
          <span class="px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            Moyenne : {{ vulnStore.byCriticality.moyenne || 0 }}
          </span>
          <span class="px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
            Élevée : {{ vulnStore.byCriticality['élevée'] || 0 }}
          </span>
        </div>
        <ul class="space-y-3 text-sm">
          <li
            v-for="vuln in vulnStore.vulnerabilitiesForSelectedCompany"
            :key="vuln.id"
            class="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100"
          >
            <i
              class="ti ti-alert-circle text-lg mt-0.5"
              :style="{
                color:
                  riskColors[vuln.criticality === 'élevée' ? 'élevé' : vuln.criticality],
              }"
            ></i>
            <span class="text-slate-600 leading-relaxed">
              <strong class="text-slate-900">{{ vuln.name }}</strong> — {{ vuln.description }}
            </span>
          </li>
          <li
            v-if="vulnStore.vulnerabilitiesForSelectedCompany.length === 0"
            class="text-slate-500 italic"
          >
            Aucune vulnérabilité n'a été détectée.
          </li>
        </ul>
      </section>

      <section>
        <h3 class="text-lg font-display font-bold text-blue-600 mb-3 flex items-center gap-2">
          <i class="ti ti-alert-triangle"></i> 4. Niveau de risque global
        </h3>
        <div class="flex items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <span class="text-4xl font-display font-bold" :style="{ color: riskColor }">
            {{ selectedReport?.score || 0 }}<span class="text-xl text-slate-400">/100</span>
          </span>
          <span
            class="px-4 py-1.5 rounded-full text-sm capitalize border font-medium"
            :style="{
              color: riskColor,
              borderColor: riskColor + '40',
              backgroundColor: riskColor + '15',
            }"
          >
            Risque {{ selectedReport?.level || 'faible' }}
          </span>
        </div>
      </section>

      <section>
        <h3 class="text-lg font-display font-bold text-blue-600 mb-3 flex items-center gap-2">
          <i class="ti ti-bulb"></i> 5. Recommandations de sécurité
        </h3>
        <ul class="space-y-3 text-sm">
          <li
            v-for="(rec, index) in recommendations"
            :key="index"
            class="flex items-start gap-2 text-slate-700 leading-relaxed"
          >
            <div
              class="mt-0.5 min-w-[20px] h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
            >
              <i class="ti ti-check text-xs"></i>
            </div>
            {{ rec }}
          </li>
        </ul>
      </section>
    </div>

    <div v-else class="panel p-10 text-center flex flex-col items-center justify-center">
      <i class="ti ti-file-x text-5xl text-slate-300 mb-4"></i>
      <h2 class="text-xl font-display font-bold text-slate-700 mb-2">Rapport indisponible</h2>
      <p class="text-slate-500 max-w-md">
        Vous devez d'abord créer une entreprise et évaluer ses vulnérabilités pour générer un rapport.
      </p>
    </div>
  </div>
</template>
