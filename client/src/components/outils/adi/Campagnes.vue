<template>
  <div class="campagnes">
    <div v-if="Object.values(campagnes).flat().length === 0">
      Pas de campagne pour l'instant.
    </div>
    <!-- <h2
      class="typesCampagne">
      <span
        @click="typeCampagneSelectionne = typeCampagne"
        :class="{ typeCampagneActif: typeCampagneSelectionne === typeCampagne }"
        v-for="(typeCampagneClair, typeCampagne) in typesCampagne"
        :key="`menuCampagne-${typeCampagne}`">
        {{ typeCampagneClair }}
      </span>
    </h2> -->
    <template
      v-for="typeCampagne in ['avenir','encours','passees']"
      :key="`campagne-${typeCampagne}`">
      <div
        v-if="campagnes[typeCampagne].length > 0">
        <h2>{{ typesCampagne[typeCampagne] }}</h2>
        <table
          class="tableau liste_campagnes">
          <thead>
            <tr>
              <th>
                Détails
              </th>
              <th>
                Titre
              </th>
              <th>
                Début
              </th>
              <th>
                Fin
              </th>
              <th>
                Catégories
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(campagne, i) in campagnes[typeCampagne]"
              :key="`campagne-${i}`">
              <td>
                <router-link :to="`/outils/adi/campagne/${campagne.id}`">
                  <span
                    class="tooltip"
                    data-tooltip="Afficher détails">
                    <text-box-search-outline
                      class="lien" />
                  </span>
                </router-link>
              </td>
              <td>
                {{ campagne.titre }}
              </td>
              <td>
                {{ $moment(campagne.debut).format('DD/MM/YYYY') }}
              </td>
              <td>
                {{ $moment(campagne.fin).format('DD/MM/YYYY') }}
              </td>
              <td>
                <div
                  class="listeCapsules">
                  <span
                    v-for="(c, j) in campagne.categories"
                    :key="`categories-${i}-${j}`"
                    class="capsule">
                    {{ c.nom }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="creerCampagneDialog"
      >
      <div
        class="fondOverlay"
        @click="creerCampagneDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Titre de la campagne:</label>
            <input
            type="text"
            v-model="campagne.titre"/>
          </div>
          <div>
            <label>Description de la campagne:</label>
            <textarea
            placeholder="Description de la campagne"
            v-model="campagne.description"/>
          </div>
          <div>
            <label>Dates de la campagne</label>
            <div class="datesCampagne">
              <span>Début</span>
              <span>Fin</span>
            </div>
            <v-date-picker
              v-model="campagne.dates"
              mode="date"
              :masks="masks"
              :model-config="{type: 'string', mask: masks.store}"
              is-range
            >
              <template v-slot="{ inputValue, inputEvents, isDragging }">
                <div class="datesCampagne">
                  <input
                  :class="isDragging ? 'couleur' : ''"
                  :value="inputValue.start"
                  v-on="inputEvents.start"
                  />
                  <input
                  :class="isDragging ? 'couleur' : ''"
                  :value="inputValue.end"
                  v-on="inputEvents.end"
                  />
                </div>
              </template>
            </v-date-picker>
          </div>
          <div>
            Catégories:
            <fieldset
              v-for="(cat, i) in campagne.categories"
              :key="`cat-campagne-${i}`">
              <legend>
                <span
                class="effacer"
                @click="supprimerCategorieCampagne(cat.categorie.id)">
                  ❌
                </span>
                {{ cat.categorie.nom }}
              </legend>
            </fieldset>
            <div
              class="listeCapsules">
              <template
                v-for="(c, j) in categories"
                :key="`categories-dispos-${j}`">
                <span
                  v-if="!campagne.categories
                  .map((x) => x.categorie.id).includes(c.id)"
                  class="capsule">
                  <span
                  class="effacer"
                  @click="ajouterCategorieCampagne(c)">
                  ➕
                  </span>
                  {{ c.nom }}
                </span>
              </template>
            </div>
          </div>
          <span
            @click="creerCampagne"
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
import {
  TextBoxSearchOutline,
} from 'mdue';

export default {
  name: 'Campagnes',
  components: {
    TextBoxSearchOutline,
  },
  setup() {
    const creation = ref(false);
    const internalInstance = getCurrentInstance();
    const moment = internalInstance
      .appContext.config.globalProperties.$moment;
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const toast = inject('$toast');
    const axios = inject('$axios');
    const campagnes = ref({
      passees: [],
      encours: [],
      avenir: [],
    });
    const categories = ref([]);
    const creerCampagneDialog = ref(false);
    const masks = reactive({
      input: 'DD/MM/YYYY',
      store: 'YYYY-MM-DD',
    });
    const campagne = reactive({
      titre: '',
      description: '',
      categories: [],
      dates: {
        start: null,
        end: null,
      },
    });
    const typesCampagne = ref({
      passees: 'Passées',
      encours: 'En cours',
      avenir: 'À venir',
    });
    const typeCampagneSelectionne = ref('');

    async function creerCampagne() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Création en cours');
      }
      if (campagne.description.length === 0) {
        erreur.push('Veuillez entrer une description');
      }
      if (campagne.dates.start * campagne.dates.end === 0) {
        erreur.push('Veuillez entrer des dates de campagne');
      }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/campagne/creer`,
          campagne,
        )
          .then((res) => {
            let typeCampagne;
            if (moment().diff(moment(res.data.debut)) * moment().diff(moment(res.data.fin)) <= 0) {
              typeCampagne = 'encours';
            } else if (moment().diff(moment(res.data.debut)) < 0) {
              typeCampagne = 'avenir';
            } else {
              typeCampagne = 'passees';
            }
            campagnes.value[typeCampagne].push(res.data);
            toast('✅ Campagne ajoutée', {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          })
          .finally(() => {
            creerCampagneDialog.value = false;
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

    async function chargerCampagnes() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagnes`)
        .then((res) => {
          res.data.forEach((item) => {
            let typeCampagne;
            if (moment().diff(moment(item.debut)) * moment().diff(moment(item.fin)) <= 0) {
              typeCampagne = 'encours';
            } else if (moment().diff(moment(item.debut)) < 0) {
              typeCampagne = 'avenir';
            } else {
              typeCampagne = 'passees';
            }
            campagnes.value[typeCampagne].push(item);
          });
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data}`, {
            type: 'error',
          });
        });
    }

    function ajouterCategorieCampagne(c) {
      campagne.categories.push({
        categorie: c,
        projets: [],
      });
    }

    function supprimerCategorieCampagne(c) {
      campagne.categories = campagne.categories.filter((x) => x.categorie.id !== c);
    }

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

    onMounted(async () => {
      chargerCampagnes();
      chargerCategories();
      emitter.on('creerCampagne', () => {
        creerCampagneDialog.value = true;
      });
    });

    return {
      campagnes,
      creerCampagneDialog,
      masks,
      campagne,
      creerCampagne,
      categories,
      ajouterCategorieCampagne,
      supprimerCategorieCampagne,
      typesCampagne,
      typeCampagneSelectionne,
    };
  },
};
</script>

<style scoped>
.campagnes {
  width: 90%;
  text-align: justify;
}

/* .typeCampagneActif {
  color: #065197;
  text-decoration: underline;
}

.typesCampagne span:not(.typeCampagneActif):hover {
  color: #56a1d7;
}

.typesCampagne {
  display: flex;
  justify-content: space-around;
}

.typesCampagne span {
  cursor: pointer;
  justify-content: center;
  display: flex;
} */

table img {
  height: 20px;
  margin: 0 10px;
  cursor: pointer;
}

.datesCampagne {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.datesCampagne input {
  width: 100px;
  text-align: center;
}
</style>
