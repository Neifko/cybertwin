import { defineStore } from "pinia";

const API_URL = "http://localhost:3000/api/vulnerabilities";

export const useVulnerabilitiesStore = defineStore("vulnerabilities", {
  state: () => ({
    vulnerabilities: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalVulnerabilities: (state) => state.vulnerabilities.length,

    byCriticality: (state) => {
      return state.vulnerabilities.reduce((acc, v) => {
        acc[v.criticality] = (acc[v.criticality] || 0) + 1;
        return acc;
      }, {});
    },

    vulnerabilitiesByAsset: (state) => (assetId) => {
      return state.vulnerabilities.filter((v) => v.assetId === assetId);
    },
  },

  actions: {
    async fetchVulnerabilities(token) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const rawData = await response.json();
          this.vulnerabilities = rawData.map((v) => ({
            id: v.id,
            assetId: v.asset_id,
            name: v.name,
            description: v.description,
            criticality: v.severity,
          }));
        }
      } catch (err) {
        console.error(err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async addVulnerability(vulnData, token) {
      try {
        const payload = {
          asset_id: vulnData.assetId,
          name: vulnData.name,
          description: vulnData.description,
          severity: vulnData.criticality,
        };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          await this.fetchVulnerabilities(token);
        } else {
          const errorMsg = await response.json();
          console.error("Détail du rejet Backend :", errorMsg);
          alert("Erreur : " + (errorMsg.message || JSON.stringify(errorMsg)));
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    },

    async runAudit(token) {
      this.loading = true;
      try {
        const response = await fetch(`${API_URL}/scan`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          await this.fetchVulnerabilities(token);
        } else {
          const error = await response.json();
          alert("Erreur lors de l'audit : " + error.message);
        }
      } catch (error) {
        console.error("Erreur réseau lors de l'audit :", error);
      } finally {
        this.loading = false;
      }
    },

    async clearAllVulnerabilities(token) {
      try {
        const response = await fetch(`${API_URL}/all`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          this.vulnerabilities = [];
        } else {
          alert("Erreur lors de la suppression totale.");
        }
      } catch (error) {
        console.error("Erreur réseau lors de la suppression :", error);
      }
    },
  },
});
