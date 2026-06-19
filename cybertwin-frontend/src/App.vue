<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen">
    <nav class="sticky top-0 z-50 backdrop-blur-md bg-[#0a0e17]/80 border-b border-white/5">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-2">
            <i class="ti ti-shield-lock text-2xl text-cyber-cyan"></i>
            <h1 class="text-xl font-display font-bold tracking-wider text-white">
              CYBER<span class="text-cyber-cyan">TWIN</span>
            </h1>
          </div>
          <div class="flex space-x-1">
            <RouterLink to="/" class="nav-link" active-class="nav-link-active">Accueil</RouterLink>
            <RouterLink to="/company" class="nav-link" active-class="nav-link-active">Entreprise</RouterLink>
            <RouterLink to="/assets" class="nav-link" active-class="nav-link-active">Actifs</RouterLink>
            <RouterLink to="/vulnerabilities" class="nav-link" active-class="nav-link-active">Vulnérabilités</RouterLink>
            <RouterLink to="/dashboard" class="nav-link" active-class="nav-link-active">Dashboard</RouterLink>
            <RouterLink to="/report" class="nav-link" active-class="nav-link-active">Rapport</RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto p-6">
      <RouterView />
    </main>
  </div>
</template>