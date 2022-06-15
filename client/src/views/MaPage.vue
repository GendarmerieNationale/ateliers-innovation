<template>
  <jeu-robot
    :idRobot="5"/>
  <div
    v-if="connexion.connecte"
    id="maPage">
    <header>
      <h1>
        <span
          class="tooltip"
          data-tooltip-location="bottom"
          data-tooltip="Se déconnecter">
          <Power
            class="lien"
            @click="deconnecterSession(maconnexion)" />
        </span>
        {{ connexion.nom }}
      </h1>
    </header>
    <div
      id="supraConteneur"
      @scroll="verifScroll"
      :class="[{
        fonduHaut: !scroll.haut,
        fonduBas: !scroll.bas
        }]">
      <div class="gauche">
        <!-- <fieldset>
          <legend>
            <span
              class="tooltip"
              data-tooltip-location="right"
              :data-tooltip="connexion.profil.id_profil ? 'Modifier profil' : 'Créer profil'">
              <pencil-plus-outline
                class="lien edit"
                @click="popupGererProfil(connexion.profil.id_profil ? 'modifier' : 'creer')" />
              </span>
              Profil
          </legend>
          <h2
            v-if="connexion.profil.id_profil">
            {{ profils.profils.find((x) => x.id === connexion.profil.id_profil)
              .nom || 'Profil introuvable' }}
          </h2>
          <div v-if="connexion.profil.id_profil">
            <h3>Mes sujets d'intérêt:</h3>
            <ul>
              <li
                v-for="(suj, i) in connexion.profil.sujets_interet"
                :key="`liste-messujets-${i}`">
                {{ profils.sujets.find((x) => x.id === suj).nom }}
              </li>
            </ul>
          </div>
          <div v-else>
            Pas de profil associé, cliquez sur le petit crayon ci-dessus pour en créer un.
          </div>
        </fieldset> -->
        <fieldset>
          <legend>
            <router-link to="/badges">
              Badges
            </router-link>
          </legend>
          <div class="listeBadges">
            <badge
              v-for="badge in badges"
              location="right"
              :type="badge.id"
              :key="`badge-${badge.id}`"
              :nigend="connexion.nigend" />
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <router-link to="/competences">
              Compétences
            </router-link>
          </legend>
          <div
            class="listeCompetences listeCapsules">
            <span
              v-for="competence in competences"
              class="capsule"
              :key="`competence-${competence.nigend}-${competence.id}`">
              <Popper
                arrow
                hover
                :content="competence.commentaire">
                <span
                  :data-badge="competence.recommandes > 0 ? competence.recommandes : null"
                  class="lien"
                  @click="afficherCompetence(competence.id)">
                  {{ competence.nom }}
                </span>
              </Popper>
            </span>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            Connexions
          </legend>
          Voici l'ensemble des endroits où vous êtes connectés.
          Pour supprimer une connexion, cliquez dessus.
          <ul
            class="connexions">
            <li
              v-for="(connexion, i) in connexions"
              :key="`connexion-${i}`">
              <span
                @click="deconnecterSession(connexion)"
                class="tooltip"
                data-tooltip-location="right"
                :data-tooltip="$moment(connexion.date).format('DD/MM/YYYY à H:mm:ss')">
                <img
                  v-if="connexion['user-agent'].includes('Firefox')"
                  class="logoConnexion"
                  src="~@/assets/img/firefox.png" />
                <img
                  v-if="connexion['user-agent'].includes('Linux')"
                  class="logoConnexion"
                  src="~@/assets/img/linux.png" />
              </span>
              <span
                v-if="connexion.masession"
                class="masession">
                ce navigateur
              </span>
            </li>
          </ul>
        </fieldset>
        <!-- TODO
        <fieldset>
          <legend>
            RGPD
          </legend>
          Télécharger mes données
        </fieldset>
      -->
      </div>
      <div class="principal">
        <fieldset class="journal">
          <legend>
            Journal
          </legend>
          <ul>
            <li
              class="entree"
              v-for="(entree, i) in journal"
              :key="`journal-${i}`">
              <span class="date">
                {{ $moment(entree.date).format('l à H:mm:ss') }}
              </span>
              <span v-if="entree.type === 'vote'">
                {{ entree.lien.vote === 'POSITIF' ? ' a aimé' : ' n\'a pas aimé' }}:
              </span>
              <span v-if="entree.type === 'partage'">
                a partagé ceci:
              </span>
              <span v-if="entree.type === 'actu'">
                a créé une actualité:
              </span>
              <span v-if="entree.type === 'article'">
                a créé un article:
              </span>
              <span v-if="entree.type === 'dossier'">
                a créé un dossier:
              </span>
              <span v-if="entree.type === 'portrait'">
                a créé un portrait:
              </span>
              <span v-if="entree.type === 'mediatheque'">
                a publié un fichier:
              </span>
              <span v-if="entree.type === 'badge'">
                a gagné un badge:
              </span>
              <span v-if="entree.type === 'entreprise'">
                a créé l'entreprise
                <router-link :to="`/outils/gendindus/entreprises/${entree.lien.id}`">
                  {{ entree.lien.nom }}
                </router-link>
              </span>
              <span v-if="entree.type === 'evenement'">
                a créé l'événement
                <router-link :to="`/outils/gendindus/evenements/${entree.lien.id}`">
                  {{ entree.lien.nom }}
                </router-link>
              </span>
              <template
                 v-if="entree.type === 'projet'">
                 <span v-if="entree.lien.typeProjet === 'creation'">
                   a créé un projet
                 </span>
                 <span v-if="entree.lien.typeProjet === 'role'">
                   a désormais le rôle "{{ entree.lien.role}}" pour le projet
                 </span>
                 <span v-if="entree.lien.typeProjet === 'finrole'">
                   n'est désormais plus "{{ entree.lien.role}}" pour le projet
                 </span>
              </template>
              <div
                class="commentaire"
                v-if="entree.lien?.commentaire?.length">
                "{{ entree.lien.commentaire }}"
              </div>
              <badge
                v-if="entree.type === 'badge'"
                location="right"
                :key="`badge-${connexion.nigend}-${entree.lien.idBadge}-${entree.lien.niveau}`"
                :type="entree.lien.idBadge"
                :niveau="entree.lien.niveau"
                :nigend="connexion.nigend" />
              <apercu
                v-if="[
                  'vote',
                  'partage',
                  'actu',
                  'projet',
                  'article',
                  'dossier',
                  'portrait'].includes(entree.type)"
                :id="entree.lien.id"
                :type="entree.lien.type" />
              <div
                v-if="entree.type === 'mediatheque'">
                <a
                  :href="apiUrl+'/fichiers/telechargement/'
                  +entree.lien.idFichier+'/'+entree.lien.nomFichier">
                  📄 {{ entree.lien.description_fichier }}
                </a>
              </div>
            </li>
          </ul>
          <div class="finJournal">
            <div
              class="bouton"
              v-if="!finJournal"
              @click="pageJournal++">
              Plus!
            </div>
            <div v-else>
              Vous êtes arrivé à la fin du journal
            </div>
          </div>
        </fieldset>
      </div>
      <div class="droite">
        <fieldset
          class="projets">
          <legend>
            Projets
          </legend>
          <ul>
            <li
              v-for="(projet, i) in mesProjets"
              :key="`projet-${i}`">
              <router-link
                :to="`/projet/${projet.id}`">
                {{ projet.nom }}
              </router-link> ({{ projet.nom_role }})
            </li>
          </ul>
          <span
            @click="emitter.emit('creerProjet')"
            class="bouton bouton-petit">
            Créer projet
          </span>
        </fieldset>
      </div>
    </div>
  </div>
  <div
    v-else>
    <a
      @click="emitter.emit('popupConnexion')">
      Connexion
    </a>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherCompetenceDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherCompetenceDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <div>
            </div>
            <div
              v-if="competenceAAfficher.avis.length">
              Ils ont recommandé:
              <table
                class="tableau">
                <thead>
                  <tr>
                    <th>
                      Évaluateur
                    </th>
                    <th>
                      Note
                    </th>
                    <th>
                      Date
                    </th>
                    <th>
                      Commentaire
                    </th>
                    <th>
                      Commentaire public
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="ev in competenceAAfficher.avis"
                    :key="`ev-${ev.id_attribution}-${ev.evaluateur}`">
                    <td>
                      <qui-est-ce
                        :nigendEnvoye="ev.evaluateur"
                        :key="`NIGEND-${ev.evaluateur}`" />
                    </td>
                    <td>
                      {{ ev.note }}
                    </td>
                    <td>
                      {{ $moment(ev.date_evaluation).format('DD/MM/YYYY H:mm') }}
                    </td>
                    <td>
                      {{ ev.commentaire }}
                    </td>
                    <td>
                      {{ ev.commentaire_public ? 'oui' : 'non' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-else>
              Personne n'a encore donné son avis sur cette compétence.
            </div>
          </div>
          <div>
            <div
              @click="afficherAvisCompetence(competenceAAfficher.id)"
              class="bouton bouton-petit">
              Donner mon avis
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
  getCurrentInstance,
  inject,
  computed,
  onMounted,
  ref,
  watch,
  reactive,
} from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  /* PencilPlusOutline, */
  Power,
} from 'mdue';
import Apercu from '@/components/Apercu.vue';
import JeuRobot from '@/components/JeuRobot.vue';
import Badge from '@/components/badges/Badge.vue';
import QuiEstCe from '@/components/QuiEstCe.vue';

export default defineComponent({
  name: 'MaPage',
  components: {
    JeuRobot,
    Badge,
    QuiEstCe,
    Apercu,
    /* PencilPlusOutline, */
    Power,
  },
  setup() {
    const scroll = ref({
      haut: true,
      bas: false,
    });
    const apiUrl = process.env.VUE_APP_API_URL;
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const store = useStore();
    const profils = computed(() => store.state.profils);
    const connexion = computed(() => store.state.connexion);
    const router = useRouter();
    const axios = inject('$axios');
    const toast = inject('$toast');
    const competences = ref([]);
    const badges = ref([]);
    const pageJournal = ref(0);
    const journal = ref([]);
    const finJournal = ref(false);
    const connexions = ref([]);
    const maconnexion = computed(() => connexions.value.filter((x) => x.masession)[0]);
    const mesProjets = ref([]);
    const afficherCompetenceDialog = ref(false);
    const competenceAAfficher = reactive({
      id: 0,
      avis: [],
    });

    function verifScroll() {
      const myDiv = document.getElementById('supraConteneur');
      scroll.value.haut = myDiv.scrollTop === 0;
      scroll.value.bas = myDiv.scrollHeight - myDiv.scrollTop === myDiv.offsetHeight;
      if (!finJournal.value && scroll.value.bas) { pageJournal.value += 1; }
    }

    function popupGererProfil(fonction) {
      emitter.emit('gererProfil', {
        fonction,
        afficherRobot: true,
      });
    }

    async function chargerBadges() {
      await axios.get(`${process.env.VUE_APP_API_URL}/badges`)
        .then((res) => {
          badges.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function chargerCompetences() {
      await axios.get(`${process.env.VUE_APP_API_URL}/competences/personnelles`)
        .then((res) => {
          competences.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function afficherCompetence(c) {
      competenceAAfficher.id = c;
      await axios.get(`${process.env.VUE_APP_API_URL}/competences/personnelles/${c}/avis/liste`)
        .then((res) => {
          competenceAAfficher.avis = [...res.data];
        })
        .catch((e) => {
          competenceAAfficher.avis.length = 0;
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        })
        .finally(() => {
          afficherCompetenceDialog.value = true;
        });
    }

    async function chargerJournal(p) {
      await axios.get(`${process.env.VUE_APP_API_URL}/fil/perso/${p}`)
        .then((res) => {
          if (res.data.length < 10) {
            finJournal.value = true;
          }
          journal.value.push(...res.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function deconnecterSession(c) {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr?')) {
        await axios.post(`${process.env.VUE_APP_API_URL}/deconnecter`, {
          connexion: c,
        })
          .then(() => {
            connexions.value = connexions.value.filter((x) => x.session !== c.session);
            // si c'est la session en question on redirige vers la page d'accueil
            if (c.masession) {
              store.dispatch('connexion/deconnecterUtilisateur');
              router.push({ path: '/', replace: true });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }

    async function chargerConnexions() {
      await axios.get(`${process.env.VUE_APP_API_URL}/sessions`)
        .then((res) => {
          connexions.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function chargerMesProjets() {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/mesprojets/tous`)
        .then((res) => {
          mesProjets.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    watch(pageJournal, (p) => {
      chargerJournal(p);
    });

    onMounted(async () => {
      await chargerConnexions();
      await chargerBadges();
      await chargerCompetences();
      await chargerJournal(pageJournal.value);
      await chargerMesProjets();
      emitter.on('projetCree', (projet) => {
        mesProjets.value.push(Object.assign(projet, {
          nom_role: 'chef',
        }));
      });
    });

    return {
      scroll,
      verifScroll,
      apiUrl,
      popupGererProfil,
      profils,
      connexion,

      competences,
      afficherCompetence,
      afficherCompetenceDialog,
      competenceAAfficher,
      badges,
      pageJournal,
      journal,
      finJournal,
      connexions,
      deconnecterSession,
      maconnexion,
      mesProjets,
    };
  },
});
</script>

<style scoped>
#maPage {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

header {
  font-family: 'Champagne & Limousines';
  font-size: 1em;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  padding: 0 20px 0 0;
  margin: -50px 0 0 14vw;
  z-index: 200;
}

a {
  color: black;
}

h1 {
  font-family: "Champagne & Limousines";
  font-variant: small-caps;
  margin: 0;
  padding: 0;
}

#supraConteneur {
  width: 100%;
  height: 100%;
  display: flex;
  overflow-y: auto;
}

.gauche, .droite {
  width: 15%;
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}

fieldset {
  font-family: "Caviar Dreams";
  text-align: left;
  background-color: #fffd;
}

.principal {
  width: 100%;
  height: 100%;
}

.principal fieldset {
  background-color: #fff9;
}

.journal ul {
  list-style-type: none;
}

.journal .entree {
  margin: 10px;
}

.journal .commentaire {
  font-style: italic;
}

.journal .date {
  font-weight: bold;
}

.finJournal {
  display: flex;
  justify-content: center;
}

.icone {
  cursor: pointer;
}

.deconnecter {
  width: 25px;
}
.deconnecter:hover {
  filter: invert(19%) sepia(66%) saturate(5280%) hue-rotate(354deg) brightness(77%) contrast(119%);
}

.edit:hover {
  filter: invert(22%) sepia(5%) saturate(9%) hue-rotate(321deg) brightness(100%) contrast(85%);
}

legend {
  font-weight: bold;
  font-size: 1.2em;
  font-variant: small-caps;
}

.listeBadges {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.listeBadges > * {
  margin: 5px;
}

.connexions {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.logoConnexion {
  cursor: pointer;
  width: 1.5vw;
}

.connexions li {
  display: flex;
  align-items: center;
}

.masession {
  font-style: italic;
  border-radius: 5px;
  background-color: #04abe3;
  padding: 2px;
  color: white;
}

.projets ul {
  padding: 5px;
}
</style>
