<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAssetsStore } from '../stores/assets'
import { useVulnerabilitiesStore } from '../stores/vulnerabilities'
import { useRiskStore } from '../stores/risk'
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

const assetsStore = useAssetsStore()
const vulnStore = useVulnerabilitiesStore()
const riskStore = useRiskStore()

onMounted(async () => {
  await Promise.all([assetsStore.fetchAssets(), vulnStore.fetchVulnerabilities()])
  riskStore.calculateRisk()
})

const riskColors = {
  faible: '#34d399',
  moyen: '#fbbf24',
  élevé: '#f87171',
}

const riskColor = computed(() => riskColors[riskStore.level] || '#94a3b8')

const assetsChartData = computed(() => {
  const data = assetsStore.assetsByType
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
})

const vulnChartData = computed(() => {
  const data = vulnStore.byCriticality
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

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="panel p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Actifs totaux</span>
          <i class="ti ti-stack-2 text-cyber-violet"></i>
        </div>
        <p class="text-3xl font-display font-bold text-white">{{ assetsStore.totalAssets }}</p>
      </div>

      <div class="panel p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Vulnérabilités</span>
          <i class="ti ti-bug text-cyber-pink"></i>
        </div>
        <p class="text-3xl font-display font-bold text-white">{{ vulnStore.totalVulnerabilities }}</p>
      </div>

      <div class="panel p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Actifs exposés</span>
          <i class="ti ti-world text-risk-high"></i>
        </div>
        <p class="text-3xl font-display font-bold text-white">
          {{ assetsStore.assets.filter(a => a.internetExposed).length }}
        </p>
      </div>

      <div class="panel p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Score de risque</span>
          <i class="ti ti-alert-triangle" :style="{ color: riskColor }"></i>
        </div>
        <p class="text-3xl font-display font-bold" :style="{ color: riskColor }">
          {{ riskStore.score }}<span class="text-base text-slate-500">/100</span>
        </p>
      </div>
    </div>

    <!-- Score de risque global -->
    <div class="panel p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-display font-bold text-white">Niveau de risque global</h2>
        <span
          class="px-3 py-1 rounded-full text-sm capitalize border"
          :style="{ color: riskColor, borderColor: riskColor + '40', backgroundColor: riskColor + '15' }"
        >
          {{ riskStore.level }}
        </span>
      </div>
      <div class="w-full h-3 rounded-full bg-white/5 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{ width: riskStore.score + '%', backgroundColor: riskColor }"
        ></div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="panel p-6">
        <h2 class="text-lg font-display font-bold text-white mb-4">Répartition des actifs</h2>
        <div class="h-64">
          <Doughnut :data="assetsChartData" :options="chartOptions" />
        </div>
      </div>

      <div class="panel p-6">
        <h2 class="text-lg font-display font-bold text-white mb-4">Vulnérabilités par criticité</h2>
        <div class="h-64">
          <Bar :data="vulnChartData" :options="barOptions" />
        </div>
      </div>
    </div>
  </div>
</template>