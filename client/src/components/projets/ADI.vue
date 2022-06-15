<template>
  <div
    v-if="Object.keys(adi).length !== 0"
    class="adiProjet">
    <div
      class="messages">
      <div
        v-if="adi.statut === 'NOUVEAU' && projet.chef"
        class="msg info">
        <p>
          Il s'agit d'une nouvelle participation, elle ne sera pour l'instant pas étudiée.
          Rapprochez-vous du Département Prospective et Innovation du Service de la
          Transformation pour vous assurer que tous les éléments fournis correspondent
          aux attendus.
        </p>
        <p>
          Une fois que ce sera fait, validez votre participation en cliquant sur le bouton:
        </p>
        <div
          class="bouton bouton-petit"
          @click="validerCandidature">
          Valider la candidature
        </div>
      </div>
      <div
        v-if="adi.statut === 'AJOURNE' && projet.chef"
        class="msg info">
        <p>
          La candidature de votre projet a été ajournée. Vous pouvez le soumettre
          à nouveau après avoir pris en compte les remarques formulées.
        </p>
        <div
          class="bouton bouton-petit"
          @click="validerCandidature">
          Soumettre à nouveau
        </div>
      </div>
      <template
        v-if="adi.statut === 'CANDIDAT'">
        <div
          v-if="projet.chef"
          class="msg info">
          <p>
            Ce projet est officiellement candidat et est en cours d'étude. La prochaine
            étape est le comité de lecture.
          </p>
        </div>
        <div
          v-if="comitelecture"
          class="msg info">
          <p>
            Vous faites partie du comité de lecture. Vous pouvez arbitrer sur ce
            projet en cliquant sur le bouton ci-dessous:
          </p>
          <div
            class="bouton bouton-petit"
            @click="arbitrerComiteLectureDialog = true">
            Arbitrer en comité de lecture
          </div>
        </div>
      </template>
      <div
        v-if="['POUR_AVIS','COMITE_SUIVI'].includes(adi.statut)"
        class="msg info">
        <p
          v-if="adi.statut === 'POUR_AVIS'">
          Ce projet a été validé par le comité de lecture et est en attente
          des avis des directions.
        </p>
        <p
          v-if="adi.statut === 'COMITE_SUIVI'">
          L'ensemble des avis a été récolté, le projet sera étudié lors du
          prochain comité de suivi.
        </p>
        <table
          class="tableau">
          <thead>
            <tr>
              <th>
                Service
              </th>
              <th
                v-for="(typeavis) in ['Innocuité','Généralisation']"
                :key="`titre-${typeavis}`">
                {{ typeavis }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(avis, unite, i) in avisdirectionsAffiches"
              :key="`avis-${i}`">
              <td>
                <qui-est-ce
                  type="unites"
                  :nigendEnvoye="unite"
                  :key="'code_unite-'+unite">
                </qui-est-ce>
              </td>
              <template
                v-for="(typeavis) in ['innocuite','generalisation']"
                :key="`avis-${typeavis}`">
                <td
                  v-if="avis[typeavis].avis !== null">
                  <p
                    class="avis">
                    {{ avis[typeavis].avis ? '✅' : '❌' }} {{ avis[typeavis].explication }}
                  </p>
                  <p
                    class="infosavis">
                    le {{ $moment(avis[typeavis].date).format('DD/MM/YYYY à H:mm:ss') }} par
                    <qui-est-ce
                      :nigendEnvoye="avis[typeavis].auteur"
                      :key="'NIGEND-'+avis[typeavis].auteur">
                    </qui-est-ce>
                  </p>
                </td>
                <td
                  v-else>
                  <span
                    class="bouton bouton-petit"
                    @click="ajouterAvis(unite,typeavis)">
                    Ajouter avis
                  </span>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
        <div>
          <div
            v-if="adi.statut === 'COMITE_SUIVI'"
            class="bouton bouton-petit"
            @click="arbitrerComiteSuiviDialog = true">
            Arbitrer en comité de suivi
          </div>
        </div>
      </div>
      <div
        v-if="adi.statut === 'VALIDE'"
        class="msg info">
        <p>
          Ce projet a été validé par le comité de suivi. Il sera placé dans
          une prochaine campagne de votes.
        </p>
      </div>
    </div>

    <fieldset
      class="objectif">
      <legend>
        <div class="pli"></div>
        <span
          v-if="projet.chef || gererADI"
          @click="modifier('objectifs')"
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Modifier">
          <pencil-outline
            class="lien icone" />
        </span>
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
        v-for="(p, i) in adi.objectifs.split('\n')"
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
        <span
          v-if="projet.chef || gererADI"
          @click="modifier('presentation')"
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Modifier">
          <pencil-outline
            class="lien icone" />
        </span>
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
        v-for="(p, i) in adi.presentation.split('\n')"
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
        <span
          v-if="projet.chef || gererADI"
          @click="modifier('benefices')"
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Modifier">
          <pencil-outline
            class="lien icone" />
        </span>
        Bénéfices
      </legend>
      <p
        v-for="(p, i) in adi.benefices.split('\n')"
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
      inscription le {{ $moment(adi.date_inscription).format('DD/MM/YYYY') }}
      <div>
        <img
          class="logoADI"
          @click="allerAuxADI"
          src="~@/assets/img/outils/adi/logo_adi.png" />
      </div>
    </footer>
  </div>
  <div
    v-else
    class="pasCandidat">
    <p>
      Le projet n'est pas encore candidat pour les ADI. Vous pouvez candidater
      en vous rendant sur la page des ADI en cliquant sur le logo ci-dessous:
    </p>
    <div>
      <img
        class="logoADI"
        @click="allerAuxADI"
        src="~@/assets/img/outils/adi/logo_adi.png" />
    </div>
  </div>
  <fieldset
    v-if="historique.length > 0">
    <legend>
      Historique du processus ADI
    </legend>
    <p
      v-for="(h) in historique"
      :key="`histo-${h.date}`">
      <b>
        {{ $moment(h.date).format('DD/MM/YYYY à H:mm:ss') }}
      </b>
      <br />
      <template
        v-if="h.contenu.type === 'changement_statut'">
        <span
          v-if="h.contenu.statut === 'NOUVEAU'">
          📝 Inscription aux ADI
        </span>
        <span
          v-if="h.contenu.statut === 'CANDIDAT'">
          💾 Sauvegarde des informations
        </span>
        <span
          v-if="h.contenu.statut === 'POUR_AVIS'">
          ✅ Validation par le comité de lecture, en attente des avis des
          directions/services
        </span>
        <span
          v-if="h.contenu.statut === 'COMITE_SUIVI'">
          ⌛ L'ensemble des directions à donné son avis, en attente du comité de suivi
        </span>
        <span
          v-if="h.contenu.statut === 'VALIDE'">
          ✅ Le comité de suivi a validé la participation du projet
        </span>
        <span
          v-if="h.contenu.statut === 'AJOURNE'">
          ⚠️ Le {{ contextes[h.contenu.contexte] }} a ajourné la participation du projet
        </span>
        <span
          class="infosavis">
          par
          <qui-est-ce
            :nigendEnvoye="h.contenu.auteur"
            :key="'NIGEND-'+h.contenu.auteur">
          </qui-est-ce>
        </span>
      </template>
      <template
        v-if="h.contenu.type === 'avis'">
        {{ h.contenu.valeur ? '✅' : '❌' }}
        [{{ typesAvis[h.contenu.precision].toUpperCase() }}]
        <qui-est-ce
          :nigendEnvoye="h.contenu.auteur"
          :key="'NIGEND-'+h.contenu.auteur">
        </qui-est-ce>
        a donné un avis {{ h.contenu.valeur ? 'favorable' : 'défavorable' }}
        au nom de l'unité
        <qui-est-ce
          type="unites"
          :nigendEnvoye="h.contenu.unite"
          :key="'code_unite-'+h.contenu.unite">
        </qui-est-ce>:
        {{ h.contenu.explication }}
      </template>
      <template
        v-if="h.contenu.type === 'commentaire'">
        🗣️ [{{ contextes[h.contenu.precision].toUpperCase() }}]
        <qui-est-ce
          :nigendEnvoye="h.contenu.auteur"
          :key="'NIGEND-'+h.contenu.auteur">
        </qui-est-ce>
        a commenté: {{ h.contenu.commentaire }}
      </template>
    </p>
  </fieldset>

  <transition name="fade">
    <div
      class="overlay"
      v-if="modifierChampDialog"
      >
      <div
        class="fondOverlay"
        @click="modifierChampDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <div>
              <textarea
              v-model="aModifier.valeur"/>
            </div>
          </div>
          <span
            v-if="aModifier.valeur.length > 0"
            class="bouton bouton-petit"
            @click="modifierChamp">
            Modifier
          </span>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="arbitrerComiteLectureDialog"
      >
      <div
        class="fondOverlay"
        @click="arbitrerComiteLectureDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <div
              class="reponseComiteLecture">
              <input
                v-model="arbitrageComite.reponse"
                type="radio"
                id="accepteComiteLecture"
                value="accepte"/>
              <label
                for="accepteComiteLecture">accepté</label>
              <input
                v-model="arbitrageComite.reponse"
                type="radio"
                id="ajourneComiteLecture"
                value="ajourne"/>
              <label
                for="ajourneComiteLecture">ajourné</label>
              <input
                v-model="arbitrageComite.reponse"
                type="radio"
                id="refuseComiteLecture"
                value="refuse"/>
              <label
                for="refuseComiteLecture">refusé</label>
            </div>
          </div>
          <div>
            <label>Commentaire:</label>
            <div>
              <textarea
              v-model="arbitrageComite.commentaire"/>
            </div>
          </div>
          <div
            v-if="arbitrageComite.reponse === 'accepte'">
            Liste des unités pour avis:
            <recherche-autocomplete
              v-model="arbitrageComite.pouravis"
              mode="multiple"
              :url="[
                'quiestce/multiple/unites'
                ]"/>
          </div>
          <span
            class="bouton bouton-petit"
            @click="validerArbitrageComiteLecture">
            Valider
          </span>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="arbitrerComiteSuiviDialog"
      >
      <div
        class="fondOverlay"
        @click="arbitrerComiteSuiviDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <div
              class="reponseComiteSuivi">
              <input
                v-model="arbitrageComiteSuivi.reponse"
                type="radio"
                id="accepteComiteSuivi"
                value="accepte"/>
              <label
                for="accepteComiteSuivi">Accepté</label>
              <input
                v-model="arbitrageComiteSuivi.reponse"
                type="radio"
                id="ajourneComiteSuivi"
                value="ajourne"/>
              <label
                for="ajourneComiteSuivi">ajourné</label>
              <input
                v-model="arbitrageComiteSuivi.reponse"
                type="radio"
                id="refuseComiteSuivi"
                value="refuse"/>
              <label
                for="refuseComiteSuivi">refusé</label>
            </div>
          </div>
          <div>
            <label>Commentaire:</label>
            <div>
              <textarea
              v-model="arbitrageComiteSuivi.commentaire"/>
            </div>
          </div>
          <span
            class="bouton bouton-petit"
            @click="validerArbitrageComiteSuivi">
            Valider
          </span>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="envoyerAvisDialog"
      >
      <div
        class="fondOverlay"
        @click="envoyerAvisDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          Vous rédigez l'avis "{{ avisAEnvoyer.type }}" au nom de l'unité
          <qui-est-ce
            type="unites"
            :nigendEnvoye="avisAEnvoyer.unite"
            :key="'code_unite-'+avisAEnvoyer.unite">
          </qui-est-ce>
          <div>
            <div
              class="msg info">
              Vous pouvez accepter en précisant certaines conditions.
            </div>
          </div>
          <div>
            <div>
              <input
                v-model="avisAEnvoyer.avis"
                type="radio"
                value="false"
                name="avisAEnvoyer"
                id="avisAEnvoyerRefuse"/>
              <label
                for="avisAEnvoyerRefuse">Refusé</label>
              <input
                v-model="avisAEnvoyer.avis"
                type="radio"
                value="true"
                name="avisAEnvoyer"
                id="avisAEnvoyerAccepte"/>
              <label
                for="avisAEnvoyerAccepte">Accepté</label>
            </div>
          </div>
          <div>
            <label>Explication:</label>
            <div>
              <textarea
              v-model="avisAEnvoyer.explication"/>
            </div>
          </div>
          <span
            class="bouton bouton-petit"
            @click="envoyerAvis">
            Valider
          </span>
        </div>
      </div>
    </div>
  </transition>

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
  reactive,
  computed,
  getCurrentInstance,
} from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import {
  PencilOutline,
} from 'mdue';
import QuiEstCe from '@/components/QuiEstCe.vue';
// eslint-disable-next-line
import '@splidejs/splide/dist/css/themes/splide-skyblue.min.css';
import RechercheAutocomplete from '@/components/RechercheAutocomplete.vue';

export default defineComponent({
  name: 'ADI',
  components: {
    QuiEstCe,
    Splide,
    SplideSlide,
    PencilOutline,
    RechercheAutocomplete,
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const store = useStore();
    const connexion = computed(() => store.state.connexion);
    const projet = computed(() => store.state.projet);
    const apiUrl = process.env.VUE_APP_API_URL;
    const route = useRoute();
    const router = useRouter();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const adi = ref({});
    const modifierChampDialog = ref(false);
    const aModifier = reactive({
      champ: '',
      valeur: '',
    });
    const voirPhotoDialog = ref(false);
    const photoURL = ref('');
    const gererADI = ref(false);
    const options = {
      autoplay: true,
      interval: 1000,
      type: 'loop',
      rewind: true,
      width: '50vw',
      perPage: 3,
      perMove: 1,
    };
    const typesAvis = {
      generalisation: 'généralisation',
      innocuite: 'innocuité',
    };
    const contextes = {
      COMITE_SUIVI: 'comité de suivi',
      COMITE_LECTURE: 'comité de lecture',
    };
    const comitelecture = ref(false);
    const arbitrerComiteLectureDialog = ref(false);
    const arbitrageComite = reactive({
      reponse: '',
      commentaire: '',
      pouravis: [],
    });
    const avisdirections = ref([]);
    const avisdirectionsAffiches = computed(() => {
      const av = {};
      avisdirections.value.forEach((a) => {
        const t = {
          avis: a.avis,
          explication: a.explication,
          date: a.date,
          auteur: a.auteur,
        };
        if (!(a.code_unite in av)) {
          av[a.code_unite] = {};
        }
        av[a.code_unite][a.type_avis] = t;
      });
      return av;
    });
    const avisAEnvoyer = reactive({
      unite: null,
      type: null,
      avis: false,
      explication: null,
    });
    const envoyerAvisDialog = ref(false);
    const arbitrerComiteSuiviDialog = ref(false);
    const arbitrageComiteSuivi = reactive({
      reponse: '',
      commentaire: '',
    });
    const historique = ref([]);

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

    async function chargerHistorique() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/historique`)
        .then(async (res) => {
          historique.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerAvisDirections() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/avisdirections`)
        .then(async (res) => {
          avisdirections.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function validerArbitrageComiteLecture() {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr de valider cet arbitrage?')) {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/arbitrercomitelecture`,
          arbitrageComite,
        )
          .then(async (res) => {
            adi.value.statut = res.data.statut;
            arbitrerComiteLectureDialog.value = false;
            await chargerAvisDirections();
            await chargerHistorique();
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

    async function chargerComiteLecture() {
      await axios.get(`${process.env.VUE_APP_API_URL}/droits/verifdroit/adi/comiteLecture`)
        .then(async (res) => {
          comitelecture.value = res.data;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function validerCandidature() {
      // eslint-disable-next-line
      if ((projet.value.chef) && window.confirm('Êtes-vous sûr de valider cette candidature?')) {
        await axios.put(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/validercandidature`)
          .then(async (res) => {
            adi.value.statut = 'CANDIDAT';
            await chargerComiteLecture();
            await chargerHistorique();
            toast(`✅ ${res.data}`, {
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

    async function validerArbitrageComiteSuivi() {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr de valider cet arbitrage?')) {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/arbitrercomitesuivi`,
          arbitrageComiteSuivi,
        )
          .then(async (res) => {
            adi.value.statut = res.data.statut;
            arbitrerComiteSuiviDialog.value = false;
            await chargerHistorique();
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

    async function chargerADI() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/adi`)
        .then(async (res) => {
          adi.value = { ...res.data };
          if (adi.value.statut === 'CANDIDAT') {
            await chargerComiteLecture();
          }
          if (['POUR_AVIS', 'COMITE_SUIVI'].includes(adi.value.statut)) {
            await chargerAvisDirections();
          }
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    function modifier(rub) {
      aModifier.champ = rub;
      aModifier.valeur = adi.value[rub];
      modifierChampDialog.value = true;
    }

    async function modifierChamp() {
      await axios.put(`${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/modifierchamp`, aModifier)
        .then(async () => {
          adi.value[aModifier.champ] = aModifier.valeur;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        })
        .finally(() => {
          modifierChampDialog.value = false;
        });
    }

    function allerAuxADI() {
      let url = '/outils/adi';
      if ((adi.value.id_campagne !== null) && (adi.value.id_campagne !== undefined)) {
        url += `/campagne/${adi.value.id_campagne}`;
      }
      router.push(url);
    }

    async function chargerDroitGererADI() {
      await axios.get(`${process.env.VUE_APP_API_URL}/droits/verifdroit/adi/gererCampagne`)
        .then(async (res) => {
          gererADI.value = res.data;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function ajouterAvis(unite, type) {
      if (connexion.value.connecte) {
        avisAEnvoyer.unite = unite;
        avisAEnvoyer.type = type;
        envoyerAvisDialog.value = true;
      } else {
        emitter.emit('popupConnexion');
      }
    }

    async function envoyerAvis() {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr de valider cet avis?')) {
        await axios.put(
          `${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/avis`,
          avisAEnvoyer,
        )
          .then(async (res) => {
            envoyerAvisDialog.value = false;
            avisdirections.value = avisdirections.value.filter(
              (a) => (a.code_unite !== avisAEnvoyer.unite)
              || (a.type !== avisAEnvoyer.type),
            );
            avisdirections.value.push(res.data.avis);
            if (res.data.comitesuivi) {
              adi.value.statut = 'COMITE_SUIVI';
            }
            avisAEnvoyer.unite = null;
            avisAEnvoyer.type = null;
            avisAEnvoyer.avis = false;
            avisAEnvoyer.explication = null;
            await chargerHistorique();
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

    onMounted(async () => {
      await chargerDroitGererADI();
      await chargerADI();
      await chargerHistorique();
    });

    return {
      projet,
      connexion,
      apiUrl,
      adi,
      aModifier,
      modifier,
      modifierChampDialog,
      modifierChamp,
      allerAuxADI,
      voirPhotoDialog,
      affichePhoto,
      photoURL,
      gererADI,
      autoriserAgorha,
      revoquerAgorha,
      options,
      typesAvis,
      contextes,
      validerCandidature,
      comitelecture,
      arbitrerComiteLectureDialog,
      arbitrageComite,
      validerArbitrageComiteLecture,
      avisdirectionsAffiches,
      ajouterAvis,
      envoyerAvisDialog,
      avisAEnvoyer,
      envoyerAvis,
      validerArbitrageComiteSuivi,
      arbitrerComiteSuiviDialog,
      arbitrageComiteSuivi,
      historique,
    };
  },
});
</script>

<style scoped>
.adiProjet {
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

.icone {
  font-size: 1em;
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
  float: right;
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

.adiProjet > fieldset {
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

.messages, .messages > * {
  margin: 10px;
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

.logoADI {
  width: 10%;
  cursor: pointer;
}

.elementCaroussel {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avis {
  text-align: justify;
  text-indent: 1em;
}

.infosavis {
  font-size: 0.7em;
  font-style: italic;
  text-align: right;
}
</style>
