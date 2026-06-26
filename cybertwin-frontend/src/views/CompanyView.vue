<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCompanyStore } from '../stores/company'
import { useAuth0 } from '@auth0/auth0-vue'

const companyStore = useCompanyStore()
const { getAccessTokenSilently } = useAuth0()

const isEditing = ref(false)
const isCreating = ref(false)
const form = ref(emptyForm())
const newService = ref('')

function emptyForm() {
  return {
    id: null,
    name: '',
    sector: '',
    employeesCount: 0,
    serversCount: 0,
    clientWorkstationsCount: 0,
    exposedServices: [],
  }
}

onMounted(async () => {
  const token = await getAccessTokenSilently()
  await companyStore.fetchCompanies(token)
})

watch(
  () => companyStore.selectedCompanyId,
  () => {
    if (!isEditing.value && !isCreating.value) {
      resetForm()
    }
  },
)

function resetForm() {
  if (companyStore.selectedCompany) {
    form.value = {
      ...companyStore.selectedCompany,
      exposedServices: [...companyStore.selectedCompany.exposedServices],
    }
  } else {
    form.value = emptyForm()
  }
}

function selectCompany(id) {
  companyStore.selectCompany(id)
  isEditing.value = false
  isCreating.value = false
  resetForm()
}

function startCreate() {
  form.value = emptyForm()
  isCreating.value = true
  isEditing.value = true
}

function startEdit() {
  resetForm()
  isCreating.value = false
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  isCreating.value = false
  resetForm()
}

async function saveChanges() {
  const token = await getAccessTokenSilently()

  try {
    if (isCreating.value) {
      await companyStore.createCompany(form.value, token)
    } else {
      await companyStore.updateCompany(form.value, token)
    }
    isEditing.value = false
    isCreating.value = false
  } catch (error) {
    alert(error.message)
  }
}

async function deleteCompany(id) {
  if (
    !confirm(
      'Supprimer cette entreprise ? Tous ses actifs et vulnérabilités seront également supprimés.',
    )
  ) {
    return
  }

  const token = await getAccessTokenSilently()
  await companyStore.deleteCompany(id, token)
  isEditing.value = false
  isCreating.value = false
  resetForm()
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
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-display font-bold text-slate-800">
        <i class="ti ti-building text-blue-600 mr-2"></i>Entreprises
      </h1>
      <button @click="startCreate" class="btn-cyber">
        <i class="ti ti-plus mr-1"></i> Ajouter une entreprise
      </button>
    </div>

    <div v-if="companyStore.loading" class="panel p-8 text-center text-slate-500">
      Chargement...
    </div>

    <div v-else-if="companyStore.companies.length === 0 && !isCreating" class="panel p-10 text-center flex flex-col items-center justify-center">
      <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <i class="ti ti-building text-4xl text-blue-600"></i>
      </div>
      <h2 class="text-2xl font-display font-bold text-slate-800 mb-2">Aucune entreprise</h2>
      <p class="text-slate-500 mb-8 max-w-md">
        Créez une ou plusieurs entreprises fictives pour simuler leur niveau de risque cyber.
      </p>
      <button @click="startCreate" class="btn-cyber text-lg px-6 py-3">
        <i class="ti ti-plus mr-2"></i> Créer ma première entreprise
      </button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="panel p-4 space-y-2">
        <h2 class="text-sm font-medium text-slate-500 px-2 mb-3">Mes entreprises</h2>
        <button
          v-for="company in companyStore.companies"
          :key="company.id"
          @click="selectCompany(company.id)"
          class="w-full text-left px-4 py-3 rounded-xl transition border"
          :class="companyStore.selectedCompanyId === company.id
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'border-transparent hover:bg-slate-50 text-slate-700'"
        >
          <p class="font-medium">{{ company.name }}</p>
          <p class="text-xs text-slate-500 mt-0.5">{{ company.sector }}</p>
        </button>
      </div>

      <div class="lg:col-span-2 panel p-8">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 class="text-xl font-display font-bold text-slate-800">
            {{ isCreating ? 'Nouvelle entreprise' : companyStore.selectedCompany?.name }}
          </h2>
          <div v-if="!isEditing && companyStore.selectedCompany" class="flex gap-2">
            <button @click="startEdit" class="btn-cyber">
              <i class="ti ti-edit mr-1"></i> Modifier
            </button>
            <button
              @click="deleteCompany(companyStore.selectedCompany.id)"
              class="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition font-medium"
            >
              <i class="ti ti-trash mr-1"></i> Supprimer
            </button>
          </div>
        </div>

        <div v-if="!isEditing && companyStore.selectedCompany" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-slate-500 mb-1">Nom de l'entreprise</p>
            <p class="text-lg text-slate-900 font-medium">{{ companyStore.selectedCompany.name }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 mb-1">Secteur d'activité</p>
            <p class="text-lg text-slate-900 font-medium">{{ companyStore.selectedCompany.sector }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 mb-1">Employés</p>
            <p class="text-lg text-slate-900 font-medium">{{ companyStore.selectedCompany.employeesCount }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 mb-1">Serveurs</p>
            <p class="text-lg text-slate-900 font-medium">{{ companyStore.selectedCompany.serversCount }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 mb-1">Postes clients</p>
            <p class="text-lg text-slate-900 font-medium">{{ companyStore.selectedCompany.clientWorkstationsCount }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm text-slate-500 mb-2">Services exposés sur Internet</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="service in companyStore.selectedCompany.exposedServices"
                :key="service"
                class="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 border border-blue-200"
              >
                {{ service }}
              </span>
              <span v-if="companyStore.selectedCompany.exposedServices.length === 0" class="text-sm text-slate-400 italic">
                Aucun service exposé
              </span>
            </div>
          </div>
        </div>

        <form v-else-if="isEditing" @submit.prevent="saveChanges" class="space-y-5">
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
            <button type="button" @click="cancelEdit" class="px-4 py-2 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
