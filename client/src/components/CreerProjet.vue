<template>
  <transition name="fade">
    <div
      class="overlay"
      v-if="creerProjetDialog"
      >
      <div
        class="fondOverlay"
        @click="creerProjetDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Nom du projet:</label>
            <input
              type="text"
              v-model="projet.nom"/>
          </div>
          <div>
            <label>presentation</label>
            <textarea v-model="projet.presentation" />
          </div>
          <span
            v-if="projet.nom.length"
            @click="creerProjet"
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
  defineComponent,
  getCurrentInstance,
  inject,
  onMounted,
  ref,
  reactive,
} from 'vue';

export default defineComponent({
  name: 'CreerProjet',
  setup() {
    const toast = inject('$toast');
    const axios = inject('$axios');
    const creerProjetDialog = ref(false);
    const creation = ref(false);
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const projet = reactive({
      nom: '',
      presentation: '',
    });

    async function creerProjet() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Création en cours');
      }
      if (projet.nom.length === 0) {
        erreur.push('Veuillez entrer un nom');
      }
      if (projet.presentation.length === 0) {
        erreur.push('Veuillez décrire le projet');
      }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(`${process.env.VUE_APP_API_URL}/projets/creer`, projet)
          .then((res) => {
            emitter.emit('projetCree', res.data);
            toast(`✅ Projet '${projet.nom}' créé`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          })
          .finally(() => {
            creerProjetDialog.value = false;
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
      emitter.on('creerProjet', () => {
        creerProjetDialog.value = true;
      });
    });

    return {
      creerProjetDialog,
      projet,
      creerProjet,
    };
  },
});
</script>

<style scoped>

.overlay {
  z-index: 209;
}

.fondOverlay {
  z-index: 210;
}

.contenuFormulaireOverlay {
  z-index: 211;
}
</style>
