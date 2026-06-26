<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCompanyStore } from '../stores/company'
import { useAssetsStore } from '../stores/assets'
import { useVulnerabilitiesStore } from '../stores/vulnerabilities'
import { useRiskStore } from '../stores/risk'
import { useAuth0 } from '@auth0/auth0-vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { getScoreRecommendation } from '../utils/riskRecommendations'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const companyStore = useCompanyStore()
const assetsStore = useAssetsStore()
const vulnStore = useVulnerabilitiesStore()
const riskStore = useRiskStore()
const { getAccessTokenSilently } = useAuth0()

const isLoading = ref(true)

const riskColors = {
  faible: '#059669',
  moyen: '#d97706',
  élevé: '#dc2626',
}

const selectedCompany = computed(() => companyStore.selectedCompany)
const selectedReport = computed(() =>
  riskStore.reportByCompanyId(selectedCompany.value?.id),
)
const selectedAssets = computed(() => assetsStore.assetsForSelectedCompany)
const selectedVulnerabilities = computed(
  () => vulnStore.vulnerabilitiesForSelectedCompany,
)
const scoreRecommendation = computed(() =>
  getScoreRecommendation(selectedReport.value?.score ?? 0),
)

onMounted(async () => {
  try {
    const token = await getAccessTokenSilently()

    await companyStore.fetchCompanies(token)
    await Promise.all([
      assetsStore.fetchAssets(token),
      vulnStore.fetchVulnerabilities(token),
    ])
    await riskStore.calculateAllRisks(token)
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard :', error)
  } finally {
    isLoading.value = false
  }
})

async function onCompanyChange(event) {
  const companyId = Number(event.target.value)
  companyStore.selectCompany(companyId)
  isLoading.value = true
  try {
    const token = await getAccessTokenSilently()
    await Promise.all([
      assetsStore.fetchAssets(token, companyId),
      vulnStore.fetchVulnerabilities(token, companyId),
    ])
    await riskStore.calculateRisk(token, companyId)
  } catch (error) {
    console.error('Erreur lors du changement d\'entreprise :', error)
  } finally {
    isLoading.value = false
  }
}

function riskColor(level) {
  return riskColors[level] || '#94a3b8'
}

function assetsChartData() {
  const data = selectedAssets.value.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1
    return acc
  }, {})

  return {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'],
        borderWidth: 0,
      },
    ],
  }
}

function vulnChartData() {
  const data = selectedVulnerabilities.value.reduce((acc, vuln) => {
    acc[vuln.criticality] = (acc[vuln.criticality] || 0) + 1
    return acc
  }, {})

  return {
    labels: ['faible', 'moyenne', 'élevée'],
    datasets: [
      {
        label: 'Vulnérabilités',
        data: [data.faible || 0, data.moyenne || 0, data['élevée'] || 0],
        backgroundColor: ['#34d399', '#fbbf24', '#f87171'],
        borderRadius: 6,
      },
    ],
  }
}

const selectedSummary = computed(() => ({
  assets: selectedAssets.value.length,
  vulnerabilities: selectedVulnerabilities.value.length,
  exposedAssets: selectedAssets.value.filter((asset) => asset.internetExposed).length,
  score: selectedReport.value?.score || 0,
  level: selectedReport.value?.level || 'faible',
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 12 } },
      position: 'bottom',
    },
  },
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' }, beginAtZero: true },
  },
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-white">
          <i class="ti ti-layout-dashboard text-cyber-cyan mr-2"></i>Tableau de bord
        </h1>
        <p v-if="selectedCompany" class="text-sm text-slate-500 mt-1">
          Entreprise sélectionnée : <span class="text-slate-300 font-medium">{{ selectedCompany.name }}</span>
        </p>
      </div>

      <select
        v-if="companyStore.companies.length > 0"
        :value="companyStore.selectedCompanyId"
        @change="onCompanyChange"
        class="input-cyber min-w-[220px]"
      >
        <option v-for="company in companyStore.companies" :key="company.id" :value="company.id">
          {{ company.name }}
        </option>
      </select>
    </div>

    <div
      v-if="isLoading || companyStore.loading || assetsStore.loading || vulnStore.loading || riskStore.loading"
      class="panel p-10 flex flex-col items-center justify-center text-slate-400"
    >
      <div class="w-10 h-10 border-4 border-slate-700 border-t-cyber-cyan rounded-full animate-spin mb-4"></div>
      <p>Synchronisation des données...</p>
    </div>

    <div v-else-if="companyStore.companies.length === 0" class="panel p-10 text-center text-slate-400">
      <i class="ti ti-building text-4xl mb-3 block"></i>
      <p>Aucune entreprise configurée. Commencez par en créer une dans l'onglet Entreprise.</p>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500">Actifs</span>
            <i class="ti ti-stack-2 text-cyber-violet"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">{{ selectedSummary.assets }}</p>
        </div>
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500">Vulnérabilités</span>
            <i class="ti ti-bug text-cyber-pink"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">{{ selectedSummary.vulnerabilities }}</p>
        </div>
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500">Actifs exposés</span>
            <i class="ti ti-world text-risk-medium"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">{{ selectedSummary.exposedAssets }}</p>
        </div>
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500">Score</span>
            <i class="ti ti-alert-triangle text-risk-high"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">
            {{ selectedSummary.score }}<span class="text-base text-slate-500">/100</span>
          </p>
        </div>
      </div>

      <div
        class="panel p-6 border border-white/10"
        :style="{
          backgroundColor: riskColor(selectedSummary.level) + '14',
          borderColor: riskColor(selectedSummary.level) + '30',
        }"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-slate-400 mb-2">Message de recommandation</p>
            <h2 class="text-xl font-display font-bold text-white">{{ scoreRecommendation.title }}</h2>
          </div>
          <span
            class="px-3 py-1 rounded-full text-sm capitalize border font-medium"
            :style="{
              color: riskColor(selectedSummary.level),
              borderColor: riskColor(selectedSummary.level) + '40',
              backgroundColor: riskColor(selectedSummary.level) + '15',
            }"
          >
            Risque {{ selectedSummary.level }}
          </span>
        </div>
        <p class="mt-3 text-slate-700 leading-relaxed">{{ scoreRecommendation.message }}</p>
        <ul v-if="scoreRecommendation.recommendations?.length" class="mt-4 space-y-2">
          <li
            v-for="(rec, index) in scoreRecommendation.recommendations"
            :key="index"
            class="flex items-start gap-2 text-sm text-slate-700"
          >
            <i class="ti ti-point-filled mt-0.5" :style="{ color: riskColor(selectedSummary.level) }"></i>
            {{ rec }}
          </li>
        </ul>
      </div>

      <div class="panel p-6 space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 class="text-xl font-display font-bold text-white">{{ selectedCompany.name }}</h2>
            <p class="text-sm text-slate-500">{{ selectedCompany.sector }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              v-if="selectedReport"
              class="px-3 py-1 rounded-full text-sm capitalize border"
              :style="{
                color: riskColor(selectedReport.level),
                borderColor: riskColor(selectedReport.level) + '40',
                backgroundColor: riskColor(selectedReport.level) + '15',
              }"
            >
              {{ selectedReport.level }}
            </span>
            <p
              v-if="selectedReport"
              class="text-2xl font-display font-bold"
              :style="{ color: riskColor(selectedReport.level) }"
            >
              {{ selectedReport.score }}<span class="text-sm text-slate-500">/100</span>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-500">Actifs</p>
            <p class="text-2xl font-bold text-white">{{ selectedSummary.assets }}</p>
          </div>
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-500">Vulnérabilités</p>
            <p class="text-2xl font-bold text-white">{{ selectedSummary.vulnerabilities }}</p>
          </div>
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-500">Actifs exposés</p>
            <p class="text-2xl font-bold text-white">{{ selectedSummary.exposedAssets }}</p>
          </div>
        </div>

        <div
          v-if="selectedReport"
          class="w-full h-3 rounded-full bg-white/5 overflow-hidden"
        >
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{
              width: selectedReport.score + '%',
              backgroundColor: riskColor(selectedReport.level),
            }"
          ></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-slate-400 mb-3">Répartition des actifs</h3>
            <div class="h-56 flex justify-center items-center" v-if="selectedAssets.length === 0">
              <span class="text-slate-500 text-sm">Aucun actif</span>
            </div>
            <div class="h-56" v-else>
              <Doughnut :data="assetsChartData()" :options="chartOptions" />
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-slate-400 mb-3">Vulnérabilités par criticité</h3>
            <div class="h-56 flex justify-center items-center" v-if="selectedVulnerabilities.length === 0">
              <span class="text-slate-500 text-sm">Aucune vulnérabilité</span>
            </div>
            <div class="h-56" v-else>
              <Bar :data="vulnChartData()" :options="barOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
