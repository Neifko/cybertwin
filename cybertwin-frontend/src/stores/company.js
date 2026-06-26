import { defineStore } from "pinia";

const API_URL = "http://localhost:3000/api/company";

function mapCompany(rawData) {
  let servicesArray = [];
  if (rawData.exposed_services) {
    try {
      servicesArray = JSON.parse(rawData.exposed_services);
    } catch {
      servicesArray = [rawData.exposed_services];
    }
  }

  return {
    id: rawData.id,
    name: rawData.name,
    sector: rawData.sector,
    employeesCount: rawData.employees_count || 0,
    serversCount: rawData.servers_count || 0,
    clientWorkstationsCount: rawData.workstations_count || 0,
    exposedServices: servicesArray,
  };
}

function buildPayload(companyData) {
  return {
    name: companyData.name,
    sector: companyData.sector,
    employees_count: companyData.employeesCount,
    servers_count: companyData.serversCount,
    workstations_count: companyData.clientWorkstationsCount,
    exposed_services: JSON.stringify(companyData.exposedServices || []),
  };
}

export const useCompanyStore = defineStore("company", {
  state: () => ({
    companies: [],
    selectedCompanyId: null,
    loading: false,
    error: null,
  }),

  getters: {
    selectedCompany(state) {
      return (
        state.companies.find(
          (c) => String(c.id) === String(state.selectedCompanyId),
        ) ||
        state.companies[0] ||
        null
      );
    },
    company(state) {
      return (
        state.companies.find(
          (c) => String(c.id) === String(state.selectedCompanyId),
        ) ||
        state.companies[0] ||
        null
      );
    },
  },

  actions: {
    selectCompany(id) {
      this.selectedCompanyId = id;
    },

    async fetchCompanies(token) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const rawData = await response.json();
          this.companies = rawData.map(mapCompany);

          if (
            !this.selectedCompanyId ||
            !this.companies.some(
              (c) => String(c.id) === String(this.selectedCompanyId),
            )
          ) {
            this.selectedCompanyId = this.companies[0]?.id || null;
          }
        } else {
          this.companies = [];
          this.selectedCompanyId = null;
        }
      } catch (error) {
        console.error("Erreur de récupération:", error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCompany(token) {
      await this.fetchCompanies(token);
    },

    async createCompany(companyData, token) {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildPayload(companyData)),
      });

      if (response.ok) {
        const result = await response.json();
        await this.fetchCompanies(token);
        this.selectCompany(result.id);
        return result.id;
      }

      const errorMsg = await response.json().catch(() => ({}));
      throw new Error(errorMsg.message || "Erreur lors de la création.");
    },

    async updateCompany(companyData, token) {
      if (!companyData.id) {
        throw new Error("Identifiant d'entreprise manquant.");
      }

      const response = await fetch(`${API_URL}/${companyData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildPayload(companyData)),
      });

      if (response.ok) {
        await this.fetchCompanies(token);
        this.selectCompany(companyData.id);
      } else {
        const errorMsg = await response.text();
        console.error("Erreur renvoyée par l'API :", errorMsg);
        throw new Error("Erreur lors de la mise à jour.");
      }
    },

    async deleteCompany(id, token) {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await this.fetchCompanies(token);
        return true;
      }

      const errorMsg = await response.json().catch(() => ({}));
      alert(errorMsg.message || "Erreur lors de la suppression.");
      return false;
    },
  },
});
