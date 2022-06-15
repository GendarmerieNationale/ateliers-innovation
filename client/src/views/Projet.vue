<template>
  <div class="outil projet">
    <header>
      <h1>
        <span
          v-if="projet.chef"
          @click="modifierVisibiliteDialog = true"
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Modifier visibilité">
          <Eye
            class="lien" />
        </span>
        <span
          v-if="projet.chef"
          @click="afficherModifierChampProjetDialog('nom')"
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Modifier nom">
          <pencil-outline
            class="lien" />
        </span>
        <router-link
          class="titreOutil"
          :to="`/projet/${$route.params.id}`">
          {{ projet.nom }}
        </router-link>
        <span
          class="mesroles listeCapsules">
          <template
            v-for="(role, i) in projet.mesroles"
            :key="`mesrole-${i}`">
            <span
              class="capsule"
              v-if="role.nom !== ''">
              {{ role.nom }}
            </span>
          </template>
        </span>
      </h1>
      <div>
        <nav>
          <ul>
            <li>
              <router-link
                :class="{active: $route.path.startsWith(`/projet/${$route.params.id}/membres`)}"
                :to="`/projet/${$route.params.id}/membres`">
                Membres
              </router-link>
            </li>
          </ul>
        </nav>
        <votes
          :voteId="$route.params.id"
          type="projet"
          :key="'projetVote-'+$route.params.id"/>
      </div>
    </header>
    <div class="contenu">
      <router-view
        :key="`${$route.fullpath}-${Math.random()}`">
      </router-view>
    </div>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherFormulaireFichiersJointsProjetDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherFormulaireFichiersJointsProjetDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <fichiers-joints
            multiple
            :lien="{type: 'sujet', id: 0}"
            v-model="fichiersJoints"/>
          <span
            v-if="fichiersJoints.length"
            @click="ajouterFichiers"
            class="bouton">
            Ajouter
          </span>
        </div>
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div
      class="overlay"
      v-if="modifierChampProjetDialog"
      >
      <div
        class="fondOverlay"
        @click="modifierChampProjetDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <textarea
              rows="5"
              cols="150" v-model="champ.valeur">
            </textarea>
          </div>
          <span
            @click="modifierchamp"
            class="bouton">
            Modifier
          </span>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherFormulaireAssocierMotcleDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherFormulaireAssocierMotcleDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Mots-clés:</label>
            <recherche-autocomplete
              mode="multiple"
              type="motcle"
              v-model="motscles"
              :url="[
                'motscles/recherche/projets'
                ]"
              creer="MotcleProjet"/>
          </div>
          <span
            @click="associerMotscles"
            class="bouton">
            Associer mot-clé
          </span>
        </div>
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div
      class="overlay"
      v-if="creerMotcleProjetDialog"
      >
      <div
        class="fondOverlay"
        @click="creerMotcleProjetDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Mot clé:</label>
            <input
            type="text"
            v-model="motcleAAjouter"/>
          </div>
          <span
            @click="ajouterMotcle"
            class="bouton">
            Créer
          </span>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherFormulaireAjouterOmnibusDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherFormulaireAjouterOmnibusDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Identifiant du projet sur Omnibus:</label>
            <input
            type="number"
            v-model="omnibusAAjouter.id"/>
            <span
              v-if="omnibusAAjouter.nom.length === 0"
              @click="verifierOmnibus"
              class="bouton bouton-petit">
              Vérifier
            </span>
          </div>
          <div>
            <div
              v-if="omnibusAAjouter.nom.length > 0"
              @click="ajouterOmnibus"
              class="bouton bouton-petit">
              Ajouter le projet "{{ omnibusAAjouter.nom }}"
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="modifierVisibiliteDialog"
      >
      <div
        class="fondOverlay"
        @click="modifierVisibiliteDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Visibilité:</label>
            <input
              v-model="visibiliteAModifier"
              type="radio"
              name="visibilite"
              id="visibilitePUBLIC"
              value="PUBLIC"/>
            <label
              for="visibilitePUBLIC">
              Publique
            </label>
            <input
              v-model="visibiliteAModifier"
              type="radio"
              name="visibilite"
              id="visibiliteCONNECTE"
              value="CONNECTE"/>
            <label
              for="visibiliteCONNECTE">
              Connexion requise
            </label>
            <input
              v-model="visibiliteAModifier"
              type="radio"
              name="visibilite"
              id="visibiliteSEMI-PRIVE"
              value="SEMI-PRIVE"/>
            <label
              for="visibiliteSEMI-PRIVE">
              Semi-privée
            </label>
            <input
              v-model="visibiliteAModifier"
              type="radio"
              name="visibilite"
              id="visibilitePRIVE"
              value="PRIVE"/>
            <label
              for="visibilitePRIVE">
              Privée
            </label>
          </div>
          <div>
            <div
              class="messagesVisibilite">
              <div
                v-if="visibiliteAModifier === 'PUBLIC'"
                class="msg info">
                Tout le monde verra tout le contenu du projet.
              </div>
              <div
                v-if="visibiliteAModifier === 'CONNECTE'"
                class="msg info">
                Tous les utilisateurs connectés et donc disposant d'un NIGEND et identifiés
                pourront voir l'ensemble des informations.
              </div>
              <div
                v-if="(visibiliteAModifier === 'PUBLIC') || (visibiliteAModifier === 'CONNECTE')"
                class="msg avertissement important">
                Attention, dans le cadre de mesures de propriété intellectuelle
                (dépôt de brevet, etc.), cela peut être une cause de refus.
                Rapprochez-vous du Service de la Transformation pour avoir davantage
                d'explications.
              </div>
              <div
                v-if="visibiliteAModifier === 'SEMI-PRIVE'"
                class="msg info">
                Tout le monde ne voit que l'existence du projet ainsi que son chef et peut demander à
                tout voir. Ceux dont vous aurez accepté la demande verront tout le projet.
              </div>
              <div
                v-if="visibiliteAModifier === 'PRIVE'"
                class="msg info">
                Personne ne verra le projet (ni même son existence) hormis les
                membres et ceux à qui vous aurez donné l'accès, en plus des
                règles particulières comme dans le cas d'une FPPI, par exemple.
              </div>
            </div>
          </div>
          <div
            v-if="['PRIVE','SEMI-PRIVE'].includes(visibiliteAModifier)">
            <fieldset>
              <legend>
                Visibilités
              </legend>
              <div
                class="visibilites">
                <table
                  class="tableau">
                  <thead>
                    <tr>
                      <th>
                      </th>
                      <th>
                        Personne ou unité
                      </th>
                      <th>
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="v in projet.visibilite.liste"
                      :key="`visibilite-${v.type}-${v.identifiant}`">
                      <td>
                        <span
                          v-if="['ACCEPTE','AJOUTE'].includes(v.precision)"
                          @click="traiterVisibilite(v, 'REVOQUE')"
                          class="icone tooltip"
                          data-tooltip-location="top"
                          data-tooltip="Révoquer la visibilité">
                          ❌
                        </span>
                        <template
                          v-if="v.precision === 'DEMANDE'">
                          <span
                            @click="traiterVisibilite(v, 'ACCEPTE')"
                            class="icone tooltip"
                            data-tooltip-location="top"
                            data-tooltip="Accepter la demande">
                            ✅
                          </span>
                          <span
                            @click="traiterVisibilite(v, 'REFUSE')"
                            class="icone tooltip"
                            data-tooltip-location="top"
                            data-tooltip="Refuser la demande">
                            ⛔
                          </span>
                        </template>
                      </td>
                      <td>
                        <qui-est-ce
                          :nigendEnvoye="v.identifiant"
                          :type="v.type === 'nigend' ? 'personnels' : 'unites'"
                          :key="`${v.type}-${v.identifiant}`">
                        </qui-est-ce>
                      </td>
                      <td>
                        {{ v.precision }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div>
                  <input
                    type="radio"
                    v-model="visibiliteAAjouter.type"
                    id="radioVisibiliteNigend"
                    value="nigend">
                  <label for="radioVisibiliteNigend">Personne</label>
                  <input
                    type="radio"
                    v-model="visibiliteAAjouter.type"
                    id="radioVisibiliteUnite"
                    value="unite">
                  <label for="radioVisibiliteUnite">Unite</label>
                  <recherche-autocomplete
                    v-model="visibiliteAAjouter.aAjouter"
                    :url="[
                      `quiestce/multiple/${visibiliteAAjouter.type === 'unite' ? 'unites' : 'personnels'}`
                      ]"/>
                  <div
                    v-if="visibiliteAAjouter.type.length && Object.keys(visibiliteAAjouter.aAjouter).length"
                    class="bouton bouton-petit"
                    @click="ajouterVisibilite">
                    Ajouter à la liste
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <div>
            <div
              @click="modifierTypeVisibilite"
              class="bouton bouton-petit">
              Modifier la visibilité
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

</template>

<script>
import {
  defineComponent,
  onMounted,
  getCurrentInstance,
  ref,
  inject,
  computed,
  watch,
  reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  PencilOutline,
  Eye,
} from 'mdue';
import Votes from '@/components/Votes.vue';
import FichiersJoints from '@/components/FichiersJoints.vue';
import RechercheAutocomplete from '@/components/RechercheAutocomplete.vue';
import QuiEstCe from '@/components/QuiEstCe.vue';

export default defineComponent({
  name: 'Projet',
  components: {
    Votes,
    FichiersJoints,
    PencilOutline,
    Eye,
    RechercheAutocomplete,
    QuiEstCe,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const axios = inject('$axios');
    const toast = inject('$toast');
    const apiUrl = process.env.VUE_APP_API_URL;
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const afficherFormulaireFichiersJointsProjetDialog = ref(false);
    const fichiersJoints = ref([]);
    const creation = ref(false);
    const modifierChampProjetDialog = ref(false);
    const champ = ref({
      champ: '',
      valeur: '',
    });
    const afficherFormulaireAssocierMotcleDialog = ref(false);
    const motscles = ref([]);
    const motcleAAjouter = ref('');
    const creerMotcleProjetDialog = ref(false);
    const afficherFormulaireAjouterOmnibusDialog = ref(false);
    const omnibusAAjouter = reactive({
      type: '',
      id: 0,
      nom: '',
    });
    const modifierVisibiliteDialog = ref(false);
    const visibiliteAModifier = ref('');
    const visibiliteAAjouter = reactive({
      type: 'nigend',
      aAjouter: {},
    });

    async function chargerProjet(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/projet/${id}`)
        .then((res) => {
          visibiliteAModifier.value = res.data.visibilite;
          Object.keys(res.data).forEach(async (cle) => {
            await store.dispatch('projet/changerChamp', {
              champ: cle,
              valeur: res.data[cle],
            });
          });
        })
        .catch(() => {
          router.push({ path: '/introuvable', replace: true });
        })
        .finally(() => {
        });
    }

    async function chargerVisibilites(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/projet/${id}/visibilite/liste`)
        .then(async (res) => {
          store.dispatch('projet/modifierVisibilites', res.data);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function ajouterFichiers() {
      if (creation.value) {
        toast('⚠️ Ajout en cours', {
          type: 'error',
        });
      } else {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/joindrefichiers`,
          { fichiersJoints: fichiersJoints.value },
        )
          .then((res) => {
            emitter.emit('fichiersProjetAjoutes', res.data);
            // fichiersJoints.value = fichiersJoints.value.concat(res.data);
            toast('✅ Fichiers ajoutés', {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
            afficherFormulaireFichiersJointsProjetDialog.value = false;
            creation.value = false;
          });
      }
    }

    function afficherModifierChampProjetDialog(type) {
      champ.value.champ = type;
      champ.value.valeur = projet.value[type];
      modifierChampProjetDialog.value = true;
    }

    async function modifierchamp() {
      const c = champ.value;
      await axios.put(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/modifierchamp`,
        c,
      )
        .then(() => {
          store.dispatch('projet/changerChamp', {
            champ: c.champ,
            valeur: c.valeur,
          });
          modifierChampProjetDialog.value = false;
          toast('✅ Champ modifié', {
            type: 'success',
          });
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerFichiers(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/projet/${id}/fichiers`)
        .then(async (res) => {
          store.dispatch('projet/initialiserFichiers', res.data);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function ajouterMotcle() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Ajout en cours');
      }
      if (motcleAAjouter.value.length === 0) {
        erreur.push('Veuillez entrer un nom');
      }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/motscles/ajouter/projets`,
          { motcle: motcleAAjouter.value },
        )
          .then((res) => {
            emitter.emit('motCleProjetAjoute', res.data);
            toast('✅ Mot-clé ajouté', {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
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

    async function dissocierMotcle(m) {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr de vouloir dissocier ce mot-clé du contact?')) {
        await axios.delete(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/motscles/dissocier`,
          { data: { idMotcle: m } },
        )
          .then((res) => {
            store.dispatch('projet/dissocierMotcle', { id: res.data.motcle.id_motcle });
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
    }

    async function associerMotscles() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Ajout en cours');
      }
      if (motscles.value.length === 0) {
        erreur.push('Veuillez sélectionner un mot-clé');
      }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/motscles/associer`,
          { motscles: motscles.value },
        )
          .then((res) => {
            store.dispatch('projet/associerMotsCles', res.data.motscles);
            afficherFormulaireAssocierMotcleDialog.value = false;
            toast(`✅ ${res.data.msg}`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
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

    async function chargerMembres(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/projet/${id}/membres`)
        .then(async (res) => {
          store.dispatch('projet/initialiserMembres', res.data);
        })
        .catch((e) => {
          console.log(e);
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerMotscles(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/projet/${id}/motscles`)
        .then(async (res) => {
          store.dispatch('projet/initialiserMotscles', res.data.motscles);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerOmnibus(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/projet/${id}/omnibus`)
        .then(async (res) => {
          store.dispatch('projet/initialiserOmnibus', res.data);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function verifierOmnibus() {
      await axios.get(
        `${process.env.VUE_APP_API_URL}/omnibus/${omnibusAAjouter.id}`,
      )
        .then(async (res) => {
          omnibusAAjouter.nom = res.data.nom;
          omnibusAAjouter.description = res.data.description;
          omnibusAAjouter.web_url = res.data.web_url;
        })
        .catch((e) => {
          omnibusAAjouter.nom = '';
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    watch(() => omnibusAAjouter.id, () => {
      omnibusAAjouter.nom = '';
    });

    async function ajouterOmnibus() {
      // eslint-disable-next-line
      if (window.confirm(`Voulez-vous ajouter le projet "${omnibusAAjouter.nom}"?`)) {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/omnibus`,
          omnibusAAjouter,
        )
          .then(async (res) => {
            afficherFormulaireAjouterOmnibusDialog.value = false;
            store.dispatch('projet/ajouterOmnibus', {
              id_omnibus: omnibusAAjouter.id,
              nom: omnibusAAjouter.nom,
              description: omnibusAAjouter.description,
              web_url: omnibusAAjouter.web_url,
              type: omnibusAAjouter.type,
              fichiers: res.data.fichiers,
            });
            omnibusAAjouter.nom = '';
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
    }

    async function modifierTypeVisibilite() {
      await axios.put(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/visibilite`,
        { visibilite: visibiliteAModifier.value },
      )
        .then((res) => {
          store.dispatch('projet/modifierTypeVisibilite', visibiliteAModifier.value);
          modifierVisibiliteDialog.value = false;
          toast(`✅ ${res.data.msg}`, {
            type: 'success',
          });
        })
        .catch((e) => {
          visibiliteAModifier.value = projet.value.visibilite.type;
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    // pour l'instant on ne s'en sert pas, mais ça viendra
    // async function supprimerVisibilite(v) {
    //   await axios.delete(
    //     `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/visibilite`,
    //     {
    //       data: {
    //         visibilite: v,
    //       },
    //     },
    //   )
    //     .then((res) => {
    //       store.dispatch('projet/supprimerVisibilite', v);
    //       toast(`✅ ${res.data.msg}`, {
    //         type: 'success',
    //       });
    //     })
    //     .catch((e) => {
    //       toast(`⚠️ ${e.response.data.msg}`, {
    //         type: 'error',
    //       });
    //     });
    // }

    async function traiterVisibilite(v, traitement) {
      await axios.put(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/visibilite/traiter`,
        {
          type: v.type,
          identifiant: v.identifiant,
          traitement,
        },
      )
        .then((res) => {
          store.dispatch('projet/traiterVisibilite', res.data.visibilite);
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

    async function ajouterVisibilite() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/visibilite`,
        {
          type: visibiliteAAjouter.type,
          identifiant: visibiliteAAjouter.type === 'nigend'
            ? visibiliteAAjouter.aAjouter.nigend : visibiliteAAjouter.aAjouter.unite,
        },
      )
        .then((res) => {
          store.dispatch('projet/ajouterVisibilite', res.data.visibilite);
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

    async function chargerDemandeVisibilite() {
      await axios.get(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/mavisibilite`,
      )
        .then((res) => {
          store.dispatch('projet/modifierMaVisibilite', res.data);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    watch(() => visibiliteAAjouter.type, () => {
      visibiliteAAjouter.aAjouter = {};
    });

    async function initProjet(id) {
      await chargerProjet(id);
      if (projet.value.visibilite.mavisibilite === 'TOTALE') {
        await chargerMembres(id);
        await chargerMotscles(id);
        await chargerFichiers(id);
        await chargerOmnibus(id);
      }
      if (projet.value.visibilite.mavisibilite === 'PARTIELLE') {
        await chargerDemandeVisibilite(id);
      }
      if (projet.value.chef) {
        await chargerVisibilites(id);
      }
    }

    onMounted(async () => {
      await initProjet(route.params.id);
      emitter.on('modificationChampProjet', (type) => {
        afficherModifierChampProjetDialog(type);
      });
      emitter.on('participationADI', (p) => {
        // quand on change la participation aux ADI
        store.dispatch('projet/changerChamp', {
          champ: 'adi',
          valeur: p,
        });
      });
      emitter.on('afficherFormulaireFichiersJointsProjet', () => {
        afficherFormulaireFichiersJointsProjetDialog.value = true;
      });
      emitter.on('afficherFormulaireAjouterMotcle', () => {
        afficherFormulaireAssocierMotcleDialog.value = true;
      });
      emitter.on('fichiersProjetAjoutes', (f) => {
        store.dispatch('projet/ajouterFichiers', f);
      });
      emitter.on('fichierSupprime', (id) => {
        store.dispatch('projet/supprimerFichier', id);
      });
      emitter.on('creerMotcleProjet', () => {
        creerMotcleProjetDialog.value = true;
      });
      emitter.on('motCleProjetAjoute', () => {
        creerMotcleProjetDialog.value = false;
      });
      emitter.on('afficherDissocierMotCleDialog', (m) => {
        dissocierMotcle(m);
      });
      emitter.on('afficherFormulaireAjouterOmnibus', (m) => {
        omnibusAAjouter.type = m;
        omnibusAAjouter.id = 0;
        afficherFormulaireAjouterOmnibusDialog.value = true;
      });
    });

    watch(() => route.params.id, async () => {
      if (route.path.startsWith('/projet/')) {
        await initProjet(route.params.id);
      }
    });

    return {
      apiUrl,
      projet,
      afficherFormulaireFichiersJointsProjetDialog,
      fichiersJoints,
      ajouterFichiers,
      afficherModifierChampProjetDialog,
      modifierChampProjetDialog,
      modifierchamp,
      champ,
      afficherFormulaireAssocierMotcleDialog,
      motscles,
      creerMotcleProjetDialog,
      motcleAAjouter,
      ajouterMotcle,
      associerMotscles,
      dissocierMotcle,
      afficherFormulaireAjouterOmnibusDialog,
      omnibusAAjouter,
      ajouterOmnibus,
      verifierOmnibus,
      modifierVisibiliteDialog,
      visibiliteAModifier,
      modifierTypeVisibilite,
      // supprimerVisibilite,
      traiterVisibilite,
      visibiliteAAjouter,
      ajouterVisibilite,
    };
  },
});
</script>

<style scoped>
.votes {
  display: inline-block;
  transform: scale(0.7);
}

.icone {
  height: 15px;
  cursor: pointer;
  margin: 0 5px;
}

.mesroles {
  display: inline;
  font-size: 0.5em;
}

.messagesVisibilite {
  width: 50vw;
}

.messagesVisibilite > div {
  margin: 5px;
}

.visibilites {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.visibilites > * {
  max-width: 45%;
}

</style>
