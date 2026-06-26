import { defineStore } from "pinia";
import { useCompanyStore } from "./company";
import { useRiskStore } from "./risk";

const API_URL = "http://localhost:3000/api/vulnerabilities";

function mapVulnerability(raw) {
  return {
    id: raw.id,
    assetId: raw.asset_id,
    companyId: raw.company_id,
    name: raw.name,
    description: raw.description,
    criticality: raw.severity,
  };
}

export const useVulnerabilitiesStore = defineStore("vulnerabilities", {
  state: () => ({
    vulnerabilities: [],
    loading: false,
    error: null,
  }),

  getters: {
    vulnerabilitiesForSelectedCompany(state) {
      const companyStore = useCompanyStore();
      const companyId = companyStore.selectedCompanyId;
      if (!companyId) return state.vulnerabilities;
      return state.vulnerabilities.filter(
        (v) => String(v.companyId) === String(companyId),
      );
    },

    totalVulnerabilities() {
      return this.vulnerabilitiesForSelectedCompany.length;
    },

    byCriticality() {
      return this.vulnerabilitiesForSelectedCompany.reduce((acc, v) => {
        acc[v.criticality] = (acc[v.criticality] || 0) + 1;
        return acc;
      }, {});
    },

    vulnerabilitiesByAsset() {
      return (assetId) =>
        this.vulnerabilitiesForSelectedCompany.filter(
          (v) => v.assetId === assetId,
        );
    },
  },

  actions: {
    buildUrl(companyId = null) {
      const companyStore = useCompanyStore();
      const id = companyId || companyStore.selectedCompanyId;
      return id ? `${API_URL}?companyId=${id}` : API_URL;
    },

    async fetchVulnerabilities(token, companyId = null) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(this.buildUrl(companyId), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const rawData = await response.json();
          this.vulnerabilities = rawData.map(mapVulnerability);
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
          const companyStore = useCompanyStore();
          await this.fetchVulnerabilities(token, companyStore.selectedCompanyId);
        } else {
          const errorMsg = await response.json();
          alert("Erreur : " + (errorMsg.message || JSON.stringify(errorMsg)));
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    },

    async runAudit(token, companyId = null) {
      const companyStore = useCompanyStore();
      const targetCompanyId = companyId || companyStore.selectedCompanyId;

      if (!targetCompanyId) {
        alert("Veuillez sélectionner une entreprise.");
        return;
      }

      this.loading = true;
      try {
        const response = await fetch(`${API_URL}/scan`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_id: targetCompanyId }),
        });

        if (response.ok) {
          await this.fetchVulnerabilities(token, targetCompanyId);
          await useRiskStore().calculateRisk(token, targetCompanyId);
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

    async clearAllVulnerabilities(token, companyId = null) {
      const companyStore = useCompanyStore();
      const targetCompanyId = companyId || companyStore.selectedCompanyId;

      if (!targetCompanyId) {
        alert("Veuillez sélectionner une entreprise.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/all?companyId=${targetCompanyId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          this.vulnerabilities = this.vulnerabilities.filter(
            (v) => String(v.companyId) !== String(targetCompanyId),
          );
          await useRiskStore().calculateRisk(token, targetCompanyId);
        } else {
          alert("Erreur lors de la suppression totale.");
        }
      } catch (error) {
        console.error("Erreur réseau lors de la suppression :", error);
      }
    },
  },
});
