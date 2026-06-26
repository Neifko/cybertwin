import { defineStore } from "pinia";
import { useCompanyStore } from "./company";
import { useRiskStore } from "./risk";

const API_URL = "http://localhost:3000/api/assets";

function mapAsset(raw) {
  return {
    id: raw.id,
    companyId: raw.company_id,
    companyName: raw.company_name,
    name: raw.name,
    type: raw.type,
    description: raw.description,
    internetExposed:
      raw.is_exposed === 1 ||
      raw.is_exposed === true ||
      raw.internetExposed === true,
  };
}

export const useAssetsStore = defineStore("assets", {
  state: () => ({
    assets: [],
    loading: false,
    error: null,
  }),

  getters: {
    assetsForSelectedCompany(state) {
      const companyStore = useCompanyStore();
      const companyId = companyStore.selectedCompanyId;
      if (!companyId) return state.assets;
      return state.assets.filter(
        (asset) => String(asset.companyId) === String(companyId),
      );
    },

    assetsByType() {
      return this.assetsForSelectedCompany.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {});
    },

    totalAssets() {
      return this.assetsForSelectedCompany.length;
    },
  },

  actions: {
    buildUrl(companyId = null) {
      const companyStore = useCompanyStore();
      const id = companyId || companyStore.selectedCompanyId;
      return id ? `${API_URL}?companyId=${id}` : API_URL;
    },

    async fetchAssets(token, companyId = null) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(this.buildUrl(companyId), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const rawData = await response.json();
          this.assets = rawData.map(mapAsset);
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
        const companyId = companyStore.selectedCompanyId;

        if (!companyId) {
          alert(
            "Veuillez d'abord sélectionner ou créer une entreprise dans l'onglet 'Entreprise'.",
          );
          return;
        }

        const payload = {
          name: assetData.name,
          type: assetData.type,
          description: assetData.description,
          is_exposed: assetData.internetExposed ? 1 : 0,
          company_id: companyId,
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
          await this.fetchAssets(token, companyId);
          await useRiskStore().calculateRisk(token, companyId);
        } else {
          const errorMsg = await response.json();
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
        const asset = this.assets.find((a) => String(a.id) === String(id));

        const payload = {
          name: updatedData.name,
          type: updatedData.type,
          description: updatedData.description,
          is_exposed: updatedData.internetExposed ? 1 : 0,
          company_id: asset?.companyId || companyStore.selectedCompanyId,
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
          await this.fetchAssets(token, companyStore.selectedCompanyId);
          await useRiskStore().calculateRisk(
            token,
            asset?.companyId || companyStore.selectedCompanyId,
          );
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
        const asset = this.assets.find((a) => String(a.id) === String(id));
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          this.assets = this.assets.filter(
            (a) => String(a.id) !== String(id),
          );
          if (asset?.companyId) {
            await useRiskStore().calculateRisk(token, asset.companyId);
          }
        } else {
          const errorMsg = await response.json().catch(() => ({}));
          alert(
            "Erreur lors de la suppression : " +
              (errorMsg.message || "Actif introuvable"),
          );
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Erreur réseau lors de la suppression de l'actif.");
      }
    },
  },
});
