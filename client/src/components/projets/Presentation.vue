<template>
  <div
    class="presentationProjet">
    <div
      class="bouton bouton-petit"
      v-if="projet.visibilite.mavisibilite === 'PARTIELLE'"
      @click="demanderVisibilite">
      Demander l'accès à toutes les informations du projet
    </div>
    <div
      class="msg info"
      v-if="projet.visibilite.mavisibilite === 'DEMANDE'">
      Demande d'accès à toutes les informations du projet en cours
    </div>
    <div
      class="msg avertissement important"
      v-if="projet.visibilite.mavisibilite === 'REFUSE'">
      Demande d'accès à toutes les informations du projet refusée
    </div>
    <div
      class="msg erreur important"
      v-if="projet.visibilite.mavisibilite === 'REVOQUE'">
      Accès à toutes les informations du projet révoqué
    </div>
    <fieldset
      v-if="projet.presentation"
      class="presentation">
      <legend>
        <div class="pli"></div>
        <span
          v-if="projet.chef"
          @click="emitter.emit('modificationChampProjet', 'presentation')"
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Modifier présentation">
          <pencil-outline
            class="lien" />
        </span>
        <span class="titre">Présentation</span>
      </legend>
      <fieldset
        class="motscles">
        <legend>
          <span
            v-if="projet.chef"
            @click="emitter.emit('afficherFormulaireAjouterMotcle')"
            class="tooltip"
            data-tooltip-location="bottom"
            data-tooltip="Ajouter mot-clé">
            <pencil-plus-outline
              class="lien" />
          </span>
          <span class="titre">Mots-clés</span>
        </legend>
        <span
          class="listeCapsules">
          <span
            v-for="mot in projet.motscles"
            :key="`mot-${mot.id}`"
            class="capsule">
            <span
              v-if="projet.chef"
              class="icone"
              @click="emitter.emit('afficherDissocierMotCleDialog', mot.id)">❌
            </span>
            {{ mot.mot }}
          </span>
        </span>
      </fieldset>
      <p
        v-for="(p, i) in projet.presentation.split('\n')"
        :key="`obj-p-${i}`">
        {{ p }}
      </p>
      <template
          v-if="(projet.objectifsTypes.length > 0) || projet.chef">
        <h3>
          Objectifs
        </h3>
        <objectifs-projet />
      </template>
      <template
        v-for="cat in Object.keys(categoriesClair)"
        :key="`cat-${cat}`">
        <h3
          v-if="projet[cat] || projet.chef">
          <Popper
            arrow
            hover
            :content="`${categoriesClair[cat].tooltip}`"
            class="lien"
            v-if="projet.chef"
            @click="emitter.emit('modificationChampProjet', cat)">
            <pencil-outline />
          </Popper>
          {{ categoriesClair[cat].nom }}
        </h3>
        <div
          class="msg avertissement important"
          v-if="cat === 'objectifs' && projet[cat] && projet[cat].length">
          Ceci est l'ancienne partie consacrée aux objectifs. Il convient désormais
          d'utiliser la fonctionnalité "objectifs" prévue à cet effet (action du
          chef de projet).
        </div>
        <p
          v-for="(p, i) in projet[cat].split('\n')"
          :key="`p-${cat}-${i}`">
          {{ p }}
        </p>
      </template>
      <fieldset
        v-if="(projet.fichiers.length > 0) || projet.chef"
        class="fichiersjoints">
        <legend>
          <div class="pli"></div>
          <span
            v-if="projet.chef"
            @click="emitter.emit('afficherFormulaireFichiersJointsProjet')"
            class="icone tooltip"
            data-tooltip-location="top"
            data-tooltip="Ajouter fichier">
            <Paperclip
              class="lien" />
          </span>
          <span
            v-else>
            <Paperclip
              class="lien" />
          </span>
          <span class="titre">Fichiers joints</span>
        </legend>
        <ul
          class="fichiers">
          <li
            v-for="(fichier, i) in projet.fichiers"
            :key="`fichier-${i}`">
            <span
              v-if="projet.chef"
              @click="supprimerFichier(fichier.id)"
              class="icone tooltip"
              data-tooltip-location="right"
              data-tooltip="Supprimer fichier">
              ❌
            </span>
            <a
              :href="apiUrl+'/fichiers/telechargement/'+fichier.id+'/'+fichier.nom">
              📄 {{ fichier.description }}
            </a>
          </li>
        </ul>
      </fieldset>
    </fieldset>
    <fieldset>
      <legend>
        <div class="pli"></div>
        <handshake-outline />
        <span class="titre">Partenariats</span>
      </legend>
      <partenariats-projet />
    </fieldset>
    <fieldset>
      <legend>
        <div class="pli"></div>
        <account-group />
        <span class="titre">Communautés</span>
      </legend>
      <fieldset>
        <legend
          class="lien"
          @click="$router.push('/outils/communautes/innovateurs')">
          <div class="pli"></div>
          <Flask />
          <span class="titre">Innovation</span>
        </legend>
        <div
          class="messageCommunaute">
          <div
            v-if="adi.statut === 'VALIDE' || adp.accepte"
            class="msg important succes">
            Ce projet est autorisé à la réplication par la DGGN.
          </div>
          <div
            v-else
            class="msg important avertissement">
            Ce projet n'est pas autorisé à la réplication par la DGGN.
          </div>
        </div>
        <table
          class="tableau">
          <thead>
            <tr>
              <th>

              </th>
              <th>
                Type
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <router-link to="/outils/adi">
                  <img
                  class="logoADI"
                  src="~@/assets/img/outils/adi/logo_adi.png" />
                </router-link>
              </td>
                <td>
                  <router-link to="/outils/adi">
                    Ateliers de l'innovation
                  </router-link>
                </td>
              <td>
                <template
                  v-if="Object.keys(adi).length">
                  <div
                    class="bouton bouton-petit"
                    @click="$router.push(`/projet/${projet.id}/adi`)">
                      <Magnify />
                      Voir la fiche ADI
                  </div>
                  <div>
                    {{ adiClair[adi.statut] }}
                  </div>
                </template>
                <span
                  v-else>
                  Ce projet n'est pas candidat aux ADI.
                </span>
                <template
                  v-if="Object.keys(adp).length">
                  <div
                    class="bouton bouton-petit"
                    @click="$router.push(`/projet/${projet.id}/adp`)">
                      <Magnify />
                      Voir la fiche ADP
                  </div>
                </template>
              </td>
            </tr>
            <tr>
              <td>

              </td>
              <td>
                <router-link to="/outils/prix-de-la-transformation">
                  Prix de la transformation
                </router-link>
              </td>
              <td>
                <ul
                  v-if="prixTransfo.inscripteur">
                  <li>
                    Ce projet a été inscrit le {{ $moment(prixTransfo.date_inscription).format('l à H:mm:ss') }} par
                    <qui-est-ce
                      :nigendEnvoye="prixTransfo.inscripteur"
                      :key="`NIGEND-${prixTransfo.inscripteur}`" />.
                  </li>
                  <li>
                    <span
                      class="msg info">
                      Statut: {{ prixdelatransfoClair[prixTransfo.statut] }}
                    </span>
                  </li>
                  <li
                    v-if="prixTransfo.statut === 'JURY_PASSE'">
                    Ce projet a été classé en position {{ prixTransfo.place }} l'année {{ prixTransfo.annee }} et
                    {{ prixTransfo.laureat ? 'est' : 'n\'est pas' }} lauréat.
                  </li>
                </ul>
                <span
                  v-else>
                  Ce projet n'est pas candidat au Prix de la Transformation
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <router-link to="/outils/prix-de-la-prevention">
                  <img
                  class="logoADI"
                  src="~@/assets/img/outils/prixdelaprevention/logo_prixdelaprevention.png" />
                </router-link>
              </td>
              <td>
                <router-link to="/outils/prix-de-la-prevention">
                  Prix de la prévention
                </router-link>
              </td>
              <td>
                <ul
                  v-if="prixPrevention.inscripteur">
                  <li>
                    Ce projet a été inscrit le {{ $moment(prixPrevention.date_inscription).format('l à H:mm:ss') }} par
                    <qui-est-ce
                      :nigendEnvoye="prixPrevention.inscripteur"
                      :key="`NIGEND-${prixPrevention.inscripteur}`" />.
                  </li>
                  <li>
                    <span
                      class="msg info">
                      Statut: {{ prixdelapreventionClair[prixPrevention.statut] }}
                    </span>
                  </li>
                  <!-- <li
                    v-if="prixPrevention.statut === 'JURY_PASSE'">
                    Ce projet a été classé en position {{ prixPrevention.place }} l'année {{ prixPrevention.annee }} et
                    {{ prixPrevention.laureat ? 'est' : 'n\'est pas' }} lauréat.
                  </li> -->
                </ul>
                <span
                  v-else>
                  Ce projet n'est pas candidat au Prix de la Prévention
                </span>
              </td>
            </tr>
            <tr>
              <td>

              </td>
              <td>
                <router-link to="/outils/fppi">
                  FPPI
                </router-link>
              </td>
              <td>
                <div
                  class="bouton bouton-petit"
                  v-if="statutFPPI.length || projet.chef "
                  @click="$router.push(`/projet/${projet.id}/fppi`)">
                    <Magnify />
                    {{ statutFPPI.length ? 'Voir' : 'Créer' }} la FPPI
                </div>
                <div>
                  <span
                    class="msg info"
                    v-if="statutFPPI === 'INITIEE'">
                    Fiche de proposition de projet d'innovation initiée
                  </span>
                  <span
                    v-if="statutFPPI.length === 0"
                    class="msg avertissement">
                    Pas de FPPI pour ce projet
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>
      <fieldset>
        <legend
          class="lien"
          @click="$router.push('/outils/communautes/developpeurs')">
          <code-braces-box />
          <span class="titre">Développeurs</span>
        </legend>
        <tableau-omnibus
          v-if="projetsDev.length"
          :projets="projetsDev"
          :chef="projet.chef"/>
        <div
          v-else
          class="msg info">
          Ce projet n'a pas de lien avec la communauté des développeurs.
        </div>
        <footer>
          <div
            v-if="projet.chef"
            class="bouton bouton-petit"
            @click="emitter.emit('afficherFormulaireAjouterOmnibus', 'developpeurs')">
            Ajouter projet hébergé sur Omnibus
          </div>
        </footer>
      </fieldset>
      <fieldset>
        <legend
          class="lien"
          @click="$router.push('/outils/communautes/gendfablab')">
          <Printer_3d />
          <span class="titre">GendFabLab</span>
        </legend>
        <div
          class="messageCommunaute">
          <div
            v-if="statutGendfablab === 'VALIDE'"
            class="msg important succes">
            Ce projet a été homologué.
          </div>
          <div
            v-else
            class="msg important avertissement">
            Ce projet n'a pas été homologué.
          </div>
        </div>
        <tableau-omnibus
          v-if="projetsGendFabLab.length"
          :projets="projetsGendFabLab"
          :chef="projet.chef"/>
        <div
          v-else
          class="msg info">
          Ce projet n'a pas de lien avec la communauté des makers.
        </div>
        <footer>
          <div
            v-if="projet.chef"
            class="bouton bouton-petit"
            @click="emitter.emit('afficherFormulaireAjouterOmnibus', 'gendfablab')">
            Ajouter projet hébergé sur Omnibus
          </div>
          <div
            v-if="projetsGendFabLab.length"
            class="bouton bouton-petit"
            @click="$router.push(`/projet/${$route.params.id}/gendfablab`)">
            Homologation du projet
          </div>
        </footer>
      </fieldset>
    </fieldset>

    <fieldset>
      <legend>
        <div class="pli"></div>
        <timeline-text />
        <span class="titre">Historique</span>
      </legend>
      <historique-projet />
    </fieldset>
  </div>

</template>

<script>
import {
  defineComponent,
  onMounted,
  ref,
  getCurrentInstance,
  inject,
  computed,
} from 'vue';
import { useStore } from 'vuex';
import {
  useRoute,
  // useRouter,
} from 'vue-router';
import {
  PencilPlusOutline,
  PencilOutline,
  Paperclip,
  Magnify,
  // PaperclipPlus,
  AccountGroup,
  HandshakeOutline,
  Flask,
  CodeBracesBox,
  // eslint-disable-next-line
  Printer_3d,
  TimelineText,
} from 'mdue';
import TableauOmnibus from '@/components/projets/components/TableauOmnibus.vue';
import HistoriqueProjet from '@/components/projets/components/HistoriqueProjet.vue';
import PartenariatsProjet from '@/components/projets/components/PartenariatsProjet.vue';
import ObjectifsProjet from '@/components/projets/components/ObjectifsProjet.vue';
import QuiEstCe from '@/components/QuiEstCe.vue';

export default defineComponent({
  name: 'Presentation',
  components: {
    PencilPlusOutline,
    PencilOutline,
    Paperclip,
    Magnify,
    // PaperclipPlus,
    TableauOmnibus,
    HistoriqueProjet,
    PartenariatsProjet,
    ObjectifsProjet,
    QuiEstCe,
    AccountGroup,
    HandshakeOutline,
    Flask,
    CodeBracesBox,
    // eslint-disable-next-line
    Printer_3d,
    TimelineText,
  },
  setup() {
    const axios = inject('$axios');
    const toast = inject('$toast');
    const route = useRoute();
    // const router = useRouter();
    const apiUrl = process.env.VUE_APP_API_URL;
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const categoriesClair = {
      origine: {
        tooltip: 'Modifier l\'origine',
        nom: 'Origine',
      },
      objectifs: {
        tooltip: 'Modifier les objectifs',
        nom: 'Objectifs',
      },
      benefices: {
        tooltip: 'Modifier les bénéfices',
        nom: 'Bénéfices',
      },
      budget: {
        tooltip: 'Modifier le budget',
        nom: 'Budget',
      },
      communication: {
        tooltip: 'Modifier la communication',
        nom: 'Communication',
      },
    };
    const adp = ref({});
    const adi = ref({});
    const adiClair = {
      NOUVEAU: 'Ce projet a initié son inscription aux ADI.',
      CANDIDAT: 'Ce projet est candidat aux ADI et sera étudié en comité de lecture.',
      AJOURNE: 'La participation de ce projet aux ADI a été ajournée.',
      REFUSE: 'La participation de ce projet aux ADI a été refusée.',
      POUR_AVIS: 'En attente de l\'avis des directions et services avant de valider ce projet.',
      COMITE_SUIVI: 'En attente de la décision du comité de suivi pour valider le projet.',
      VALIDE: 'Ce projet est validé dans le cadre des ADI.',
    };
    const prixdelatransfoClair = {
      INSCRIT: 'projet inscrit',
      SELECTIONNE: 'projet sélectionné',
      REFUSE: 'projet refusé',
      JURY_PASSE: 'le jury a statué',
    };
    const prixTransfo = ref('');
    const prixdelapreventionClair = {
      INSCRIT: 'projet inscrit',
      SELECTIONNE: 'projet sélectionné',
    };
    const prixPrevention = ref('');
    const statutGendfablab = ref('');
    const projetsDev = computed(() => store.getters['projet/projetsOmnibus']('developpeurs'));
    const projetsGendFabLab = computed(() => store.getters['projet/projetsOmnibus']('gendfablab'));
    const statutFPPI = ref('');

    async function supprimerFichier(id) {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier?')) {
        await axios.delete(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/supprimerfichier/${id}`,
        )
          .then(() => {
            emitter.emit('fichierSupprime', id);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }

    async function chargerADI() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/adi`)
        .then(async (res) => {
          adi.value = { ...res.data };
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerADP() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/adp`)
        .then(async (res) => {
          adp.value = { ...res.data };
        })
        .catch((e) => {
          console.log(e.response.data.msg);
        });
    }

    async function chargerPrixTransfo() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/prixdelatransformation/projet/${route.params.id}`)
        .then(async (res) => {
          prixTransfo.value = res.data;
        })
        .catch((e) => {
          console.log(e.response.data.msg);
        });
    }

    async function chargerPrixPrevention() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/prixdelaprevention/projet/${route.params.id}`)
        .then(async (res) => {
          prixPrevention.value = res.data;
        })
        .catch((e) => {
          console.log(e.response.data.msg);
        });
    }

    async function chargerStatutGendFabLab() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projet/${route.params.id}/gendfablab/statut`)
        .then(async (res) => {
          statutGendfablab.value = res.data.statut;
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function chargerStatutFPPI() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/fppi/${route.params.id}/statut`)
        .then(async (res) => {
          statutFPPI.value = res.data.statut;
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function demanderVisibilite() {
      // eslint-disable-next-line
      if (window.confirm('Confirmez-vous cette demande de visibilité?')) {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/visibilite/demander`,
        )
          .then((res) => {
            store.dispatch('projet/modifierMaVisibilite', res.data.visibilite);
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
      await chargerADI();
      await chargerADP();
      await chargerPrixTransfo();
      await chargerPrixPrevention();
      await chargerStatutGendFabLab();
      await chargerStatutFPPI();
    });

    return {
      apiUrl,
      supprimerFichier,
      projet,
      categoriesClair,
      adp,
      adi,
      adiClair,
      prixTransfo,
      prixdelatransfoClair,
      prixPrevention,
      prixdelapreventionClair,
      projetsDev,
      projetsGendFabLab,
      demanderVisibilite,
      statutGendfablab,
      chargerStatutGendFabLab,
      statutFPPI,
    };
  },
});
</script>

<style scoped>
.presentationProjet {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

legend {
  align-items: center;
  display: flex;
}

legend .titre {
  margin-left: 10px;
}

.presentationProjet > fieldset {
  width: 90%;
  background-color: rgba(255, 255, 255, 0.7);
  text-align: justify;
  margin: 10px 0;
}

.presentationProjet > fieldset > fieldset:not(.motscles) {
  background-color: rgba(255, 255, 255, 0.7);
  margin: 20px 0;
}

.presentationProjet > fieldset > legend {
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

.motscles {
  float: right;
  margin-top: -50px;
  margin-left: 10px;
  width: 20%;
  background-color: #fffa;
  border: none;
}

.fichiersjoints {
  max-width: 50%;
  background-color: #fffa;
  border: 1px dashed;
  border-right: 0;
  border-bottom: 0;
}

.icone {
  height: 15px;
  cursor: pointer;
}

.presentation :not(legend) {
  text-align: justify;
}

.presentationProjet p {
  text-indent: 2em;
}

.fichiers {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.logoADI {
  height: 2em;
  cursor: pointer;
}

.messageCommunaute {
  float: right;
  margin-top: -30px;
}

fieldset footer {
  display: flex;
  justify-content: space-around;
}
</style>
