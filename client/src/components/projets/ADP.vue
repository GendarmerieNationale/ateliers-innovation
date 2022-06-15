<template>
  <div
    v-if="Object.keys(adp).length !== 0"
    class="adpProjet">
    <fieldset
      class="objectif">
      <legend>
        <div class="pli"></div>
        Objectif
      </legend>
      <fieldset
        class="concepteurs">
        <legend>
          Les Concepteurs
        </legend>
        <ul class="listeconcepteurs">
          <li
            v-for="(membre, i) in projet.membres"
            :key="`membre-${i}`"
            class="concepteur">
            <span
              v-if="membre.photo"
              class="photoconcepteur tooltip"
              @click="revoquerAgorha(membre.personne)"
              :data-tooltip="membre.personne === connexion.nigend ? 'Cliquez pour révoquer le droit de récupérer la photo d\'Agorh@' : null">
              <img
                v-if="membre.photo === '1'"
                src="~@/assets/img/chargement.png"/>
              <img
                v-else
                :src="`data:image/image/png;base64,${membre.photo}`"/>
            </span>
            <span
              v-else
              class="photoconcepteur tooltip"
              @click="autoriserAgorha(membre.personne)"
              :data-tooltip="membre.personne === connexion.nigend ? 'Cliquez pour donner le droit de récupérer la photo d\'Agorh@' : 'Seule la personne peut donner le droit d\'afficher la photo'">
              <img
                src="~@/assets/img/avatar.svg"/>
            </span>
            <div class="detailsconcepteur">
              <qui-est-ce
                :nigendEnvoye="membre.personne"
                :key="'NIGEND-'+membre.personne">
              </qui-est-ce>
              <div>
                <span
                  class="roles listeCapsules">
                  <template
                    v-for="(role, i) in membre.roles"
                    :key="`mesrole-${i}`">
                    <span
                      class="capsule"
                      v-if="role.nom !== ''">
                      {{ role.nom }}
                    </span>
                  </template>
                </span>
              </div>
            </div>
          </li>
        </ul>
      </fieldset>
      <p
        v-for="(p, i) in adp.objectifs?.split('\n')"
        :key="`obj-p-${i}`">
        {{ p }}
      </p>
    </fieldset>
    <div
      class="enchainement enchainement1">
      <div class="cerclepointille" />
      <div class="badge-rond">
        <div class="sousbadge">
          <img
            src="~@/assets/img/cible.png" />
        </div>
      </div>
    </div>
    <fieldset
      class="presentation">
      <legend>
        <div class="pli"></div>
        Présentation
      </legend>
      <!-- <div class="emplacementBadge">
        <div class="badge-rond">
          <div class="sousbadge">
            <img
              src="~@/assets/img/documentspunaise.png" />
          </div>
        </div>
      </div> -->
      <p
        v-for="(p, i) in adp.presentation?.split('\n')"
        :key="`obj-p-${i}`">
        {{ p }}
      </p>
    </fieldset>
    <div
      class="enchainement enchainement2">
      <div class="cerclepointille" />
      <div class="badge-rond">
        <div class="sousbadge">
          <img
            src="~@/assets/img/stats.png" />
        </div>
      </div>
    </div>
    <fieldset
      class="benefices">
      <legend>
        <div class="pli"></div>
        Bénéfices
      </legend>
      <p
        v-for="(p, i) in adp.benefices?.split('\n')"
        :key="`obj-p-${i}`">
        {{ p }}
      </p>
    </fieldset>
    <fieldset
      v-if="projet.fichiers.length > 0"
      class="fichiers">
      <legend>
        Fichiers
      </legend>
      <ul>
        <li
          v-for="(fichier, i) in projet.fichiers"
          :key="`fichier-${i}`">
          <a
            :href="apiUrl+'/fichiers/telechargement/'+fichier.id+'/'+fichier.nom">
            📄 {{ fichier.description }}
          </a>
        </li>
      </ul>
    </fieldset>
    <fieldset
      v-if="projet.fichiers.filter((x) => x.type.includes('image')).length > 0"
      class="phototheque">
      <legend>
        Photothèque
      </legend>
      <Splide
        :options="options">
        <SplideSlide
          v-for="(photo, i) in projet.fichiers.filter((x) => x.type.includes('image'))"
          :key="`photosplide-${i}`">
          <div
            class="elementCaroussel"
            @click="affichePhoto(`${apiUrl}/fichiers/telechargement
/${photo.id}/${photo.nom}`)">
            <img
              :src="`${apiUrl}/fichiers/telechargement
/${photo.id}/${photo.nom}/miniature`"/>
          </div>
        </SplideSlide>
      </Splide>
    </fieldset>
    <footer>
      <div>
        <router-link :to="`/outils/adi/adp/${adp.annee_adp}`">
          <img
            class="logoADP"
            src="~@/assets/img/outils/adi/logo_adp.png" />
        </router-link>
      </div>
    </footer>
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
  inject,
  ref,
  computed,
} from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import QuiEstCe from '@/components/QuiEstCe.vue';
// eslint-disable-next-line
import '@splidejs/splide/dist/css/themes/splide-skyblue.min.css';

export default defineComponent({
  name: 'ADP',
  components: {
    QuiEstCe,
    Splide,
    SplideSlide,
  },
  setup() {
    const store = useStore();
    const connexion = computed(() => store.state.connexion);
    const projet = computed(() => store.state.projet);
    const apiUrl = process.env.VUE_APP_API_URL;
    const route = useRoute();
    const router = useRouter();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const adp = ref({});
    const voirPhotoDialog = ref(false);
    const photoURL = ref('');
    const options = {
      autoplay: true,
      interval: 1000,
      type: 'loop',
      rewind: true,
      width: '50vw',
      perPage: 3,
      perMove: 1,
    };

    function affichePhoto(url) {
      voirPhotoDialog.value = true;
      photoURL.value = url;
    }

    async function autoriserAgorha(nigend) {
      // eslint-disable-next-line
      if ((nigend === connexion.value.nigend) && window.confirm('Autorisez-vous à utiliser la photo de votre FIR?')) {
        await axios.post(`${process.env.VUE_APP_API_URL}/projets/autoriseragorha`)
          .then((res) => {
            projet.value.membres.find((m) => m.personne === nigend).photo = '1';
            toast(`✅ ${res.data}`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          });
      }
    }

    async function revoquerAgorha(nigend) {
      // eslint-disable-next-line
      if ((nigend === connexion.value.nigend) && window.confirm('Révoquez-vous l\'autorisation de l\'utilisation de la photo de votre FIR?')) {
        await axios.post(`${process.env.VUE_APP_API_URL}/projets/revoqueragorha`)
          .then((res) => {
            projet.value.membres.find((m) => m.personne === nigend).photo = null;
            toast(`✅ ${res.data}`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          });
      }
    }

    async function chargerADP(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${id}/adp`)
        .then(async (res) => {
          adp.value = { ...res.data };
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data}`, {
            type: 'error',
          });
          router.push({ path: `/projet/${id}`, replace: true });
        });
    }

    onMounted(async () => {
      await chargerADP(route.params.id);
    });

    return {
      projet,
      connexion,
      apiUrl,
      adp,
      voirPhotoDialog,
      affichePhoto,
      photoURL,
      autoriserAgorha,
      revoquerAgorha,
      options,
    };
  },
});
</script>

<style scoped>
.adpProjet {
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 5%;
  padding-top: 20px;
}

legend {
  font-weight: bold;
  font-size: 1.2em;
  font-variant: small-caps;
  padding: 10px;
  position: relative;
}

.objectif > legend {
  margin-left: 50px;
  background-image: linear-gradient(0deg, rgb(244, 243, 33) 40%, rgb(16, 255, 0) 100%);
}
.presentation legend {
  margin-right: 20px;
  margin-left: auto;
  background-image: linear-gradient(0deg, rgba(237,18,139,1) 26%, rgba(247,187,105,1) 75%);
}
.benefices legend {
  margin-left: 50px;
  background-image: linear-gradient(0deg, rgba(80,255,251,1) 26%, rgba(183,255,242,1) 75%);
}

.fichiers ul {
  list-style-type: none;
}

.pli {
  position: absolute;
  top: 8px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
}

.objectif .pli, .benefices .pli {
  left: -20px;
  transform: rotate(315deg);
}
.presentation .pli {
  right: -20px;
  transform: rotate(45deg);
}

.objectif .pli {
  border-top: 15px solid #14907a;
}
.presentation .pli {
  border-top: 15px solid #af0b41;
}
.benefices .pli {
  border-top: 15px solid #25a6ec;
}

.concepteurs {
  position: absolute;
  right: -5%;
  max-width: 20%;
  margin-left: 20px;
  margin-top: -80px;
  margin-right: -40px;
}

.concepteurs legend {
  margin-right: 20px;
  margin-left: auto;
}

.concepteurs ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.concepteur {
  display: flex;
  margin: 5px 0;
}

.concepteur > * {
  width: 100%;
}

.photoconcepteur {
  width: 30%;
  height: 100%;
  margin-right: 5px;
}

.concepteur img {
  width: unset;
  cursor: pointer;
  max-width: 100%;
  max-height: 100%;
}

.detailsconcepteur {
  display: inline-block;
}

.adpProjet > fieldset {
  align-self: flex-start;
}
.objectif {
  width: 80%;
  margin-left: 10%;
  position: relative;
}
.presentation {
  width: 60%;
  margin-left: 10%;
}
.benefices {
  width: 70%;
}

.enchainement {
  height: 100px;
  width: 100px;
  transform: translateX(-50%);
  margin: -20px 0 -40px 0;
  position: relative;
  z-index: 20;
  align-self: flex-start;
}

.enchainement1 {
  margin-left: 10%;
}

.enchainement2 {
  margin-left: calc(70% - 10px);
  transform: scale(-1, 1);
}
.enchainement2 img {
  transform: scale(-1, 1);
}

.badge-rond {
  position: absolute;
  top: 50%;
  transform: translate(-15%, -80%);
  background: white;
  margin: 20%;
  border-radius: 50%;
  box-shadow: 0px 5px 5px lightgrey;
  height: 80%;
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-rond .sousbadge {
  width: 50%;
  border-radius: 50%;
  padding: 10%;
  box-shadow: 0px 5px 5px lightgrey;
}

.badge-rond img {
  width: 100%;
}

/*
.emplacementBadge {
  float: right;
  transform: translateX(70%);
  height: 100px;
  width: 100px;
}
*/

.cerclepointille {
  position: relative;
  margin: 0;
  height: 100%;
  width: 100%;
  border-radius: 50%;
  clip-path: inset(160px 160px 160px 50px);
}

.cerclepointille:before {
  position: absolute;
  content: '';
  height: 100%;
  width: 100%;
  top: -5%;
  left: -5%;
  border-radius: inherit;
  animation: spin 10s linear infinite;
}

.enchainement1 .cerclepointille:before {
  border: 3px dashed lightgrey;
}
.enchainement2 .cerclepointille:before {
  border: 3px dashed white;
}

@keyframes spin {
  100% {
    transform: rotateZ(-360deg);
  }
}

fieldset {
  background-color: #fffa;
  text-align: justify;
  border: 0px;
  margin: 0;
  padding: 20px 20px;
}

.icone {
  height: 15px;
  cursor: pointer;
}

footer {
  margin-top: 20px;
}

.logoADP {
  width: 10%;
  cursor: pointer;
}

.portfolio {
  display: flex;
  flex-wrap: wrap;
  max-height: 100%;
  overflow-y: auto;
  justify-content: center;
}

.photo {
  cursor: pointer;
  width: 20%;
  margin: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Caviar Dreams';
}

.photo .image {
  max-height: 75%;
  max-width: 100%;
  margin-bottom: 10px;
}

.photo img {
  max-height: 100%;
  max-width: 100%;
}

.elementCaroussel {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
