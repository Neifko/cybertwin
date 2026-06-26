import { defineStore } from "pinia";

export const useRiskStore = defineStore("risk", {
  state: () => ({
    score: 0,
    level: "faible",
    metrics: null,
    loading: false,
    error: null,
  }),

  actions: {
    async calculateRisk(token) {
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
          const report = await response.json();
          this.score = report.score;
          this.level = report.level;
          this.metrics = report.metrics;
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
