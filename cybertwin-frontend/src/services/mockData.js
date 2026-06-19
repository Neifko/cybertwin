export const mockCompany = {
  id: 1,
  name: 'NovaTech Solutions',
  sector: 'Édition de logiciels',
  employeesCount: 85,
  serversCount: 12,
  clientWorkstationsCount: 60,
  exposedServices: ['Site web vitrine', 'API publique', 'Webmail', 'VPN'],
}

export const mockAssets = [
  {
    id: 1,
    name: 'Serveur Web principal',
    type: 'Serveur Web',
    description: 'Héberge le site vitrine et l\'API publique',
    internetExposed: true,
  },
  {
    id: 2,
    name: 'Base de données clients',
    type: 'Base de données',
    description: 'PostgreSQL - données clients et facturation',
    internetExposed: false,
  },
  {
    id: 3,
    name: 'Routeur principal',
    type: 'Routeur',
    description: 'Passerelle réseau interne / Internet',
    internetExposed: true,
  },
  {
    id: 4,
    name: 'Pare-feu périmétrique',
    type: 'Pare-feu',
    description: 'Filtrage du trafic entrant/sortant',
    internetExposed: true,
  },
  {
    id: 5,
    name: 'Application de gestion RH',
    type: 'Application métier',
    description: 'Logiciel interne de gestion des employés',
    internetExposed: false,
  },
  {
    id: 6,
    name: 'Poste comptabilité',
    type: 'Poste utilisateur',
    description: 'Poste de travail du service comptable',
    internetExposed: false,
  },
]

export const mockVulnerabilities = [
  {
    id: 1,
    assetId: 1,
    name: 'Logiciel obsolète',
    description: 'Apache 2.2 non mis à jour depuis 3 ans',
    criticality: 'élevée',
  },
  {
    id: 2,
    assetId: 1,
    name: 'Port exposé',
    description: 'Port 22 (SSH) accessible depuis Internet',
    criticality: 'moyenne',
  },
  {
    id: 3,
    assetId: 2,
    name: 'Absence de sauvegarde',
    description: 'Aucune sauvegarde automatisée configurée',
    criticality: 'élevée',
  },
  {
    id: 4,
    assetId: 3,
    name: 'Mot de passe faible',
    description: 'Identifiants par défaut non modifiés',
    criticality: 'élevée',
  },
  {
    id: 5,
    assetId: 5,
    name: 'Logiciel obsolète',
    description: 'Framework backend en version non maintenue',
    criticality: 'faible',
  },
  {
    id: 6,
    assetId: 6,
    name: 'Mot de passe faible',
    description: 'Politique de mot de passe non appliquée',
    criticality: 'moyenne',
  },
]