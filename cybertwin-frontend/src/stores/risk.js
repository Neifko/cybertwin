import { defineStore } from "pinia";

export const useRiskStore = defineStore("risk", {
  state: () => ({
    reports: [],
    loading: false,
    error: null,
  }),

  getters: {
    reportByCompanyId: (state) => (companyId) =>
      state.reports.find((r) => r.companyId === companyId),
  },

  actions: {
    upsertReport(report) {
      const index = this.reports.findIndex(
        (r) => r.companyId === report.companyId,
      );
      if (index >= 0) {
        this.reports[index] = report;
      } else {
        this.reports.push(report);
      }
    },

    async calculateAllRisks(token) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          "http://localhost:3000/api/risk/calculate",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          this.reports = await response.json();
        } else {
          const error = await response.json().catch(() => ({}));
          this.error = error.message || "Erreur de calcul du risque";
          this.reports = [];
        }
      } catch (err) {
        console.error("Erreur de calcul du risque :", err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async calculateRisk(token, companyId) {
      if (!companyId) {
        return this.calculateAllRisks(token);
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          "http://localhost:3000/api/risk/calculate",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_id: companyId }),
          },
        );

        if (response.ok) {
          const report = await response.json();
          this.upsertReport(report);
        }
      } catch (err) {
        console.error("Erreur de calcul du risque :", err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
