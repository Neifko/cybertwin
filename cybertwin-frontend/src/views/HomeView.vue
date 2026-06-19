<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="space-y-6">
    <!-- Hero -->
    <div class="panel p-10 text-center relative overflow-hidden">
      <i class="ti ti-shield-lock text-5xl text-cyber-cyan glow-text"></i>
      <h1 class="text-3xl md:text-4xl font-display font-bold text-white mt-4 mb-3">
        SHIELD<span class="text-cyber-cyan">AUDIT</span>
      </h1>
      <p class="text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Cabinet d'audit et de conseil en cybersécurité, spécialisé dans l'évaluation
        du risque numérique des petites et moyennes entreprises.
      </p>
      <RouterLink to="/dashboard" class="btn-cyber inline-flex items-center gap-2 mt-6">
        <i class="ti ti-layout-dashboard"></i> Accéder au tableau de bord
      </RouterLink>
    </div>

    <!-- Présentation entreprise -->
    <div class="panel p-8">
      <h2 class="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
        <i class="ti ti-building-bank text-cyber-violet"></i> Qui sommes-nous ?
      </h2>
      <p class="text-slate-400 leading-relaxed mb-4">
        Fondé en 2021, <span class="text-white font-medium">ShieldAudit</span> accompagne les PME
        dans l'identification, la modélisation et la réduction de leurs risques cyber. Notre équipe
        d'experts en sécurité informatique intervient sur l'ensemble du cycle de gestion du risque :
        cartographie des actifs numériques, détection des vulnérabilités, et recommandations
        opérationnelles adaptées à chaque structure.
      </p>
      <p class="text-slate-400 leading-relaxed">
        <span class="text-white font-medium">CyberTwin</span> est notre outil interne de simulation :
        il permet de créer un jumeau numérique de l'infrastructure d'une entreprise cliente afin
        d'évaluer automatiquement son niveau d'exposition au risque, avant même d'intervenir sur site.
      </p>
    </div>

    <!-- Stats / chiffres clés -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="panel p-6 text-center">
        <i class="ti ti-building text-2xl text-cyber-cyan mb-2"></i>
        <p class="text-2xl font-display font-bold text-white">120+</p>
        <p class="text-sm text-slate-500">Entreprises auditées</p>
      </div>
      <div class="panel p-6 text-center">
        <i class="ti ti-users text-2xl text-cyber-violet mb-2"></i>
        <p class="text-2xl font-display font-bold text-white">8</p>
        <p class="text-sm text-slate-500">Experts en cybersécurité</p>
      </div>
      <div class="panel p-6 text-center">
        <i class="ti ti-certificate text-2xl text-cyber-pink mb-2"></i>
        <p class="text-2xl font-display font-bold text-white">5 ans</p>
        <p class="text-sm text-slate-500">D'expérience terrain</p>
      </div>
    </div>

    <!-- Méthodologie -->
    <div class="panel p-8">
      <h2 class="text-xl font-display font-bold text-white mb-5 flex items-center gap-2">
        <i class="ti ti-list-check text-cyber-cyan"></i> Notre méthodologie
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="flex flex-col items-center text-center gap-2">
          <div class="w-10 h-10 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan font-display font-bold">1</div>
          <p class="text-sm text-slate-400">Modélisation de l'entreprise et de son infrastructure</p>
        </div>
        <div class="flex flex-col items-center text-center gap-2">
          <div class="w-10 h-10 rounded-full bg-cyber-violet/10 border border-cyber-violet/20 flex items-center justify-center text-cyber-violet font-display font-bold">2</div>
          <p class="text-sm text-slate-400">Inventaire des actifs numériques exposés</p>
        </div>
        <div class="flex flex-col items-center text-center gap-2">
          <div class="w-10 h-10 rounded-full bg-cyber-pink/10 border border-cyber-pink/20 flex items-center justify-center text-cyber-pink font-display font-bold">3</div>
          <p class="text-sm text-slate-400">Détection et analyse des vulnérabilités</p>
        </div>
        <div class="flex flex-col items-center text-center gap-2">
          <div class="w-10 h-10 rounded-full bg-risk-medium/10 border border-risk-medium/20 flex items-center justify-center text-risk-medium font-display font-bold">4</div>
          <p class="text-sm text-slate-400">Score de risque et recommandations</p>
        </div>
      </div>
    </div>
  </div>
</template>