<template>
  <table
    class="tableau"
    v-if="projet.objectifsTypes.length">
    <thead>
      <tr>
        <th
          v-if="projet.chef">

        </th>
        <th>
          Type
        </th>
        <th>
          Description
        </th>
        <th>
          Évaluation
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="objectif in projet.objectifsTypes"
        :key="`objectif-${objectif.id}`">
        <td
          v-if="projet.chef">
          <Popper
            arrow
            hover
            class="lien"
            content="Supprimer l'objectif"
            @click="emitter.emit('supprimerObjectifProjet', objectif.id)">
            ❌
          </Popper>
        </td>
        <td>
          {{ objectif.id_objectif ? objectif.nom : objectif.autre_objectif }}
        </td>
        <td>
          {{ objectif.description }}
        </td>
        <td>
          {{ objectif.evaluation }}
        </td>
      </tr>
    </tbody>
  </table>
  <div
    v-else
    class="message">
    <div
      class="msg info">
      Aucun objectif défini pour ce projet.
    </div>
  </div>
  <div
    v-if="projet.chef"
    class="bouton bouton-petit"
    @click="afficherFormulaireAjouterObjectif">
    Ajouter un objectif
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherFormulaireAjouterObjectifDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherFormulaireAjouterObjectifDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Type d'objectif:</label>
            <select
              v-model="objectifAAjouter.idObjectif">
              <option
                v-for="obj in objectifs"
                :key="`obj-${obj.id}`"
                :value="obj.id">
                {{ obj.nom  }}
              </option>
              <option
                value="autre"
                >
                autre
              </option>
            </select>
            <input
              type="text"
              v-model="objectifAAjouter.autre"
              v-if="objectifAAjouter.idObjectif === 'autre'"/>
          </div>
          <div>
            <label>
              Description de l'objectif:
              <small>
                (commencez par un verbe)
              </small>
            </label>
            <textarea
              rows="3"
              v-model="objectifAAjouter.description"></textarea>
          </div>
          <div>
            <label>Mode d'évaluation de l'objectif:</label>
            <textarea
              rows="3"
              v-model="objectifAAjouter.evaluation"></textarea>
          </div>
          <div>
            <div
              class="bouton bouton-petit"
              @click="ajouterObjectif">
              Ajouter l'objectif
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  computed,
  ref,
  inject,
  reactive,
  onMounted,
  getCurrentInstance,
} from 'vue';
import {
  useRoute,
} from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'ObjectifsProjet',
  setup() {
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const axios = inject('$axios');
    const toast = inject('$toast');
    const route = useRoute();
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const objectifs = ref([]);
    const afficherFormulaireAjouterObjectifDialog = ref(false);
    const objectifAAjouter = reactive({
      description: '',
      evaluation: '',
      idObjectif: 0,
      autre: '',
    });

    async function chargerListeObjectifs() {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/objectifs`)
        .then(async (res) => {
          objectifs.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerObjectifs() {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/${route.params.id}/objectifs`)
        .then(async (res) => {
          store.dispatch('projet/initialiserObjectifs', res.data);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function ajouterObjectif() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/projets/${route.params.id}/objectifs`,
        objectifAAjouter,
      )
        .then(async (res) => {
          store.dispatch('projet/ajouterObjectif', res.data.objectif);
          afficherFormulaireAjouterObjectifDialog.value = false;
          toast(`✅ ${res.data.msg}`, {
            type: 'success',
          });
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function supprimerObjectif(id) {
      // eslint-disable-next-line
      if (window.confirm('Voulez-vous supprimer cet objectif?')) {
        await axios.delete(
          `${process.env.VUE_APP_API_URL}/projets/${route.params.id}/objectifs/${id}`,
        )
          .then(() => {
            store.dispatch('projet/supprimerObjectif', id);
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          });
      }
    }

    async function afficherFormulaireAjouterObjectif() {
      await chargerListeObjectifs();
      afficherFormulaireAjouterObjectifDialog.value = true;
    }

    onMounted(async () => {
      if (projet.value.visibilite.mavisibilite === 'TOTALE') {
        await chargerObjectifs();
      }
      emitter.on('supprimerObjectifProjet', (id) => {
        supprimerObjectif(id);
      });
    });

    return {
      projet,
      afficherFormulaireAjouterObjectif,
      afficherFormulaireAjouterObjectifDialog,
      objectifAAjouter,
      objectifs,
      ajouterObjectif,
    };
  },
};
</script>

<style scoped>
.message {
  margin: 10px;
}
</style>
