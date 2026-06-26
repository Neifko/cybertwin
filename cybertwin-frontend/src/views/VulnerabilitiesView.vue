<script setup>
import { onMounted, computed } from 'vue'
import { useVulnerabilitiesStore } from '../stores/vulnerabilities'
import { useAssetsStore } from '../stores/assets'
import { useCompanyStore } from '../stores/company'
import { useAuth0 } from '@auth0/auth0-vue'

const vulnStore = useVulnerabilitiesStore()
const assetsStore = useAssetsStore()
const companyStore = useCompanyStore()
const { getAccessTokenSilently } = useAuth0()

onMounted(async () => {
  const token = await getAccessTokenSilently()
  await companyStore.fetchCompanies(token)
  await Promise.all([
    vulnStore.fetchVulnerabilities(token, companyStore.selectedCompanyId),
    assetsStore.fetchAssets(token, companyStore.selectedCompanyId),
  ])
})

async function onCompanyChange(event) {
  const companyId = Number(event.target.value)
  companyStore.selectCompany(companyId)
  const token = await getAccessTokenSilently()
  await Promise.all([
    vulnStore.fetchVulnerabilities(token, companyId),
    assetsStore.fetchAssets(token, companyId),
  ])
}

function assetName(assetId) {
  const asset = assetsStore.assets.find((a) => a.id === assetId)
  return asset ? asset.name : 'Actif inconnu'
}

function assetType(assetId) {
  const asset = assetsStore.assets.find((a) => a.id === assetId)
  return asset ? asset.type : ''
}

const criticalityStyles = {
  faible: 'bg-green-50 text-green-600 border-green-200',
  moyenne: 'bg-amber-50 text-amber-600 border-amber-200',
  élevée: 'bg-red-50 text-red-600 border-red-200',
}

async function triggerAudit() {
  const token = await getAccessTokenSilently()
  await vulnStore.runAudit(token)
}

async function clearAudit() {
  if (confirm("Voulez-vous supprimer toutes les vulnérabilités générées ?")) {
    const token = await getAccessTokenSilently()
    await vulnStore.clearAllVulnerabilities(token)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div>
        <h1 class="text-2xl font-display font-bold text-slate-800 mb-1">
          <i class="ti ti-radar text-blue-600 mr-2"></i>Scanner de Vulnérabilités
        </h1>
        <p class="text-sm text-slate-500">
          Analysez les actifs de
          <span class="font-medium text-slate-700">{{ companyStore.selectedCompany?.name || '—' }}</span>
          ({{ assetsStore.totalAssets }}) pour détecter automatiquement les failles de sécurité.
        </p>
      </div>

      <div class="flex gap-2 flex-wrap items-center">
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
        <button 
          @click="clearAudit" 
          v-if="vulnStore.vulnerabilitiesForSelectedCompany.length > 0"
          class="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium transition flex items-center gap-2"
        >
          <i class="ti ti-trash"></i> Vider
        </button>
        <button 
          @click="triggerAudit" 
          :disabled="assetsStore.totalAssets === 0 || vulnStore.loading || !companyStore.selectedCompanyId"
          class="btn-cyber"
        >
          <i :class="vulnStore.loading ? 'ti ti-loader animate-spin' : 'ti ti-scan'"></i>
          {{ vulnStore.loading ? 'Analyse en cours...' : 'Lancer l\'audit' }}
        </button>
      </div>
    </div>

    <div v-if="vulnStore.loading || assetsStore.loading" class="panel p-10 flex flex-col items-center justify-center text-slate-500">
      <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p class="font-medium">Exécution des routines de détection...</p>
    </div>

    <div v-else class="panel overflow-hidden">
      <div class="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 class="font-medium text-slate-700">Résultats de la dernière analyse</h2>
        <span class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
          {{ vulnStore.totalVulnerabilities }} faille(s) détectée(s)
        </span>
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 text-left text-slate-500">
            <th class="px-5 py-3 font-medium">Vulnérabilité</th>
            <th class="px-5 py-3 font-medium">Actif impacté</th>
            <th class="px-5 py-3 font-medium">Description</th>
            <th class="px-5 py-3 font-medium">Criticité</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="vuln in vulnStore.vulnerabilitiesForSelectedCompany"
            :key="vuln.id"
            class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
          >
            <td class="px-5 py-4 text-slate-900 font-medium">{{ vuln.name }}</td>
            <td class="px-5 py-4 text-slate-600">
              <div class="flex items-center gap-1.5 font-medium text-slate-800">
                <i class="ti ti-stack-2 text-blue-500"></i>
                {{ assetName(vuln.assetId || vuln.asset_id) }}
              </div>
              <span class="text-xs text-slate-500 ml-5">{{ assetType(vuln.assetId || vuln.asset_id) }}</span>
            </td>
            <td class="px-5 py-4 text-slate-600">{{ vuln.description }}</td>
            <td class="px-5 py-4">
              <span :class="['px-2.5 py-1 rounded-full text-xs capitalize border font-medium whitespace-nowrap', criticalityStyles[vuln.criticality || vuln.severity]]">
                {{ vuln.criticality || vuln.severity }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="vulnStore.vulnerabilitiesForSelectedCompany.length === 0" class="text-center text-slate-500 py-12">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="ti ti-shield-check text-3xl text-green-500"></i>
        </div>
        <p class="font-medium text-slate-700">Aucune vulnérabilité détectée</p>
        <p class="text-sm mt-1">Vos actifs semblent sécurisés, ou l'audit n'a pas encore été lancé.</p>
      </div>
    </div>
  </div>
</template>