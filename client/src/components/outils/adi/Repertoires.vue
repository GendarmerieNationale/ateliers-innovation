<template>
  <table
    class="tableau repertoires">
    <thead>
      <tr>
        <th>
          Nom
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(repertoire) in repertoires"
        :key="`repertoire-${repertoire.id}`">
        <td
          class="gauche">
          <router-link
            :to="`/outils/adi/repertoires/${repertoire.id}`">
            {{ repertoire.nom }}
          </router-link>
        </td>
      </tr>
      <tr
        v-for="(a, i) in Array.from({length: 14}, (_, j) => 2020 - j)"
        :key="`adp-${i}`">
        <td>
          <router-link
            :to="`/outils/adi/adp/${a}`">
            Ateliers de performance {{ a }}
          </router-link>
        </td>
      </tr>
    </tbody>
  </table>

  <transition name="fade">
    <div
      class="overlay"
      v-if="creerRepertorieDialog"
      >
      <div
        class="fondOverlay"
        @click="creerRepertorieDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Nom du répertoire:</label>
            <input
            type="text"
            v-model="repertoireAenvoyer.nom"/>
          </div>
          <div>
            <label>Campagne liée:</label>
            <select
              v-model="repertoireAenvoyer.campagne">
              <option
                v-for="campagne in campagnes"
                :key="`campagne-${campagne.id}`"
                :value="campagne.id">{{ $moment(campagne.debut).format('DD/MM/YYYY') }} - {{ campagne.titre }}</option>
            </select>
          </div>
          <div>
            <label>Liste des projets</label>
            <table
              class="tableau"
              v-if="repertoireAenvoyer.resultats.length > 0">
              <thead>
                <tr>
                  <td>
                    Place
                  </td>
                  <td>
                    Lauréat
                  </td>
                  <td>
                    Projet
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="projet in repertoireAenvoyer.resultats"
                  :key="`projet-${projet.id}`">
                  <td>
                    <input
                      type="number"
                      min="1"
                      class="place"
                      v-model="projet.place" />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      v-model="projet.laureat" />
                  </td>
                  <td>
                    {{ projet.nom }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <span
            @click="creerRepertoire"
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
  watch,
} from 'vue';

export default {
  name: 'Repertoires',
  setup() {
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const toast = inject('$toast');
    const axios = inject('$axios');
    const repertoires = ref([]);
    const creerRepertorieDialog = ref(false);
    const creation = ref(false);
    const campagnes = ref([]);
    const campagne = ref({});
    const repertoireAenvoyer = reactive({
      nom: '',
      campagne: 0,
      resultats: [],
    });

    async function chargerRepertoires() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/repertoires`)
        .then((res) => {
          repertoires.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerCampagnes() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagnes/sansrepertoire`)
        .then((res) => {
          campagnes.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerCampagne(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${id}`)
        .then((res) => {
          campagne.value = { ...res.data };
          repertoireAenvoyer.resultats = res.data
            .categories?.map((c) => c.projets).flat().filter((p) => p !== null)
            .map((p) => Object.assign(p, {
              laureat: false,
              place: null,
            }));
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function creerRepertoire() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Création en cours');
      }
      if (repertoireAenvoyer.nom.length === 0) {
        erreur.push('Veuillez entrer un nom');
      }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/repertoires`,
          repertoireAenvoyer,
        )
          .then((res) => {
            repertoires.value.push({
              nom: repertoireAenvoyer.nom,
              id: res.data.idRepertoire,
            });
            toast(`✅ Répertoire '${repertoireAenvoyer.nom}' créée`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
            creerRepertorieDialog.value = false;
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
      chargerRepertoires();
      chargerCampagnes();
      emitter.on('creerRepertoire', () => {
        creerRepertorieDialog.value = true;
      });
    });

    watch(() => repertoireAenvoyer.campagne, async (c) => {
      await chargerCampagne(c);
    });

    return {
      repertoires,
      creerRepertorieDialog,
      repertoireAenvoyer,
      creerRepertoire,
      campagnes,
    };
  },
};
</script>

<style scoped>
.listeRepertoires {
  border-collapse:collapse;
  font-family: 'Caviar Dreams';
  margin: 20px;
}

.listeRepertoires th {
  padding: 0 20px;
    padding-bottom: 20px;
}

.listeRepertoires tr:hover td {
  background-color: #fffd
}

.listeRepertoires p {
  margin: 0;
  padding: 0;
  text-align: left;
}

.place {
  width: 4em;
}
</style>
