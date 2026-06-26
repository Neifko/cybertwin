<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAssetsStore } from '../stores/assets'
import { useCompanyStore } from '../stores/company'
import { useAuth0 } from '@auth0/auth0-vue'

const assetsStore = useAssetsStore()
const companyStore = useCompanyStore()
const { getAccessTokenSilently } = useAuth0()

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

onMounted(async () => {
  const token = await getAccessTokenSilently()
  await Promise.all([
    assetsStore.fetchAssets(token),
    companyStore.fetchCompany(token) 
  ])
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

async function saveAsset() {
  const token = await getAccessTokenSilently()
  
  if (editingId.value) {
    await assetsStore.updateAsset(editingId.value, form.value, token)
  } else {
    await assetsStore.addAsset(form.value, token)
  }
  closeModal()
}

async function deleteAsset(id) {
  if (confirm('Supprimer cet actif ?')) {
    const token = await getAccessTokenSilently()
    await assetsStore.deleteAsset(id, token)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-display font-bold text-slate-800">
        <i class="ti ti-stack-2 text-blue-600 mr-2"></i>Actifs
      </h1>
      <button @click="openCreateModal" class="btn-cyber">
        <i class="ti ti-plus mr-1"></i> Ajouter un actif
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        @click="filterType = 'Tous'"
        class="px-4 py-1.5 rounded-lg text-sm transition font-medium"
        :class="filterType === 'Tous' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'"
      >
        Tous ({{ assetsStore.totalAssets }})
      </button>
      <button
        v-for="type in assetTypes"
        :key="type"
        @click="filterType = type"
        class="px-4 py-1.5 rounded-lg text-sm transition font-medium"
        :class="filterType === type ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'"
      >
        {{ type }} ({{ assetsStore.assetsByType[type] || 0 }})
      </button>
    </div>

    <div v-if="assetsStore.loading || companyStore.loading" class="panel p-8 text-center text-slate-500">
      Chargement...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="asset in filteredAssets" :key="asset.id" class="panel p-5 flex flex-col bg-white">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <i :class="['ti', typeIcons[asset.type], 'text-blue-500 text-xl']"></i>
            <span class="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              {{ asset.type }}
            </span>
          </div>
          <span
            v-if="asset.internetExposed"
            class="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center gap-1 font-medium"
          >
            <i class="ti ti-world"></i> Exposé
          </span>
        </div>

        <h3 class="text-slate-900 font-bold mb-1">{{ asset.name }}</h3>
        <p class="text-sm text-slate-500 flex-1">{{ asset.description }}</p>

        <div class="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <button @click="openEditModal(asset)" class="text-sm text-slate-500 hover:text-blue-600 transition flex items-center gap-1 font-medium">
            <i class="ti ti-edit"></i> Modifier
          </button>
          <button @click="deleteAsset(asset.id)" class="text-sm text-slate-500 hover:text-red-500 transition flex items-center gap-1 ml-auto font-medium">
            <i class="ti ti-trash"></i> Supprimer
          </button>
        </div>
      </div>

      <div v-if="filteredAssets.length === 0" class="col-span-full text-center text-slate-500 py-10">
        <i class="ti ti-server-off text-4xl text-slate-300 block mb-2"></i>
        Aucun actif dans cette catégorie.
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" @click.self="closeModal">
      <div class="panel p-6 w-full max-w-md bg-white shadow-2xl rounded-2xl">
        <h2 class="text-xl font-display font-bold text-slate-800 mb-4">
          {{ editingId ? 'Modifier l\'actif' : 'Nouvel actif' }}
        </h2>

        <form @submit.prevent="saveAsset" class="space-y-4">
          <div>
            <label class="block text-sm text-slate-600 mb-1 font-medium">Nom</label>
            <input v-model="form.name" type="text" class="input-cyber" required placeholder="Ex: Serveur Web Principal" />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1 font-medium">Type</label>
            <select v-model="form.type" class="input-cyber">
              <option v-for="type in assetTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1 font-medium">Description</label>
            <textarea v-model="form.description" rows="3" class="input-cyber resize-none" placeholder="Détails sur l'actif..."></textarea>
          </div>

          <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer font-medium p-2 hover:bg-slate-50 rounded-lg transition">
            <input v-model="form.internetExposed" type="checkbox" class="accent-blue-600 w-4 h-4 rounded" />
            Exposé sur Internet (Accessible publiquement)
          </label>

          <div class="flex gap-3 pt-4 border-t border-slate-100">
            <button type="submit" class="btn-cyber w-full justify-center">
              <i class="ti ti-check mr-1"></i> Enregistrer
            </button>
            <button type="button" @click="closeModal" class="w-full px-4 py-2 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 transition font-medium">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>