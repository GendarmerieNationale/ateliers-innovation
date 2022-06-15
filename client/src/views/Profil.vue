<template>
  <div
    id="profil">
    <header>
      <h1>
        {{ personne.nom }}
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
              :nigend="$route.params.id" />
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
                  class="lien"
                  :data-badge="competence.recommandes > 0 ? competence.recommandes : null"
                  @click="afficherCompetence(competence.id)">
                  {{ competence.nom }}
                </span>
              </Popper>
            </span>
          </div>
        </fieldset>
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
              <template
                 v-if="entree.type === 'projet'">
                 <span v-if="entree.lien.typeProjet === 'creation'">
                   a créé un projet
                 </span>
                 <span v-if="entree.lien.typeProjet === 'role'">
                   a désormais le rôle "{{ entree.lien.role }}" pour le projet
                 </span>
                 <span v-if="entree.lien.typeProjet === 'finrole'">
                   n'est désormais plus "{{ entree.lien.role }}" pour le projet
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
                :key="`badge-${personne.nigend}-${entree.lien.idBadge}-${entree.lien.niveau}`"
                :type="entree.lien.idBadge"
                :niveau="entree.lien.niveau"
                :nigend="personne.nigend" />
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
        </fieldset>
      </div>
    </div>
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
                      Date
                    </th>
                    <th>
                      Commentaire
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
                      {{ $moment(ev.date_evaluation).format('DD/MM/YYYY H:mm') }}
                    </td>
                    <td>
                      {{ ev.commentaire }}
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

  <transition name="fade">
    <div
      class="overlay"
      v-if="avisCompetenceDialog"
      >
      <div
        class="fondOverlay"
        @click="avisCompetenceDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Je recommande:</label>
            <input
              v-model="avisCompetence.recommande"
              type="radio"
              id="recommandationOui"
              value="true"/>
            <label
              for="recommandationOui">oui</label>
            <input
              v-model="avisCompetence.recommande"
              type="radio"
              id="recommandationNon"
              value="false"/>
            <label
              for="recommandationNon">non</label>
          </div>
          <div>
            <div>
              <label>
                <input
                  type="checkbox"
                  v-model="avisCompetence.note.donnee" />
                Je lui donne une note
                <span v-if="avisCompetence.note.donnee">:</span>
              </label>
            </div>
            <div
              class="msg info">
              Ma note ne sera visible que de l'intéressé
              afin qu'il puisse se situer (il saura qui a donné la note).
            </div>
            <div
              v-if="avisCompetence.note.donnee"
              class="sliderNote">
              <h2>{{ avisCompetence.note.valeur }}</h2>
              <input
                v-model="avisCompetence.note.valeur"
                type="range"
                min="0"
                max="10" />
            </div>
          </div>
          <div>
            <label>Mon commentaire:</label>
            <input
              v-model="avisCompetence.commentaire.public"
              type="radio"
              id="commentairePublicOui"
              value="true"/>
            <label
              for="commentairePublicOui">public</label>
            <input
              v-model="avisCompetence.commentaire.public"
              type="radio"
              id="commentairePublicNon"
              value="false"/>
            <label
              for="commentairePublicNon">non, seul l'intéressé pourra le lire</label>
            <textarea
              cols="50"
              rows="5"
              v-model="avisCompetence.commentaire.valeur" />
          </div>
          <div>
            <div
              @click="publierAvisCompetence"
              class="bouton bouton-petit">
              Publier l'avis
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
  inject,
  onMounted,
  ref,
  watch,
  reactive,
} from 'vue';
import { useRoute } from 'vue-router';
import Apercu from '@/components/Apercu.vue';
import Badge from '@/components/badges/Badge.vue';
import QuiEstCe from '@/components/QuiEstCe.vue';

export default defineComponent({
  name: 'Profil',
  components: {
    Badge,
    Apercu,
    QuiEstCe,
  },
  setup() {
    const route = useRoute();
    const scroll = ref({
      haut: true,
      bas: false,
    });
    const apiUrl = process.env.VUE_APP_API_URL;
    const axios = inject('$axios');
    const toast = inject('$toast');
    const personne = ref({});
    const badges = ref([]);
    const pageJournal = ref(0);
    const journal = ref([]);
    const finJournal = ref(false);
    const mesProjets = ref([]);
    const competences = ref([]);
    const avisCompetenceDialog = ref(false);
    const avisCompetence = reactive({
      idCompetence: 0,
      recommande: false,
      note: {
        donnee: false,
        valeur: 0,
      },
      commentaire: {
        public: false,
        valeur: '',
      },
    });
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

    async function chargerPersonne() {
      await axios.get(`${process.env.VUE_APP_API_URL}/quiestce/unique/personnels/${route.params.id}`)
        .then((res) => {
          personne.value = { ...res.data };
        })
        .catch((e) => {
          console.log(e);
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

    async function chargerJournal(p) {
      await axios.get(`${process.env.VUE_APP_API_URL}/fil/${route.params.id}/${p}`)
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

    async function chargerMesProjets() {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/parnigend/${route.params.id}/tous`)
        .then((res) => {
          mesProjets.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function chargerCompetences() {
      await axios.get(`${process.env.VUE_APP_API_URL}/competences/personnelles/${route.params.id}`)
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

    async function afficherAvisCompetence(c) {
      avisCompetence.idCompetence = c;
      await axios.get(`${process.env.VUE_APP_API_URL}/competences/personnelles/${c}/avis`)
        .then((res) => {
          avisCompetence.recommande = res.data.recommande;
          avisCompetence.note.donnee = res.data.note !== null;
          avisCompetence.note.valeur = res.data.note;
          avisCompetence.commentaire.public = res.data.commentaire_public;
          avisCompetence.commentaire.valeur = res.data.commentaire;
        })
        .catch((e) => {
          avisCompetence.recommande = false;
          avisCompetence.note.donnee = null;
          avisCompetence.note.valeur = 0;
          avisCompetence.commentaire.public = false;
          avisCompetence.commentaire.valeur = '';
          avisCompetenceDialog.value = false;
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        })
        .finally(() => {
          avisCompetenceDialog.value = true;
        });
    }

    async function publierAvisCompetence() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/competences/personnelles/${avisCompetence.idCompetence}/avis`,
        avisCompetence,
      )
        .then((res) => {
          toast(`✅ ${res.data.msg}`, {
            type: 'success',
          });
          avisCompetence.idCompetence = 0;
          avisCompetence.recommande = false;
          avisCompetence.note.donnee = null;
          avisCompetence.note.valeur = 0;
          avisCompetence.commentaire.public = false;
          avisCompetence.commentaire.valeur = '';
          avisCompetenceDialog.value = false;
          afficherCompetence(competenceAAfficher.id);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    watch(pageJournal, (p) => {
      chargerJournal(p);
    });

    onMounted(async () => {
      await chargerPersonne();
      await chargerBadges();
      await chargerCompetences();
      await chargerJournal(pageJournal.value);
      await chargerMesProjets();
    });

    return {
      scroll,
      verifScroll,
      apiUrl,
      personne,
      badges,
      pageJournal,
      journal,
      finJournal,
      mesProjets,
      competences,
      afficherAvisCompetence,
      avisCompetenceDialog,
      avisCompetence,
      publierAvisCompetence,
      afficherCompetence,
      afficherCompetenceDialog,
      competenceAAfficher,
    };
  },
});
</script>

<style scoped>
#profil {
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

.edit {
  width: 20px;
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

.projets ul {
  padding: 5px;
}

.sliderNote {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
