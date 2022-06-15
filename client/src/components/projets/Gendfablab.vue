<template>
  <div
    class="gendfablabProjet">
    <h1>
      GendFabLab
    </h1>
    <h2>
      <span
        class="msg erreur important"
        v-if="statut === 'NON_HOMOLOGUE'">
        Non homologué
      </span>
      <span
        class="msg erreur important"
        v-if="statut === 'HOMOLOGATION_EN_COURS'">
        Homologation en cours
      </span>
      <span
        class="msg succes important"
        v-if="statut === 'HOMOLOGUE'">
        Homologué
      </span>
    </h2>
    <template
      v-if="projet.omnibus.filter((p) => p.type === 'gendfablab').length > 0">
      <fieldset>
        <legend>
          <div class="pli"></div>
          <span class="titre">Liste des projets Omnibus associés</span>
        </legend>
        <tableau-omnibus
          :projets="projet.omnibus.filter((p) => p.type === 'gendfablab')"
          :chef="projet.chef"
          :afficherPieces="false"/>
        <div
          class="bouton bouton-petit"
          @click="emitter.emit('afficherFormulaireAjouterOmnibus', 'gendfablab')">
          Ajouter projet d'Omnibus
        </div>
      </fieldset>
      <fieldset>
        <legend>
          <div class="pli"></div>
          <span class="titre">Diaporama</span>
        </legend>
        <div
          v-if="projet.fichiers.filter((x) => x.type.includes('image')).length"
          class="caroussel">
          <Splide
            @splide:click="test"
            :options="options">
            <SplideSlide
              v-for="(photo, i) in projet.fichiers.filter((x) => x.type.includes('image'))"
              :key="`photosplide-${i}`"
              :data-img="`${apiUrl}/fichiers/telechargement
/${photo.id}/${photo.nom}/miniature`">
              <div
                class="elementCaroussel">
                <img
                  :src="`${apiUrl}/fichiers/telechargement
/${photo.id}/${photo.nom}/miniature`"/>
                <span
                  class="description">
                  {{ photo.description }}
                </span>
              </div>
            </SplideSlide>
          </Splide>
        </div>
        <div
          v-else
          class="msg avertissement important">
          Pas d'image jointe au fichier
        </div>
      </fieldset>
      <fieldset
        class="pieces">
        <legend>
          <div class="pli"></div>
          <span class="titre">Liste des pièces</span>
        </legend>
        <template
          v-for="piece in pieces"
          :key="`piece-${piece}`">
          <h3
            class="titre">
            <span>
              {{ piece.nom }}
            </span>
            <a
              :href="`${piece.web_url}/-/blob/master/${piece.nom}`"
              target="_blank">
              <span
                class="bouton bouton-petit">
                Voir en 3D
              </span>
            </a>
          </h3>
          <gendfablab-impression
            :id="piece.id"
            :nom="piece.nom.replace(/\.[^/.]+$/, '')"
            />
          <hr />
        </template>
        <!--
        <hr />
        {{ pieces }}
        <hr />
        {{ projet.omnibus }}
      -->
      </fieldset>
      <fieldset>
        <legend>
          <div class="pli"></div>
          <span class="titre">Questionnaire</span>
        </legend>
        <ul>
          <li>
            Parc ou système auquel appartient la pièce:<br />
            <textarea
              cols="100"
              rows="5"
              v-model="questionnaire.parc">
            </textarea>
          </li>
          <li>
            Dans quel but avez-vous créé cette pièce?<br />
            <textarea
              cols="100"
              rows="5"
              v-model="questionnaire.but">
            </textarea>
          </li>
          <li>
            Est-ce une copie d'une pièce d'origine?
            <input
              type="radio"
              v-model="questionnaire.copieOrigine"
              id="copieOrigineOui"
              :value="true">
            <label for="copieOrigineOui">Oui</label>
            <input
              type="radio"
              v-model="questionnaire.copieOrigine"
              id="copieOrigineNon"
              :value="false">
            <label for="copieOrigineNon">Non</label>
          </li>
          <li>
            Avez-vous modifié ou amélioré une pièce d'origine?
            <input
              type="radio"
              v-model="questionnaire.modifAmelio.valeur"
              id="modifAmelioOui"
              :value="true">
            <label for="modifAmelioOui">Oui</label>
            <input
              type="radio"
              v-model="questionnaire.modifAmelio.valeur"
              id="modifAmelioNon"
              :value="false">
            <label for="modifAmelioNon">Non</label>
            <template
              v-if="questionnaire.modifAmelio.valeur">
              <br />
              <i>Quelle(s) caractéristique(s) avez-vous modifiée(s) ou améliorée(s)?</i>
              <br />
              <textarea
                cols="100"
                rows="5"
                v-model="questionnaire.modifAmelio.precision">
              </textarea>
            </template>
          </li>
          <li>
            Certains éléments de la pièce sont-ils issus d’un ou plusieurs plans réalisés par des tiers?
            <input
              type="radio"
              v-model="questionnaire.plansTiers.valeur"
              id="plansTiersOui"
              :value="true">
            <label for="plansTiersOui">Oui</label>
            <input
              type="radio"
              v-model="questionnaire.plansTiers.valeur"
              id="plansTiersNon"
              :value="false">
            <label for="plansTiersNon">Non</label>
            <template
              v-if="questionnaire.plansTiers.valeur">
              <br />
              <i>Préciser quels éléments, la source et la licence du ou des plans:</i>
              <br />
              <textarea
                cols="100"
                rows="5"
                v-model="questionnaire.plansTiers.precision">
              </textarea>
            </template>
          </li>
          <li>
            Est-ce une invention?
            <input
              type="radio"
              v-model="questionnaire.invention"
              id="inventionOui"
              :value="true">
            <label for="inventionOui">Oui</label>
            <input
              type="radio"
              v-model="questionnaire.invention"
              id="inventionNon"
              :value="false">
            <label for="inventionNon">Non</label>
          </li>
        </ul>
        <div
          class="bouton bouton-petit"
          @click="sauvegarder">
          Sauvegarder les changements
        </div>
      </fieldset>
    </template>
    <template
      v-else>
      <div
        class="msg avertissement important">
        Pas de projet sur Omnibus. Pour répondre au questionnaire d'homologation,
        veuillez d'abord ajouter un projet d'Omnibus en cliquant sur le bouton suivant:
      </div>
      <div
        class="bouton bouton-petit"
        @click="emitter.emit('afficherFormulaireAjouterOmnibus', 'gendfablab')">
        Ajouter projet d'Omnibus
      </div>
    </template>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="voirPhotoDialog"
      >
      <div
        class="fondOverlay"
        @click="voirPhotoDialog = false">
      </div>
      <div
        class="contenuFormulaireOverlay">
        <div
          class="wrapper">
          <img :src="photoURL" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  defineComponent,
  onMounted,
  ref,
  inject,
  computed,
  // watch,
  reactive,
} from 'vue';
import {
  useRoute,
} from 'vue-router';
import { useStore } from 'vuex';
import TableauOmnibus from '@/components/projets/components/TableauOmnibus.vue';
import GendfablabImpression from '@/components/projets/components/GendfablabImpression.vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
// eslint-disable-next-line
import '@splidejs/splide/dist/css/themes/splide-skyblue.min.css';

export default defineComponent({
  name: 'GendfablabProjet',
  components: {
    TableauOmnibus,
    GendfablabImpression,
    Splide,
    SplideSlide,
  },
  setup() {
    const apiUrl = process.env.VUE_APP_API_URL;
    const route = useRoute();
    const axios = inject('$axios');
    const toast = inject('$toast');
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const questionnaire = reactive({
      parc: '',
      but: '',
      copieOrigine: false,
      modifAmelio: {
        valeur: false,
        precision: '',
      },
      plansTiers: {
        valeur: false,
        precision: '',
      },
      invention: false,
    });
    const statut = ref('NON_HOMOLOGUE');
    const pieces = computed(() => {
      console.log('Génération des pièces');
      return store
        .state
        .projet
        .omnibus
        .filter((p) => p.type === 'gendfablab')
        .map((x) => x.fichiers.map((f) => ({
          web_url: x.web_url,
          id: x.id_omnibus,
          nom: f.name,
        })))
        .flat();
      // .map((x) => x.name.replace(/\.[^/.]+$/, ''));
    });
    const options = {
      autoplay: true,
      interval: 2000,
      type: 'loop',
      rewind: true,
      width: '50vw',
      perPage: 3,
      perMove: 1,
    };
    const voirPhotoDialog = ref(false);
    const photoURL = ref('');

    async function chargerGendfablab() {
      await axios.get(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/gendfablab`,
      )
        .then((res) => {
          statut.value = res.data.statut;
          questionnaire.parc = res.data.parc;
          questionnaire.but = res.data.but;
          questionnaire.copieOrigine = res.data.copieorigine;
          questionnaire.modifAmelio.valeur = res.data.modifamelio.length > 0;
          questionnaire.modifAmelio.precision = res.data.modifamelio;
          questionnaire.plansTiers.valeur = res.data.planstiers.length > 0;
          questionnaire.plansTiers.precision = res.data.planstiers;
          questionnaire.invention = res.data.invention;
          delete questionnaire.statut;
          delete questionnaire.id_projet;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function sauvegarder() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/gendfablab`,
        questionnaire,
      )
        .then((res) => {
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

    function affichePhoto(url) {
      voirPhotoDialog.value = true;
      photoURL.value = url;
    }

    function test(e) {
      console.log(e);
      /*
      @click="affichePhoto(`${apiUrl}/fichiers/telechargement
/${photo.id}/${photo.nom}`)"
      */
    }

    onMounted(async () => {
      await chargerGendfablab();
    });

    return {
      apiUrl,
      projet,
      questionnaire,
      statut,
      sauvegarder,
      pieces,
      options,
      affichePhoto,
      voirPhotoDialog,
      photoURL,
      test,
    };
  },
});
</script>

<style scoped>
.gendfablabProjet {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

legend .titre {
  margin-left: 10px;
}

.gendfablabProjet > fieldset {
  width: 90%;
  background-color: rgba(255, 255, 255, 0.7);
  text-align: justify;
  margin: 10px 0;
}

.gendfablabProjet > fieldset > legend {
  font-weight: bold;
  font-size: 1.2em;
  font-variant: small-caps;
  padding: 10px;
  position: relative;
  margin-left: 50px;
  color: white;
  background-image: linear-gradient(0deg, rgb(1,172,222) 40%, rgb(16,131,189) 100%);
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
  border-top: 15px solid #005091;
}

.pieces .titre {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.caroussel {
  /* width: 100%;
  margin: 0 auto; */
  justify-content: center;
  display: flex;
}

.caroussel .description {
  position: absolute;
  bottom: 0;
  width: 90%;
  background-color: #fffb;
  font-variant: italic;
  text-align: center;
}

.elementCaroussel {
  display: flex;
  height: 90%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  margin-bottom: 50px;
}
</style>
