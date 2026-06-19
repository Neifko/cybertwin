<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAssetsStore } from '../stores/assets'

const assetsStore = useAssetsStore()
const showModal = ref(false)
const editingId = ref(null)
const filterType = ref('Tous')

const assetTypes = [
  'Serveur Web',
  'Base de données',
  'Poste utilisateur',
  'Routeur',
  'Pare-feu',
  'Application métier',
]

const typeIcons = {
  'Serveur Web': 'ti-server',
  'Base de données': 'ti-database',
  'Poste utilisateur': 'ti-device-desktop',
  'Routeur': 'ti-router',
  'Pare-feu': 'ti-shield',
  'Application métier': 'ti-apps',
}

const form = ref({
  name: '',
  type: assetTypes[0],
  description: '',
  internetExposed: false,
})

onMounted(() => {
  assetsStore.fetchAssets()
})

const filteredAssets = computed(() => {
  if (filterType.value === 'Tous') return assetsStore.assets
  return assetsStore.assets.filter((a) => a.type === filterType.value)
})

function openCreateModal() {
  editingId.value = null
  form.value = { name: '', type: assetTypes[0], description: '', internetExposed: false }
  showModal.value = true
}

function openEditModal(asset) {
  editingId.value = asset.id
  form.value = { ...asset }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveAsset() {
  if (editingId.value) {
    assetsStore.updateAsset(editingId.value, form.value)
  } else {
    assetsStore.addAsset(form.value)
  }
  closeModal()
}

function deleteAsset(id) {
  if (confirm('Supprimer cet actif ?')) {
    assetsStore.deleteAsset(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-display font-bold text-white">
        <i class="ti ti-stack-2 text-cyber-cyan mr-2"></i>Actifs
      </h1>
      <button @click="openCreateModal" class="btn-cyber">
        <i class="ti ti-plus mr-1"></i> Ajouter un actif
      </button>
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap gap-2">
      <button
        @click="filterType = 'Tous'"
        class="px-3 py-1.5 rounded-lg text-sm transition"
        :class="filterType === 'Tous' ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' : 'text-slate-400 border border-white/10 hover:bg-white/5'"
      >
        Tous ({{ assetsStore.totalAssets }})
      </button>
      <button
        v-for="type in assetTypes"
        :key="type"
        @click="filterType = type"
        class="px-3 py-1.5 rounded-lg text-sm transition"
        :class="filterType === type ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' : 'text-slate-400 border border-white/10 hover:bg-white/5'"
      >
        {{ type }} ({{ assetsStore.assetsByType[type] || 0 }})
      </button>
    </div>

    <div v-if="assetsStore.loading" class="panel p-8 text-center text-slate-400">
      Chargement...
    </div>

    <!-- Liste des actifs -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="asset in filteredAssets" :key="asset.id" class="panel p-5 flex flex-col">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <i :class="['ti', typeIcons[asset.type], 'text-cyber-violet text-xl']"></i>
            <span class="text-xs px-2 py-0.5 rounded-full bg-cyber-violet/10 text-cyber-violet border border-cyber-violet/20">
              {{ asset.type }}
            </span>
          </div>
          <span
            v-if="asset.internetExposed"
            class="text-xs px-2 py-0.5 rounded-full bg-risk-high/10 text-risk-high border border-risk-high/20 flex items-center gap-1"
          >
            <i class="ti ti-world"></i> Exposé
          </span>
        </div>

        <h3 class="text-white font-medium mb-1">{{ asset.name }}</h3>
        <p class="text-sm text-slate-500 flex-1">{{ asset.description }}</p>

        <div class="flex gap-2 mt-4 pt-4 border-t border-white/5">
          <button @click="openEditModal(asset)" class="text-sm text-slate-400 hover:text-cyber-cyan transition flex items-center gap-1">
            <i class="ti ti-edit"></i> Modifier
          </button>
          <button @click="deleteAsset(asset.id)" class="text-sm text-slate-400 hover:text-risk-high transition flex items-center gap-1 ml-auto">
            <i class="ti ti-trash"></i> Supprimer
          </button>
        </div>
      </div>

      <div v-if="filteredAssets.length === 0" class="col-span-full text-center text-slate-500 py-10">
        Aucun actif dans cette catégorie.
      </div>
    </div>

    <!-- Modal création / édition -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="closeModal">
      <div class="panel p-6 w-full max-w-md">
        <h2 class="text-xl font-display font-bold text-white mb-4">
          {{ editingId ? 'Modifier l\'actif' : 'Nouvel actif' }}
        </h2>

        <form @submit.prevent="saveAsset" class="space-y-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Nom</label>
            <input v-model="form.name" type="text" class="input-cyber" required />
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-1">Type</label>
            <select v-model="form.type" class="input-cyber">
              <option v-for="type in assetTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="input-cyber resize-none"></textarea>
          </div>

          <label class="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input v-model="form.internetExposed" type="checkbox" class="accent-cyan-400 w-4 h-4" />
            Exposé sur Internet
          </label>

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