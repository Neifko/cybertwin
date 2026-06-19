<script setup>
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '../stores/company'

const companyStore = useCompanyStore()
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
  await companyStore.fetchCompany()
  resetForm()
})

function resetForm() {
  if (companyStore.company) {
    form.value = { ...companyStore.company, exposedServices: [...companyStore.company.exposedServices] }
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

function saveChanges() {
  companyStore.updateCompany(form.value)
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
      <h1 class="text-2xl font-display font-bold text-white">
        <i class="ti ti-building text-cyber-cyan mr-2"></i>Entreprise
      </h1>
      <button v-if="!isEditing" @click="startEdit" class="btn-cyber">
        <i class="ti ti-edit mr-1"></i> Modifier
      </button>
    </div>

    <div v-if="companyStore.loading" class="panel p-8 text-center text-slate-400">
      Chargement...
    </div>

    <div v-else-if="companyStore.company" class="panel p-8">
      <!-- Mode lecture -->
      <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p class="text-sm text-slate-500 mb-1">Nom de l'entreprise</p>
          <p class="text-lg text-white font-medium">{{ companyStore.company.name }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Secteur d'activité</p>
          <p class="text-lg text-white font-medium">{{ companyStore.company.sector }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Employés</p>
          <p class="text-lg text-white font-medium">{{ companyStore.company.employeesCount }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Serveurs</p>
          <p class="text-lg text-white font-medium">{{ companyStore.company.serversCount }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500 mb-1">Postes clients</p>
          <p class="text-lg text-white font-medium">{{ companyStore.company.clientWorkstationsCount }}</p>
        </div>
        <div class="md:col-span-2">
          <p class="text-sm text-slate-500 mb-2">Services exposés sur Internet</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="service in companyStore.company.exposedServices"
              :key="service"
              class="px-3 py-1 rounded-full text-sm bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20"
            >
              {{ service }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mode édition -->
      <form v-else @submit.prevent="saveChanges" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Nom de l'entreprise</label>
            <input v-model="form.name" type="text" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Secteur d'activité</label>
            <input v-model="form.sector" type="text" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Nombre d'employés</label>
            <input v-model.number="form.employeesCount" type="number" min="0" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Nombre de serveurs</label>
            <input v-model.number="form.serversCount" type="number" min="0" class="input-cyber" required />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Postes clients</label>
            <input v-model.number="form.clientWorkstationsCount" type="number" min="0" class="input-cyber" required />
          </div>
        </div>

        <div>
          <label class="block text-sm text-slate-400 mb-2">Services exposés sur Internet</label>
          <div class="flex gap-2 mb-3">
            <input
              v-model="newService"
              type="text"
              placeholder="Ex: API publique"
              class="input-cyber flex-1"
              @keyup.enter.prevent="addService"
            />
            <button type="button" @click="addService" class="btn-cyber px-3">
              <i class="ti ti-plus"></i>
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(service, index) in form.exposedServices"
              :key="index"
              class="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20"
            >
              {{ service }}
              <button type="button" @click="removeService(index)" class="hover:text-white">
                <i class="ti ti-x text-xs"></i>
              </button>
            </span>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" class="btn-cyber">
            <i class="ti ti-check mr-1"></i> Enregistrer
          </button>
          <button type="button" @click="cancelEdit" class="px-4 py-2 rounded-lg text-slate-400 border border-white/10 hover:bg-white/5 transition">
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
</template>