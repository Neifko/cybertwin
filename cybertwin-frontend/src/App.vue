<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0()

const isUserMenuOpen = ref(false)

function handleLogin() {
  loginWithRedirect()
}

function handleLogout() {
  logout({ logoutParams: { returnTo: window.location.origin } })
}

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Écran de chargement Auth0 -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Écran de Connexion (Non authentifié) -->
    <div v-else-if="!isAuthenticated" class="min-h-screen flex flex-col items-center justify-center p-6">
      <div class="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
        <i class="ti ti-shield-lock text-6xl text-blue-600 mb-4 block"></i>
        <h1 class="text-3xl font-display font-bold text-slate-800 mb-2">CyberTwin</h1>
        <p class="text-slate-500 mb-8">Simulateur de risque cyber pour PME.</p>
        <button type="button" @click.prevent="handleLogin" class="w-full btn-modern py-3 text-lg">
          Se connecter
        </button>
      </div>
    </div>

    <!-- Application Principale (Authentifié) -->
    <template v-else>
      <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center gap-2">
              <i class="ti ti-shield-lock text-2xl text-blue-600"></i>
              <h1 class="text-xl font-display font-bold tracking-wider text-slate-800">
                CYBER<span class="text-blue-600">TWIN</span>
              </h1>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="hidden md:flex space-x-1">
                <RouterLink to="/" class="nav-link" active-class="nav-link-active">Accueil</RouterLink>
                <RouterLink to="/company" class="nav-link" active-class="nav-link-active">Entreprise</RouterLink>
                <RouterLink to="/assets" class="nav-link" active-class="nav-link-active">Actifs</RouterLink>
                <RouterLink to="/vulnerabilities" class="nav-link" active-class="nav-link-active">Vulnérabilités</RouterLink>
                <RouterLink to="/dashboard" class="nav-link" active-class="nav-link-active">Dashboard</RouterLink>
                <RouterLink to="/report" class="nav-link" active-class="nav-link-active">Rapport</RouterLink>
              </div>
              
              <!-- Menu Utilisateur (Dropdown) avec la directive v-click-outside -->
              <div class="relative pl-4 border-l border-slate-200" v-click-outside="() => isUserMenuOpen = false">
                <button 
                  @click="isUserMenuOpen = !isUserMenuOpen" 
                  class="flex items-center gap-2 focus:outline-none transition-transform hover:scale-105"
                >
                  <img 
                    :src="user?.picture" 
                    alt="Profil" 
                    class="w-9 h-9 rounded-full border-2 border-slate-200 bg-slate-100 object-cover shadow-sm" 
                  />
                </button>
                
                <!-- Le contenu du menu déroulant -->
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div 
                    v-if="isUserMenuOpen" 
                    class="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
                  >
                    <div class="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <p class="text-sm font-medium text-slate-800">{{ user?.name }}</p>
                      <p class="text-xs text-slate-500 truncate mt-0.5">{{ user?.email }}</p>
                    </div>
                    
                    <div class="p-1">
                      <button 
                        @click="handleLogout" 
                        class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <i class="ti ti-logout"></i> Déconnexion
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto p-6">
        <RouterView />
      </main>
    </template>
  </div>
</template>