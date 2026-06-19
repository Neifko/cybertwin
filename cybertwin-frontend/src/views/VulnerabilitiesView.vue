<script setup>
import { ref, onMounted, computed } from 'vue'
import { useVulnerabilitiesStore } from '../stores/vulnerabilities'
import { useAssetsStore } from '../stores/assets'

const vulnStore = useVulnerabilitiesStore()
const assetsStore = useAssetsStore()

const showModal = ref(false)
const filterCriticality = ref('Toutes')

const criticalityLevels = ['faible', 'moyenne', 'élevée']

const criticalityStyles = {
  faible: 'bg-risk-low/10 text-risk-low border-risk-low/20',
  moyenne: 'bg-risk-medium/10 text-risk-medium border-risk-medium/20',
  élevée: 'bg-risk-high/10 text-risk-high border-risk-high/20',
}

const commonVulnNames = [
  'Logiciel obsolète',
  'Mot de passe faible',
  'Port exposé',
  'Absence de sauvegarde',
]

const form = ref({
  assetId: null,
  name: commonVulnNames[0],
  description: '',
  criticality: 'moyenne',
})

onMounted(() => {
  vulnStore.fetchVulnerabilities()
  assetsStore.fetchAssets()
})

const filteredVulns = computed(() => {
  if (filterCriticality.value === 'Toutes') return vulnStore.vulnerabilities
  return vulnStore.vulnerabilities.filter((v) => v.criticality === filterCriticality.value)
})

function assetName(assetId) {
  const asset = assetsStore.assets.find((a) => a.id === assetId)
  return asset ? asset.name : 'Actif inconnu'
}

function assetType(assetId) {
  const asset = assetsStore.assets.find((a) => a.id === assetId)
  return asset ? asset.type : ''
}

function openCreateModal() {
  form.value = {
    assetId: assetsStore.assets[0]?.id ?? null,
    name: commonVulnNames[0],
    description: '',
    criticality: 'moyenne',
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveVulnerability() {
  vulnStore.addVulnerability(form.value)
  closeModal()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-display font-bold text-white">
        <i class="ti ti-bug text-cyber-cyan mr-2"></i>Vulnérabilités
      </h1>
      <button @click="openCreateModal" class="btn-cyber" :disabled="assetsStore.assets.length === 0">
        <i class="ti ti-plus mr-1"></i> Associer une vulnérabilité
      </button>
    </div>

    <!-- Filtres criticité -->
    <div class="flex flex-wrap gap-2">
      <button
        @click="filterCriticality = 'Toutes'"
        class="px-3 py-1.5 rounded-lg text-sm transition"
        :class="filterCriticality === 'Toutes' ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' : 'text-slate-400 border border-white/10 hover:bg-white/5'"
      >
        Toutes ({{ vulnStore.totalVulnerabilities }})
      </button>
      <button
        v-for="level in criticalityLevels"
        :key="level"
        @click="filterCriticality = level"
        class="px-3 py-1.5 rounded-lg text-sm capitalize transition"
        :class="filterCriticality === level ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' : 'text-slate-400 border border-white/10 hover:bg-white/5'"
      >
        {{ level }} ({{ vulnStore.byCriticality[level] || 0 }})
      </button>
    </div>

    <div v-if="vulnStore.loading" class="panel p-8 text-center text-slate-400">
      Chargement...
    </div>

    <!-- Tableau des vulnérabilités -->
    <div v-else class="panel overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/5 text-left text-slate-500">
            <th class="px-5 py-3 font-medium">Vulnérabilité</th>
            <th class="px-5 py-3 font-medium">Actif concerné</th>
            <th class="px-5 py-3 font-medium">Description</th>
            <th class="px-5 py-3 font-medium">Criticité</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="vuln in filteredVulns"
            :key="vuln.id"
            class="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition"
          >
            <td class="px-5 py-4 text-white font-medium">{{ vuln.name }}</td>
            <td class="px-5 py-4 text-slate-400">
              <div class="flex items-center gap-1.5">
                <i class="ti ti-stack-2 text-cyber-violet"></i>
                {{ assetName(vuln.assetId) }}
              </div>
              <span class="text-xs text-slate-600">{{ assetType(vuln.assetId) }}</span>
            </td>
            <td class="px-5 py-4 text-slate-400">{{ vuln.description }}</td>
            <td class="px-5 py-4">
              <span :class="['px-2.5 py-1 rounded-full text-xs capitalize border', criticalityStyles[vuln.criticality]]">
                {{ vuln.criticality }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredVulns.length === 0" class="text-center text-slate-500 py-10">
        Aucune vulnérabilité dans cette catégorie.
      </div>
    </div>

    <!-- Modal association vulnérabilité -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="closeModal">
      <div class="panel p-6 w-full max-w-md">
        <h2 class="text-xl font-display font-bold text-white mb-4">Nouvelle vulnérabilité</h2>

        <form @submit.prevent="saveVulnerability" class="space-y-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Actif concerné</label>
            <select v-model="form.assetId" class="input-cyber" required>
              <option v-for="asset in assetsStore.assets" :key="asset.id" :value="asset.id">
                {{ asset.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-1">Type de vulnérabilité</label>
            <select v-model="form.name" class="input-cyber">
              <option v-for="name in commonVulnNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="input-cyber resize-none" placeholder="Détails sur la vulnérabilité..."></textarea>
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-2">Niveau de criticité</label>
            <div class="flex gap-2">
              <button
                v-for="level in criticalityLevels"
                :key="level"
                type="button"
                @click="form.criticality = level"
                class="flex-1 px-3 py-2 rounded-lg text-sm capitalize border transition"
                :class="form.criticality === level ? criticalityStyles[level] : 'text-slate-500 border-white/10 hover:bg-white/5'"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-cyber">
              <i class="ti ti-check mr-1"></i> Enregistrer
            </button>
            <button type="button" @click="closeModal" class="px-4 py-2 rounded-lg text-slate-400 border border-white/10 hover:bg-white/5 transition">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>