import { defineStore } from "pinia";

export const useCompanyStore = defineStore("company", {
  state: () => ({
    company: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchCompany(token) {
      this.loading = true;
      try {
        const response = await fetch("http://localhost:3000/api/company", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const rawData = await response.json();

          let servicesArray = [];
          if (rawData.exposed_services) {
            try {
              servicesArray = JSON.parse(rawData.exposed_services);
            } catch (e) {
              servicesArray = [rawData.exposed_services];
            }
          }

          this.company = {
            id: rawData.id,
            name: rawData.name,
            sector: rawData.sector,
            employeesCount: rawData.employees_count || 0,
            serversCount: rawData.servers_count || 0,
            clientWorkstationsCount: rawData.workstations_count || 0,
            exposedServices: servicesArray,
          };
        } else if (response.status === 404) {
          this.company = null;
        }
      } catch (error) {
        console.error("Erreur de récupération:", error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },

    async updateCompany(companyData, token) {
      try {
        const payload = {
          name: companyData.name,
          sector: companyData.sector,
          employees_count: companyData.employeesCount,
          servers_count: companyData.serversCount,
          workstations_count: companyData.clientWorkstationsCount,
          exposed_services: JSON.stringify(companyData.exposedServices),
        };

        const response = await fetch("http://localhost:3000/api/company", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          await this.fetchCompany(token);
        } else {
          console.error("Erreur renvoyée par l'API :", await response.text());
        }
      } catch (error) {
        console.error("Erreur de mise à jour:", error);
      }
    },
  },
});
