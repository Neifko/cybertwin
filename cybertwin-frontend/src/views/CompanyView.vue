<script setup>
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '../stores/company'
import { useAuth0 } from '@auth0/auth0-vue'

const companyStore = useCompanyStore()
const { getAccessTokenSilently } = useAuth0()
const isEditing = ref(false)
const form = ref({
  name: '',
  sector: '',
  employeesCount: 0,
  serversCount: 0,
  clientWorkstationsCount: 0,
  exposedServices: [],
})
const newService = ref('')

onMounted(async () => {
  const token = await getAccessTokenSilently()
  await companyStore.fetchCompany(token)
  resetForm()
})

function resetForm() {
  if (companyStore.company) {
    form.value = { ...companyStore.company, exposedServices: [...companyStore.company.exposedServices] }
  } else {
    form.value = {
      name: '',
      sector: '',
      employeesCount: 0,
      serversCount: 0,
      clientWorkstationsCount: 0,
      exposedServices: [],
    }
  }
}

function startEdit() {
  resetForm()
  isEditing.value = true
}

function cancelEdit() {
  resetForm()
  isEditing.value = false
}

async function saveChanges() {
  const token = await getAccessTokenSilently()
  await companyStore.updateCompany(form.value, token)
  isEditing.value = false
}

function addService() {
  if (newService.value.trim()) {
    form.value.exposedServices.push(newService.value.trim())
    newService.value = ''
  }
}

function removeService(index) {
  form.value.exposedServices.splice(index, 1)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-display font-bold text-slate-800">
        <i class="ti ti-building text-blue-600 mr-2"></i>Entreprise
      </h1>
      <button v-if="!isEditing && companyStore.company" @click="startEdit" class="btn-cyber">
        <i class="ti ti-edit mr-1"></i> Modifier
      </button>
    </div>

    <div v-if="companyStore.loading" class="panel p-8 text-center text-slate-500">
      Chargement...
    </div>

    <div v-else-if="companyStore.company || isEditing" class="panel p-8">
      
      <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p class="text-sm text-slate-500 mb-1">Nom de l'entreprise</p>
          <p class="text-lg text-slate-900 font-medium">{{ companyStore.company.name }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Secteur d'activité</p>
          <p class="text-lg text-slate-900 font-medium">{{ companyStore.company.sector }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Employés</p>
          <p class="text-lg text-slate-900 font-medium">{{ companyStore.company.employeesCount }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Serveurs</p>
          <p class="text-lg text-slate-900 font-medium">{{ companyStore.company.serversCount }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Postes clients</p>
          <p class="text-lg text-slate-900 font-medium">{{ companyStore.company.clientWorkstationsCount }}</p>
        </div>
        <div class="md:col-span-2">
          <p class="text-sm text-slate-500 mb-2">Services exposés sur Internet</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="service in companyStore.company.exposedServices"
              :key="service"
              class="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 border border-blue-200"
            >
              {{ service }}
            </span>
            <span v-if="!companyStore.company.exposedServices || companyStore.company.exposedServices.length === 0" class="text-sm text-slate-400 italic">
              Aucun service exposé
            </span>
          </div>
        </div>
      </div>

      <form v-else @submit.prevent="saveChanges" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Nom de l'entreprise</label>
            <input v-model="form.name" type="text" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Secteur d'activité</label>
            <input v-model="form.sector" type="text" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Nombre d'employés</label>
            <input v-model.number="form.employeesCount" type="number" min="0" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Nombre de serveurs</label>
            <input v-model.number="form.serversCount" type="number" min="0" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Postes clients</label>
            <input v-model.number="form.clientWorkstationsCount" type="number" min="0" class="input-cyber" required />
          </div>
        </div>

        <div>
          <label class="block text-sm text-slate-600 mb-2">Services exposés sur Internet</label>
          <div class="flex gap-2 mb-3">
            <input
              v-model="newService"
              type="text"
              placeholder="Ex: API publique, Site vitrine..."
              class="input-cyber flex-1"
              @keyup.enter.prevent="addService"
            />
            <button type="button" @click="addService" class="btn-cyber px-4">
              <i class="ti ti-plus"></i> Ajouter
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(service, index) in form.exposedServices"
              :key="index"
              class="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 border border-blue-200"
            >
              {{ service }}
              <button type="button" @click="removeService(index)" class="hover:text-red-500 ml-1 transition">
                <i class="ti ti-x text-xs"></i>
              </button>
            </span>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100">
          <button type="submit" class="btn-cyber">
            <i class="ti ti-check mr-1"></i> Enregistrer
          </button>
          <button v-if="companyStore.company" type="button" @click="cancelEdit" class="px-4 py-2 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
            Annuler
          </button>
        </div>
      </form>
    </div>

    <div v-else class="panel p-10 text-center flex flex-col items-center justify-center">
      <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <i class="ti ti-building text-4xl text-blue-600"></i>
      </div>
      <h2 class="text-2xl font-display font-bold text-slate-800 mb-2">Aucune entreprise configurée</h2>
      <p class="text-slate-500 mb-8 max-w-md">
        Pour commencer l'analyse de risque cyber, vous devez d'abord créer le profil de votre entreprise fictive.
      </p>
      <button @click="startEdit" class="btn-cyber text-lg px-6 py-3">
        <i class="ti ti-plus mr-2"></i> Configurer mon entreprise
      </button>
    </div>

  </div>
</template>