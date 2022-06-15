<template>
  <table
    class="tableau categories"
    v-if="categories.length > 0">
    <thead>
      <tr>
        <th>
          Nom
        </th>
        <th>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(categorie) in categories"
        :key="`categorie-${categorie.id}`">
        <td>
          {{ categorie.nom }}
        </td>
        <td>
          <!-- <router-link :to="`/outils/adi/projets/categorie/${categorie.id}`">
            <div
              class="bouton bouton-petit">
              Voir les projets
            </div>
          </router-link> -->
        </td>
      </tr>
    </tbody>
  </table>

  <transition name="fade">
    <div
      class="overlay"
      v-if="creerCategorieDialog"
      >
      <div
        class="fondOverlay"
        @click="creerCategorieDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Nom de la catégorie:</label>
            <input
            type="text"
            v-model="categorieAenvoyer.nom"/>
          </div>
          <span
            @click="creerCategorie"
            class="bouton">
            Créer
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  inject,
  onMounted,
  ref,
  reactive,
  getCurrentInstance,
} from 'vue';

export default {
  name: 'Categories',
  setup() {
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const toast = inject('$toast');
    const axios = inject('$axios');
    const categories = ref([]);
    const creerCategorieDialog = ref(false);
    const creation = ref(false);
    const categorieAenvoyer = reactive({
      nom: '',
    });

    async function chargerCategories() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/categories`)
        .then((res) => {
          categories.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data}`, {
            type: 'error',
          });
        });
    }

    async function creerCategorie() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Création en cours');
      }
      if (categorieAenvoyer.nom.length === 0) {
        erreur.push('Veuillez entrer un nom');
      }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/categorie/creer`,
          categorieAenvoyer,
        )
          .then((res) => {
            categories.value.push({
              nom: categorieAenvoyer.nom,
              id: res.data.id,
            });
            toast(`✅ Catégorie '${categorieAenvoyer.nom}' créée`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          })
          .finally(() => {
            creerCategorieDialog.value = false;
            creation.value = false;
          });
      } else {
        creation.value = false;
        erreur.forEach((e) => {
          toast(`⚠️ ${e}`, {
            type: 'error',
          });
        });
      }
    }

    onMounted(async () => {
      chargerCategories();
      emitter.on('creerCategorie', () => {
        creerCategorieDialog.value = true;
      });
    });

    return {
      categories,
      creerCategorieDialog,
      categorieAenvoyer,
      creerCategorie,
    };
  },
};
</script>

<style scoped>
.listeCategories {
  border-collapse:collapse;
  font-family: 'Caviar Dreams';
  margin: 20px;
}

.listeCategories th {
  padding: 0 20px;
    padding-bottom: 20px;
}

.listeCategories tr:hover td {
  background-color: #fffd
}

.listeCategories p {
  margin: 0;
  padding: 0;
  text-align: left;
}
</style>
