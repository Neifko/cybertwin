import { defineStore } from "pinia";
import { useCompanyStore } from "./company";

const API_URL = "http://localhost:3000/api/assets";

export const useAssetsStore = defineStore("assets", {
  state: () => ({
    assets: [],
    loading: false,
    error: null,
  }),

  getters: {
    assetsByType: (state) => {
      return state.assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {});
    },
    totalAssets: (state) => state.assets.length,
  },

  actions: {
    async fetchAssets(token) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const rawData = await response.json();
          this.assets = rawData.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            description: a.description,
            internetExposed:
              a.is_exposed === 1 ||
              a.is_exposed === true ||
              a.internetExposed === true,
          }));
        } else {
          throw new Error("Erreur lors de la récupération des actifs");
        }
      } catch (err) {
        console.error(err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async addAsset(assetData, token) {
      try {
        const companyStore = useCompanyStore();

        if (!companyStore.company || !companyStore.company.id) {
          console.error(
            "Impossible d'ajouter un actif : aucune entreprise trouvée.",
          );
          alert(
            "Veuillez d'abord configurer votre entreprise dans l'onglet 'Entreprise'.",
          );
          return;
        }

        const payload = {
          name: assetData.name,
          type: assetData.type,
          description: assetData.description,
          is_exposed: assetData.internetExposed ? 1 : 0,
          company_id: companyStore.company.id,
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
          await this.fetchAssets(token);
        } else {
          const errorMsg = await response.json();
          console.error("Détail du rejet 400 (Backend) :", errorMsg);
          alert(
            "Erreur de l'API : " + (errorMsg.message || "Requête invalide"),
          );
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout :", error);
      }
    },

    async updateAsset(id, updatedData, token) {
      try {
        const companyStore = useCompanyStore();

        const payload = {
          name: updatedData.name,
          type: updatedData.type,
          description: updatedData.description,
          is_exposed: updatedData.internetExposed ? 1 : 0,
          company_id: companyStore.company?.id,
        };

        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          await this.fetchAssets(token);
        } else {
          const errorMsg = await response.json();
          console.error(
            "Détail du rejet Backend lors de la mise à jour :",
            errorMsg,
          );
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
      }
    },

    async deleteAsset(id, token) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          this.assets = this.assets.filter((a) => a.id !== id);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    },
  },
});
