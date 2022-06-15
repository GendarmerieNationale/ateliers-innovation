<template>
  <div class="outil adi">
    <header>
      <h1>
        <router-link
          class="titreOutil"
          :to="'/outils/adi'">
          Ateliers de l'Innovation
        </router-link>
      </h1>
      <nav>
        <ul>
          <li :data-badge="notifications.campagnes_non_votees?.nombre">
            <span
              v-if="$route.path === '/outils/adi/campagnes'"
              class="tooltip"
              data-tooltip-location="bottom"
              data-tooltip="Créer campagne">
              <pencil-plus-outline
                class="lien"
                @click="creer('Campagne')" />
            </span>
            <router-link
              :class="{active: $route.path.startsWith('/outils/adi/campagnes')}"
              :to="'/outils/adi/campagnes'">
              Campagnes
            </router-link>
          </li>
          <li>
            <span
              v-if="$route.path === '/outils/adi/repertoires'"
              class="tooltip"
              data-tooltip-location="bottom"
              data-tooltip="Créer Répertoire">
              <pencil-plus-outline
                class="lien"
                @click="creer('Repertoire')" />
            </span>
            <router-link
              :class="{active: $route.path === '/outils/adi/repertoires'}"
              :to="'/outils/adi/repertoires'">
              Répertoires
            </router-link>
          </li>
          <!-- <li :data-badge="notifications.nouveauxprojets?.nombre">
            <router-link
              :class="{active: $route.path === '/outils/adi/projets'}"
              :to="'/outils/adi/projets'">
              Projets
            </router-link>
          </li> -->
        </ul>
      </nav>
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
      v-if="rechercherProjetDialog"
      >
      <div
        class="fondOverlay"
        @click="rechercherProjetDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Chef de projet:</label>
            <recherche-annuaire
              v-model="criteresRecherche.chef"/>
          </div>
          <div>
            <label>Unité dont on demande l'avis:</label>
            <recherche-autocomplete
              v-model="criteresRecherche.avisdemande"
              :url="[
                'quiestce/multiple/unites'
                ]"/>
          </div>
          <div>
            <label>Texte à rechercher:</label>
            <input type="text" v-model="criteresRecherche.texte"/>
          </div>
          <div>
            <label>Statut:</label>
            <select v-model="criteresRecherche.statut">
              <option
                :value="null">
                Tous
              </option>
              <option
                v-for="(statutClair, statut) in {
                  NOUVEAU: 'Nouveau',
                  CANDIDAT: 'Sauvegardé',
                  POUR_AVIS: 'Pour avis des directions',
                  AJOURNE: 'Ajourné',
                  REFUSE: 'Refusé',
                  COMITE_SUIVI: 'En comité de suivi',
                  VALIDE: 'Validé',
                }"
                :key="`statut-${statut}`"
                :value="statut">
                {{ statutClair }}
              </option>
            </select>
          </div>
          <span
            @click="rechercherProjets"
            class="bouton bouton-petit">
            Rechercher
          </span>
        </div>
      </div>
    </div>
  </transition>

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
            <span
              class="bouton bouton-petit"
              @click="emitter.emit('creerProjet')">
              Nouveau projet
            </span>
            <span
              v-if="mesprojets.length > 0"
              class="selectionProjet">
              Sélectionner un projet:
              <select
                v-model="projetAenvoyer.id_projet">
                <option
                  v-for="(projet) in mesprojets.sort((a, b) => {
                    return (a.nom.toLowerCase() < b.nom.toLowerCase())
                    ? -1 : (a.nom.toLowerCase() > b.nom.toLowerCase()) ? 1 : 0;
                  })"
                  :key="`pro-${projet.id}`"
                  :value="projet.id">{{ projet.nom }}</option>
              </select>
            </span>
            <span
              v-else>
              Pas de projet à sélectionner, créez-en un en cliquant sur "Nouveau projet".
            </span>
          </div>
        </div>
        <div
          v-if="Object.values(projetAenvoyer).reduce((a, b) => a * (b.length || b), 1) !== 0">
          <span
            class="bouton"
            @click="envoyerProjet">
            Ajouter
          </span>
        </div>
      </div>
    </div>
  </transition>

</template>

<script>
import {
  getCurrentInstance,
  onMounted,
  inject,
  computed,
  ref,
  reactive,
} from 'vue';
import {
  useRouter,
} from 'vue-router';
import { useStore } from 'vuex';
import {
  PencilPlusOutline,
} from 'mdue';
import RechercheAnnuaire from '@/components/RechercheAnnuaire.vue';
import RechercheAutocomplete from '@/components/RechercheAutocomplete.vue';

export default {
  name: 'ADI',
  components: {
    PencilPlusOutline,
    RechercheAnnuaire,
    RechercheAutocomplete,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const connecte = computed(() => store.state.connexion.connecte);
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const notifications = computed(() => store.state.notifications);
    const rechercherProjetDialog = ref(false);
    const criteresRecherche = reactive({
      chef: {},
      texte: '',
      statut: null,
      avisdemande: {},
    });
    const ajouterProjetDialog = ref(false);
    const projetAenvoyer = reactive({
      id_projet: 0,
    });
    const mesprojets = ref([]);

    function creer(a) {
      emitter.emit(`creer${a}`);
    }

    /*
      On recherche:
      - les projets non assignés à une campagne,
      - les campagnes pour lesquelles je n'ai pas voté
    */
    async function chargerNotifs() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/notifications`)
        .then((res) => {
          store.dispatch('notifications/actualisernotifications', res.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }

    function rechercherProjets() {
      const params = [];
      Object.keys(criteresRecherche).forEach((cle) => {
        if (criteresRecherche[cle] && criteresRecherche[cle].length) {
          params.push(`${cle}=${criteresRecherche[cle]}`);
        }
        if (cle === 'avisdemande' && Object.keys(criteresRecherche[cle]).length > 0) {
          params.push(`avisdemande=${criteresRecherche[cle].code_unite}`);
        }
        if (cle === 'chef' && Object.keys(criteresRecherche[cle]).length > 0) {
          params.push(`chef=${criteresRecherche[cle].nigend}`);
        }
      });
      rechercherProjetDialog.value = false;
      router.push(`/outils/adi/projets${params.length ? `?${params.join('&')}` : ''}`);
    }

    async function chargerMesProjets() {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/mesprojets/chef`)
        .then((res) => {
          mesprojets.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function envoyerProjet() {
      await axios.post(`${process.env.VUE_APP_API_URL}/outils/adi/envoyerprojet`, projetAenvoyer)
        .then(() => {
          ajouterProjetDialog.value = false;
          toast('✅ Candidature déposée', {
            type: 'success',
          });
          router.push(`/projet/${projetAenvoyer.id_projet}/adi`);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    onMounted(async () => {
      await chargerNotifs();
      emitter.on('rechercherProjetADI', () => {
        rechercherProjetDialog.value = true;
      });
      emitter.on('afficherAjouterProjetDialog', async () => {
        await chargerMesProjets();
        ajouterProjetDialog.value = true;
      });
      emitter.on('projetCree', (projet) => {
        mesprojets.value.push(projet);
        projetAenvoyer.id_projet = projet.id;
      });
    });

    return {
      creer,
      notifications,
      rechercherProjetDialog,
      criteresRecherche,
      rechercherProjets,
      mesprojets,
      projetAenvoyer,
      envoyerProjet,
      ajouterProjetDialog,
      connecte,
    };
  },
};
</script>

<style>
h3 {
  margin: 10px 0 0 0;
}

.effacer, .ajouter {
  cursor: pointer;
}
</style>
