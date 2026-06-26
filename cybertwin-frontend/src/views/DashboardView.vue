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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const companyStore = useCompanyStore()
const assetsStore = useAssetsStore()
const vulnStore = useVulnerabilitiesStore()
const riskStore = useRiskStore()
const { getAccessTokenSilently } = useAuth0()

const isLoading = ref(true)

const riskColors = {
  faible: '#34d399',
  moyen: '#fbbf24',
  élevé: '#f87171',
}

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

function riskColor(level) {
  return riskColors[level] || '#94a3b8'
}

function companyAssets(companyId) {
  return assetsStore.assets.filter(
    (asset) => String(asset.companyId) === String(companyId),
  )
}

function companyVulnerabilities(companyId) {
  return vulnStore.vulnerabilities.filter(
    (vuln) => String(vuln.companyId) === String(companyId),
  )
}

function assetsChartData(companyId) {
  const data = companyAssets(companyId).reduce((acc, asset) => {
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

function vulnChartData(companyId) {
  const data = companyVulnerabilities(companyId).reduce((acc, vuln) => {
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

const globalSummary = computed(() => {
  const reports = riskStore.reports
  return {
    companies: reports.length,
    assets: reports.reduce((sum, r) => sum + (r.metrics?.totalAssets || 0), 0),
    vulnerabilities: reports.reduce(
      (sum, r) => sum + (r.metrics?.totalVulnerabilities || 0),
      0,
    ),
    averageScore:
      reports.length > 0
        ? Math.round(
            reports.reduce((sum, r) => sum + r.score, 0) / reports.length,
          )
        : 0,
  }
})

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
    <h1 class="text-2xl font-display font-bold text-white">
      <i class="ti ti-layout-dashboard text-cyber-cyan mr-2"></i>Tableau de bord
    </h1>

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
            <span class="text-sm text-slate-500">Entreprises</span>
            <i class="ti ti-building text-cyber-cyan"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">{{ globalSummary.companies }}</p>
        </div>
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500">Actifs totaux</span>
            <i class="ti ti-stack-2 text-cyber-violet"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">{{ globalSummary.assets }}</p>
        </div>
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500">Vulnérabilités</span>
            <i class="ti ti-bug text-cyber-pink"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">{{ globalSummary.vulnerabilities }}</p>
        </div>
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500">Score moyen</span>
            <i class="ti ti-alert-triangle text-risk-high"></i>
          </div>
          <p class="text-3xl font-display font-bold text-white">
            {{ globalSummary.averageScore }}<span class="text-base text-slate-500">/100</span>
          </p>
        </div>
      </div>

      <div
        v-for="company in companyStore.companies"
        :key="company.id"
        class="panel p-6 space-y-6"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 class="text-xl font-display font-bold text-white">{{ company.name }}</h2>
            <p class="text-sm text-slate-500">{{ company.sector }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              v-if="riskStore.reportByCompanyId(company.id)"
              class="px-3 py-1 rounded-full text-sm capitalize border"
              :style="{
                color: riskColor(riskStore.reportByCompanyId(company.id).level),
                borderColor: riskColor(riskStore.reportByCompanyId(company.id).level) + '40',
                backgroundColor: riskColor(riskStore.reportByCompanyId(company.id).level) + '15',
              }"
            >
              {{ riskStore.reportByCompanyId(company.id).level }}
            </span>
            <p
              v-if="riskStore.reportByCompanyId(company.id)"
              class="text-2xl font-display font-bold"
              :style="{ color: riskColor(riskStore.reportByCompanyId(company.id).level) }"
            >
              {{ riskStore.reportByCompanyId(company.id).score }}<span class="text-sm text-slate-500">/100</span>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-500">Actifs</p>
            <p class="text-2xl font-bold text-white">{{ companyAssets(company.id).length }}</p>
          </div>
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-500">Vulnérabilités</p>
            <p class="text-2xl font-bold text-white">{{ companyVulnerabilities(company.id).length }}</p>
          </div>
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-500">Actifs exposés</p>
            <p class="text-2xl font-bold text-white">
              {{ companyAssets(company.id).filter((a) => a.internetExposed).length }}
            </p>
          </div>
        </div>

        <div
          v-if="riskStore.reportByCompanyId(company.id)"
          class="w-full h-3 rounded-full bg-white/5 overflow-hidden"
        >
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{
              width: riskStore.reportByCompanyId(company.id).score + '%',
              backgroundColor: riskColor(riskStore.reportByCompanyId(company.id).level),
            }"
          ></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-slate-400 mb-3">Répartition des actifs</h3>
            <div class="h-56 flex justify-center items-center" v-if="companyAssets(company.id).length === 0">
              <span class="text-slate-500 text-sm">Aucun actif</span>
            </div>
            <div class="h-56" v-else>
              <Doughnut :data="assetsChartData(company.id)" :options="chartOptions" />
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-slate-400 mb-3">Vulnérabilités par criticité</h3>
            <div class="h-56 flex justify-center items-center" v-if="companyVulnerabilities(company.id).length === 0">
              <span class="text-slate-500 text-sm">Aucune vulnérabilité</span>
            </div>
            <div class="h-56" v-else>
              <Bar :data="vulnChartData(company.id)" :options="barOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
