<template>
  <div class="campagne">
    <div class="header">
      <h2>
        {{ campagne.titre }}
      </h2>
      <h3>
        <span
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Modifier dates">
          <pencil-outline
            class="lien"
            @click="formulaireModifDatesDialog = true" />
        </span>
        du {{ $moment(campagne.debut).format('DD/MM/YYYY') }}
        au {{ $moment(campagne.fin).format('DD/MM/YYYY') }}
        (à 00h00)
      </h3>
      <fieldset class="rubrique description">
        <legend>
          <div class="pli"></div>
          <span
            class="tooltip"
            data-tooltip-location="bottom"
            data-tooltip="Modifier description">
            <pencil-outline
              class="lien"
              @click="modifierDescriptionDialog = true" />
          </span>
          Description
        </legend>
        <div
          class="description">
          <p
            v-for="(p, i) in campagne.description?.split('\n')"
            :key="`campagne-description-p-${i}`">
            {{ p }}
          </p>
          <div
            v-if="campagne.statut === 'encours'"
            class="msg info">
            La liste des projets en lice figure ci-dessous. Pour voter vous devez
            impérativement sélectionner au moins un projet dans chaque catégorie.
          </div>
        </div>
      </fieldset>
    </div>
    <fieldset class="rubrique categories">
      <legend>
        <div class="pli"></div>
        Catégories
      </legend>
      <div
        class="bouton bouton-petit"
        @click="idCategorie = null; ajouterProjetDialog = true">
        <div class="boutonLogo">
          <pencil-plus-outline/>
          <span>
            Ajouter un projet sans catégorie pour l'instant
          </span>
        </div>
      </div>
      <fieldset
        v-for="(categorie, i) in campagne.categories"
        :key="`cat-${categorie.id}`">
        <legend>
          <span
            v-if="campagne.statut !== 'passee'"
            class="tooltip"
            data-tooltip-location="bottom"
            data-tooltip="Ajouter projet">
            <pencil-plus-outline
              class="lien"
              @click="idCategorie = categorie.id; ajouterProjetDialog = true" />
          </span>
          <span
            v-if="categorie.id">
            {{ categorie.nom }}
          </span>
          <span
            v-else>
            Sans catégorie
          </span>
        </legend>
        <div class="listeProjets">
          <ul
            v-if="categorie.projets">
            <li
              v-for="(projet, j) in categorie.projets"
              :key="`proj-${i}-${j}`">
              <span
                v-if="projet">
                <span class="boutons">
                  <span
                    v-if="campagne.statut === 'avenir'"
                    @click="supprimerProjetCategorie(projet.id)"
                    class="bouton bouton-petit">
                    Supprimer
                  </span>
                  <span
                    v-if="campagne.statut === 'avenir'"
                    @click="afficherModifierProjetCategorieDialog(projet.id)"
                    class="bouton bouton-petit">
                    Changer de catégorie
                  </span>
                  <a
                    :href="`/projet/${projet.id}/adi`"
                    target="_blank">
                    <span
                      class="bouton bouton-petit">
                      Voir la fiche ADI
                    </span>
                  </a>
                  <div
                    v-if="Object.keys(votesperso).length === 0 && campagne.statut === 'encours'"
                    class="bouton bouton-petit"
                    :class="{ selectionne: votes[categorie.id]?.includes(projet.id)}"
                    @click="selectionnerProjet(categorie.id,projet.id)">
                    {{ votes[categorie.id]?.includes(projet.id) ? 'Sélectionné' : 'Sélectionner' }}
                  </div>
                </span>
                <a
                  :href="`/projet/${projet.id}/adi`"
                  target="_blank">
                  <h3>
                    {{ projet.nom }}
                  </h3>
                  <span
                    v-if="votesperso[categorie.id]?.includes(projet.id)">
                    ✅ a voté!
                  </span>
                </a>
              </span>
            </li>
          </ul>
          <div
            v-else
            class="msg avertissement important">
            Aucun projet dans cette catégorie
          </div>
        </div>
      </fieldset>
      <template
        v-if="campagne.statut === 'encours'">
        <template
          v-if="Object.keys(votesperso).length === 0">
          <template
            v-if="connexion.connecte">
            <div
              class="bouton"
              @click="voter"
              v-if="Object.keys(votes).length === campagne.categories?.length">
              <div class="boutonLogo">
                <Vote />
                <span>
                  Voter
                </span>
              </div>
            </div>
          </template>
          <a class="bouton"
            v-else
            @click="emitter.emit('popupConnexion')">
            Se connecter pour voter
          </a>
        </template>
        <div
          v-else
          @click="annulerVote"
          class="bouton">
          Annuler mon vote
        </div>
      </template>
      <div
        class="msg avertissement"
        v-if="campagne.statut === 'passee'">
        Les votes sont clos pour cette campagne.
      </div>
      <div
        class="msg info"
        v-if="campagne.statut === 'avenir'">
        Les votes ne sont pas encore ouverts pour cette campagne.
      </div>
    </fieldset>
    <fieldset
      class="rubrique resultats"
      v-if="campagne.statut === 'passee' || resultatsCampagne.length > 0">
      <legend>
        <div class="pli"></div>
        Résultats
      </legend>
      <div>
        Nombre de votants: {{ nbVotants }}
      </div>
      <div>
        <div
          v-if="campagne.date_publication_resultats === null"
          @click="publierResultats"
          class="bouton">
          Publier résultats
        </div>
        <div
          v-if="campagne.date_publication_resultats === null"
          @click="chargerResultats(campagne.id)"
          class="bouton">
          Recharger résultats
        </div>
        <div
          v-else>
          Résultats publiés le {{ $moment(campagne.date_publication_resultats).format('DD/MM/YYYY') }}
        </div>
        <table
          v-if="resultatsCampagne.length > 0"
          class="tableau">
          <thead>
            <tr>
              <th>
                Position
              </th>
              <th>
                Nombre de votes
              </th>
              <th>
                Part de votes
              </th>
              <th>
                Projet
              </th>
              <th>
                Catégorie
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(resultat, i) in resultatsCampagne.filter((x) => filtreCategorieResultats.includes(x.id_categorie))"
              :key="`resultat-${i}`">
              <td>
                {{ i+1 }}
              </td>
              <td>
                {{ resultat.nb_votes }}
              </td>
              <td>
                {{ Math.floor(10000*resultat.nb_votes/nbVotants)/100 }} %
              </td>
              <td>
                <router-link :to="`/projet/${resultat.id_projet}`">
                  {{ resultat.nom_projet }}
                </router-link>
              </td>
              <td>
                {{ resultat.nom_categorie }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="ajouterProjetDialog"
      >
      <div
        class="fondOverlay"
        @click="ajouterProjetDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Projet à rechercher:</label>
            <input
            type="text"
            v-model="projetARechercher"/>
            <button
              @click="rechercherProjet">Rechercher</button>
          </div>
          <fieldset
            v-if="projets.length > 0">
            <legend>
              Projets disponibles:
            </legend>
            <div
              class="projets listeCapsules">
              <span
                @click="ajouterProjet(projet)"
                v-for="(projet, i) in projets.filter((x) => !projetsAajouter.map((y) => y.id).includes(x.id))"
                :key="`projet-${i}`"
                class="capsule">
                <span class="ajouter">➕</span> {{ projet.nom }}
              </span>
            </div>
          </fieldset>
          <fieldset
            v-if="projetsAajouter.length > 0">
            <legend>
              Projets à ajouter:
            </legend>
            <div
              class="projets listeCapsules">
              <span
                @click="supprimerProjet(projet)"
                v-for="(projet, i) in projetsAajouter"
                :key="`projet-${i}`"
                class="capsule">
                <span class="effacer">❌</span> {{ projet.nom }}
              </span>
            </div>
          </fieldset>
        </div>
        <span
          v-if="projetsAajouter.length > 0"
          @click="ajouterProjetsCategorie"
          class="bouton">
          Ajouter
        </span>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="modifierDescriptionDialog"
      >
      <div
        class="fondOverlay"
        @click="modifierDescriptionDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Description:</label>
            <textarea
              placeholder="Description de la campagne"
              v-model="descriptionAChanger"/>
          </div>
        </div>
        <span
          v-if="descriptionAChanger.length > 0"
          @click="modifierDescription"
          class="bouton">
          Modifier
        </span>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="explicationsDialog && campagne.statut === 'encours'"
      >
      <div
        class="fondOverlay">
      </div>
      <div class="contenuFormulaireOverlay">
        <h3>
          Comment voter?
        </h3>
        <div>
          <ul class="puces">
            <li>
              sélectionnez au moins un projet dans chaque catégorie;
            </li>
            <li>
              validez votre vote en cliquant sur le bouton "Voter";
            </li>
            <li>
              vous pouvez changer votre vote à tout moment avant l'échéance;
            </li>
            <li>
              il ne sera plus possible de voter après l'échéance.
            </li>
          </ul>
        </div>
        <div
          class="msg avertissement">
          Les "pouces" vers le haut ou le bas que vous mettrez sur la page de chaque
          projet ne sont pas pris en compte dans les votes.
        </div>
        <span
          @click="explicationsDialog = false"
          class="bouton">
          J'ai compris
        </span>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="formulaireModifDatesDialog"
      >
      <div
        class="fondOverlay"
        @click="formulaireModifDatesDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Dates de campagne</label>
            <div class="datesCampagne">
              <span>Début</span>
              <span>Fin</span>
            </div>
            <v-date-picker
              v-model="datesAModifier.dates"
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
          <span
            @click="modifierDates"
            class="bouton bouton-petit">
            Modifier dates
          </span>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="modifierProjetCategorieDialog"
      >
      <div
        class="fondOverlay"
        @click="modifierProjetCategorieDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Nouvelle catégorie:</label>
            <select v-model="nouvelleCategorie.idCategorie">
              <option
                v-for="cat in campagne.categories.filter((c) => c.id !== null).map((c) => ({ id: c.id, nom: c.nom }))"
                :value="cat.id"
                :key="`cat-${cat.id}`">
                {{ cat.nom }}
              </option>
            </select>
          </div>
          <span
            @click="modifierProjetCategorie"
            class="bouton bouton-petit">
            Modifier catégorie
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
  computed,
} from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import {
  PencilPlusOutline,
  PencilOutline,
  Vote,
} from 'mdue';

export default {
  name: 'Campagne',
  components: {
    PencilPlusOutline,
    PencilOutline,
    Vote,
  },
  setup() {
    const route = useRoute();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const campagne = ref({});
    const resultatsCampagne = ref([]);
    const filtreCategorieResultats = ref([]);
    const apiUrl = process.env.VUE_APP_API_URL;
    const nbVotants = ref(0);
    const votes = reactive({});
    const votesperso = ref({});
    const projetARechercher = ref('');
    const projets = ref([]);
    const projetsAajouter = ref([]);
    const idCategorie = ref(0);
    const ajouterProjetDialog = ref(false);
    const internalInstance = getCurrentInstance();
    const moment = internalInstance
      .appContext.config.globalProperties.$moment;
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const store = useStore();
    const connexion = computed(() => store.state.connexion);
    const modifierDescriptionDialog = ref(false);
    const descriptionAChanger = ref('');
    const explicationsDialog = ref(true);
    const masks = reactive({
      input: 'DD/MM/YYYY',
      store: 'YYYY-MM-DD',
    });
    const datesAModifier = ref({
      dates: {
        start: '',
        end: '',
      },
    });
    const formulaireModifDatesDialog = ref(false);
    const modifierProjetCategorieDialog = ref(false);
    const nouvelleCategorie = reactive({
      idProjet: 0,
      idCategorie: 0,
    });

    async function chargerNbVotants(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${id}/totalvotes`)
        .then((res) => {
          nbVotants.value = +res.data;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerResultatsCampagne(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${id}/resultats`)
        .then((res) => {
          campagne.value.categories.forEach((cat) => {
            filtreCategorieResultats.value.push(cat.id);
          });
          resultatsCampagne.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerCampagne(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${id}`)
        .then(async (res) => {
          campagne.value = { ...res.data };
          datesAModifier.value.dates.start = moment(res.data.debut).format('YYYY-MM-DD');
          datesAModifier.value.dates.end = moment(res.data.fin).format('YYYY-MM-DD');
          descriptionAChanger.value = campagne.value.description;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerVotesPerso(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${id}/votesperso`)
        .then((res) => {
          votesperso.value = { ...res.data };
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    function selectionnerProjet(c, p) {
      if (!Object.keys(votes).map((x) => +x).includes(c)) {
        votes[c] = [p];
      } else if (!votes[c].includes(p)) {
        votes[c].push(p);
      } else {
        votes[c] = votes[c].filter((x) => x !== p);
        if (votes[c].length === 0) {
          delete votes[c];
        }
      }
    }

    async function publierResultats() {
      // eslint-disable-next-line
      if (window.confirm('Voulez-vous publier les résultats?')) {
        await axios.post(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/publierresultats`)
          .then((res) => {
            campagne.value.date_publication_resultats = res.data;
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          });
      }
    }

    async function voter() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/vote`,
        { votes },
      )
        .then((res) => {
          votesperso.value = { ...res.data };
          emitter.emit('campagne_votee');
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function annulerVote() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/annulervote`)
        .then(() => {
          votesperso.value = {};
          emitter.emit('campagne_annulation_vote');
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function ajouterProjet(p) {
      projetsAajouter.value.push(p);
    }

    async function supprimerProjet(p) {
      projetsAajouter.value = projetsAajouter.value.filter((x) => x.id !== p.id);
    }

    async function rechercherProjet() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projets/recherche/${projetARechercher.value}`)
        .then((res) => {
          projets.value = [...res.data];
        })
        .catch((error) => {
          console.log(error);
        });
    }

    async function ajouterProjetsCategorie() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/ajouterprojets`,
        {
          projetsAajouter: projetsAajouter.value.map((x) => x.id),
          idCategorie: idCategorie.value,
        },
      )
        .then(() => {
          // eslint-disable-next-line
          location.reload();
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function supprimerProjetCategorie(p) {
      // eslint-disable-next-line
      if (window.confirm('Voulez-vous supprimer cette participation?')) {
        await axios.delete(
          `${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/projet/${p}/supprimer`,
        )
          .then(() => {
            // eslint-disable-next-line
            location.reload();
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          });
      }
    }

    function afficherModifierProjetCategorieDialog(id) {
      nouvelleCategorie.idProjet = id;
      modifierProjetCategorieDialog.value = true;
    }

    async function modifierProjetCategorie() {
      await axios.put(
        `${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/projet/${nouvelleCategorie.idProjet}/modifiercategorie`,
        { idCategorie: nouvelleCategorie.idCategorie },
      )
        .then(() => {
          // eslint-disable-next-line
          location.reload();
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function modifierDescription() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/modifierdescription`,
        {
          description: descriptionAChanger.value,
        },
      )
        .then(() => {
          campagne.value.description = descriptionAChanger.value;
          ajouterProjetDialog.value = false;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data}`, {
            type: 'error',
          });
        })
        .finally(() => {
          modifierDescriptionDialog.value = false;
        });
    }

    async function modifierDates() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/outils/adi/campagne/${route.params.id}/modifdates`,
        datesAModifier.value,
      )
        .then(() => {
          campagne.value.debut = datesAModifier.value.dates.start;
          campagne.value.fin = datesAModifier.value.dates.end;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data}`, {
            type: 'error',
          });
        })
        .finally(() => {
          formulaireModifDatesDialog.value = false;
        });
    }

    async function chargerResultats(id) {
      await chargerResultatsCampagne(id);
      await chargerNbVotants(id);
    }

    onMounted(async () => {
      await chargerCampagne(route.params.id);
      await chargerVotesPerso(route.params.id);
      await chargerResultats(route.params.id);
      emitter.on('connexion', () => {
        chargerVotesPerso(route.params.id);
      });
    });

    return {
      connexion,
      apiUrl,
      campagne,
      selectionnerProjet,
      votesperso,
      votes,
      voter,
      annulerVote,
      projetARechercher,
      ajouterProjet,
      ajouterProjetDialog,
      rechercherProjet,
      projets,
      projetsAajouter,
      supprimerProjet,
      ajouterProjetsCategorie,
      idCategorie,
      resultatsCampagne,
      filtreCategorieResultats,
      modifierDescriptionDialog,
      descriptionAChanger,
      modifierDescription,
      publierResultats,
      nbVotants,
      chargerResultats,
      supprimerProjetCategorie,
      explicationsDialog,
      masks,
      datesAModifier,
      formulaireModifDatesDialog,
      modifierDates,
      afficherModifierProjetCategorieDialog,
      modifierProjetCategorieDialog,
      modifierProjetCategorie,
      nouvelleCategorie,
    };
  },
};
</script>

<style scoped>
.campagne {
  width: 95%;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
}

fieldset {
  border: none;
  background-color: #fffa;
  margin: 20px;
}

.header fieldset div {
  text-align: justify;
}

.listeProjets {
  display: flex;
}

.selectionne {
  border-color: #9eed9e;
  background-color: green;
  color: white;
  box-shadow: 0 0 10px #9ecaed;
}

legend img {
  height: 10px;
  margin: 0 2px;
  cursor: pointer;
}

.listeProjets ul {
  list-style-type: none;
  text-align: left;
}

.listeProjets h3 {
  display: inline;
}

.boutons {
  margin: 0 10px;
}

.boutons > * {
  margin: 0 10px;
}

.rubrique legend {
  font-weight: bold;
  font-size: 1.2em;
  font-variant: small-caps;
  padding: 10px;
  position: relative;
  margin-left: 50px;
}

.pli {
  position: absolute;
  top: 8px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  left: -20px;
  transform: rotate(315deg);
}

.description .pli {
  border-top: 15px solid #14907a;
}
.description > legend {
  background-image: linear-gradient(0deg, rgb(244, 243, 33) 40%, rgb(16, 255, 0) 100%);
}
.categories .pli {
  border-top: 15px solid #af0b41;
}
.categories > legend {
  background-image: linear-gradient(0deg, rgba(237,18,139,1) 26%, rgba(247,187,105,1) 75%);
}
.resultats .pli {
  border-top: 15px solid #25a6ec;
}
.resultats > legend {
  background-image: linear-gradient(0deg, rgba(80,255,251,1) 26%, rgba(183,255,242,1) 75%);
}

.description {
  font-size: 1.2em;
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
