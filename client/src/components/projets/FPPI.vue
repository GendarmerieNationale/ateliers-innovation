<template>
  <div
    class="fppi">
    <h1>
      FPPI
    </h1>
    <div
      v-if="!fppi.initiee">
      <div
        class="msg info">
        Aucune FPPI n'a été initiée pour ce projet.
      </div>
      <p>
        Pour initier une FPPI, cliquez sur le bouton ci-dessous. Attention, la
        visibilité de votre projet ne sera plus publique: outre les membres du
        projet seuls ceux que vous aurez désigné dans l'interface de gestion
        de la visibilité pourront accéder à l'ensemble du projet.
      </p>
      <div
        class="bouton"
        @click="initierFPPI">
        Initier la FPPI
      </div>
    </div>
    <template
      v-else>
      <template
        v-for="(champ, i) in champs"
        :key="`champ-${i}`">
        <div
          class="champ">
          <label>
            <Popper
              arrow
              hover
              content="Modifier le champ"
              class="lien"
              v-if="![
              'stade_developpement',
              'objectifs',
              'calendrier',
              'partenariats',
              'schemas'].includes(champ.categorie) && projet.chef"
              @click="afficherModificationChampFPPI(champ.categorie)">
              <pencil-outline />
            </Popper>
            {{ champ.label }}
            <br />
            <small>
              {{ champ.souslabel }}
            </small>
          </label>
          <div
            v-if="![
            'stade_developpement',
            'calendrier',
            'objectifs',
            'partenariats',
            'schemas'].includes(champ.categorie)">
            <template v-if="fppi.contenu[champ.categorie]
                && fppi.contenu[champ.categorie].length">
              <p
                :key="`e-${i}`"
                v-for="(e, i) in fppi.contenu[champ.categorie].split('\n')">
                {{ e }}
              </p>
            </template>
            <div
              v-else
              class="msg avertissement important">
              Champ non rempli pour le moment.
            </div>
          </div>
          <template
            v-else>
            <template
              v-if="champ.categorie === 'schemas'">
              <div
                class="cards"
                v-if="projet.fichiers.filter((f) => f.type.indexOf('image') >= 0).length > 0">
                <div
                  :class="['card', { selectionne: fppi.contenu.schemas.includes(item.id) }]"
                  v-for="(item, i) in projet.fichiers.filter((f) => f.type.indexOf('image') >= 0)"
                  :key="`image-${i}`">
                  <div
                    class="bouton bouton-petit"
                    @click="selectionnerImage(item.id)">
                    {{ fppi.contenu.schemas.includes(item.id) ? 'Supprimer' : 'Sélectionner' }}
                  </div>
                  <span>
                    {{ item.description }}
                  </span>
                  <img
                    class="lien"
                    @click="selectionnerImage(item.id)"
                    :src="`${apiUrl}/fichiers/telechargement/${item.id}/${item.nom}/miniature`"/>
                </div>
              </div>
              <div
                v-else
                class="msg avertissement important">
                Pas d'image jointe au projet.
              </div>
            </template>
            <historique-projet
              v-if="champ.categorie === 'calendrier'" />
            <objectifs-projet
              v-if="champ.categorie === 'objectifs'" />
            <partenariats-projet
              v-if="champ.categorie === 'partenariats'" />
            <table
              class="tableau"
              v-if="champ.categorie === 'stade_developpement'">
              <thead>
                <tr>
                  <th>

                  </th>
                  <th>
                    Stade
                  </th>
                  <th>
                    Précision
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(s, j) in stadesDeveloppement"
                  :key="`stade-${j}`">
                  <td>
                    <input
                      type="radio"
                      :value="s.valeur"
                      v-model="fppi.contenu.stade_developpement"
                      :id="`s-${j}`"
                      />
                  </td>
                  <td>
                    <label
                      :for="`s-${j}`">
                      {{ s.valeur }}
                    </label>
                  </td>
                  <td>
                    <div
                      v-html="s.precision" />
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </template>
      <div
        :class="['bouton', { recherche: generationEnCours }]"
        @click="genererFPPI">
        Générer la FPPI
      </div>
    </template>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="modifierChampFPPIDialog"
      >
      <div
        class="fondOverlay"
        @click="modifierChampFPPIDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <textarea
              rows="5"
              cols="150" v-model="champAEnvoyer.contenu">
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
</template>

<script>

import {
  defineComponent,
  onMounted,
  inject,
  ref,
  reactive,
  computed,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import {
  useRoute,
} from 'vue-router';
import {
  PencilOutline,
} from 'mdue';
import HistoriqueProjet from '@/components/projets/components/HistoriqueProjet.vue';
import PartenariatsProjet from '@/components/projets/components/PartenariatsProjet.vue';
import ObjectifsProjet from '@/components/projets/components/ObjectifsProjet.vue';

export default defineComponent({
  name: 'FPPI',
  components: {
    PencilOutline,
    HistoriqueProjet,
    PartenariatsProjet,
    ObjectifsProjet,
  },
  setup() {
    const apiUrl = process.env.VUE_APP_API_URL;
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const route = useRoute();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const generationEnCours = ref(false);
    const fppi = reactive({
      initiee: false,
      contenu: {
        stade_developpement: 'INIT',
        experimentation: '',
        utilisateurs: '',
        gains: '',
        verrous: '',
        description: '',
        methode_moyens: '',
        autorite_informee: '',
        interet_manifeste: '',
        experimentateurs: '',
        besoin: '',
        etat_art: '',
        concurrents: '',
        tiers_exterieurs: '',
        applications_hors_gendarmerie: '',
        contraintes_juridiques: '',
        freins_difficultes: '',
        schemas: [],
      },
    });
    const modifierChampFPPIDialog = ref(false);
    const champAEnvoyer = reactive({
      categorie: '',
      contenu: '',
    });
    const champs = [
      {
        categorie: 'description',
        label: 'Description succincte:',
        souslabel: 'en 3 ou 4 phrases maximum décrire le problème (situation existante) et l’idée envisagée (Pour ..., il faudrait ... )',
      },
      {
        categorie: 'stade_developpement',
        label: 'Avancement actuel dans le développement:',
        souslabel: '',
      },
      {
        categorie: 'experimentation',
        label: 'Préciser si le produit a été testé à un de ces stades, et l’étendue de l’expérimentation:',
        souslabel: '',
      },
      {
        categorie: 'utilisateurs',
        label: 'Quels sont les utilisateurs potentiels:',
        souslabel: '',
      },
      {
        categorie: 'gains',
        label: 'Quel est l\'avantage concurrentiel de ce projet:',
        souslabel: '(gains, avantages par rapport aux éventuelles solutions actuellement disponibles...)',
      },
      {
        categorie: 'verrous',
        label: 'Décrire la solution envisagée. Quels sont les verrous que le projet vise à franchir:',
        souslabel: '(technologiques, ergonomiques, de processus, etc.)',
      },
      {
        categorie: 'methode_moyens',
        label: 'Décrire la méthode et les moyens pour concrétiser votre idée:',
        souslabel: '',
      },
      // {
      //   categorie: 'autorite_informee',
      //   label: 'Décrire les composants du projet:',
      //   souslabel: 'Solutions techniques (procédé, machine, molécule, etc.) - logiciels - prototype physique',
      // },
      {
        categorie: 'objectifs',
        label: 'Objectifs:',
        souslabel: '',
      },
      {
        categorie: 'calendrier',
        label: 'Calendrier du projet:',
        souslabel: '',
      },
      {
        categorie: 'autorite_informee',
        label: 'Autorité(s) interne(s) informée(s) du projet:',
        souslabel: '',
      },
      {
        categorie: 'interet_manifeste',
        label: 'Quel intérêt a été manifesté par ces autorités?',
        souslabel: '',
      },
      {
        categorie: 'experimentateurs',
        label: 'Disposez-vous d\'expérimentateurs?',
        souslabel: 'utilisateurs finaux intéressés, groupe utilisateur, unités prêtes à expérimenter le produit, etc.',
      },
      {
        categorie: 'besoin',
        label: 'Besoin exprimé',
        souslabel: 'financement (joindre un état prévisionnel du budget et du plan de financement éventuel), appui méthodologique, appui et conseil technique et/ou juridique',
      },
      {
        categorie: 'etat_art',
        label: 'Quel est l’état de l’art?',
        souslabel: 'Exposé des points caractéristiques des réalisations antérieures. Avantages, lacunes ou inconvénients des réalisations antérieures (critique objective). Préciser les éventuels brevets identifiés.',
      },
      {
        categorie: 'concurrents',
        label: 'Quels sont les éventuels produits concurrents et solutions nouvelles pouvant apporter une solution même partielle au problème identifié?',
        souslabel: '',
      },
      {
        categorie: 'partenariats',
        label: 'Avez-vous déjà identifié des partenaires potentiels?',
        souslabel: 'Listez-les le cas échéant, en précisant le rôle qu’ils pourraient jouer (bureau d’étude, fabrication d’un démonstrateur, fabrication en grande série)',
      },
      {
        categorie: 'tiers_exterieurs',
        label: 'Avez-vous déjà évoqué ce projet avec des tiers extérieurs à la GN (entreprises, laboratoires, etc.)?',
        souslabel: '(rappel : pour protéger vos intérêts et ceux de la GN, un engagement de confidentialité doit être signé avant toute communication)',
      },
      {
        categorie: 'applications_hors_gendarmerie',
        label: 'Quels sont les éventuelles applications en dehors de la gendarmerie nationale et des métiers de la sécurité en général?',
        souslabel: 'Si possible, estimer le niveau de demande et l’offre existante',
      },
      {
        categorie: 'contraintes_juridiques',
        label: 'Quelles sont les contraintes juridiques et réglementaires?',
        souslabel: '',
      },
      {
        categorie: 'freins_difficultes',
        label: 'Y a-t-il d’autres freins ou difficultés prévisibles?',
        souslabel: '(problèmes techniques, litiges sur la propriété intellectuelle, coût de mise en œuvre, frein normatif, réticence au changement, etc.)',
      },
      {
        categorie: 'schemas',
        label: 'Sélectionnez les schémas, plans, photos, vidéos illustrant l’innovation',
        souslabel: '',
      },
    ];
    const stadesDeveloppement = [
      {
        valeur: 'Déploiement opérationnel industrialisé',
        precision: `<u>Pour un objet:</u> prototype reproductible en grande série, marché d’acquisition déployé<br />
<u>Pour un logiciel:</u> déployé au niveau national`,
      },
      {
        valeur: 'Démonstrateur en conditions opérationnelles',
        precision: `<u>Pour un objet:</u> testé en situation réelle<br />
<u>Pour un logiciel:</u> testé intégré dans l’environnement informatique final`,
      },
      {
        valeur: 'Démonstrateur hors conditions opérationnelles',
        precision: `<u>Pour un objet:</u> testé à l’instruction<br />
<u>Pour un logiciel:</u> testé sans contraintes d’intégration (SSI, données temps réel, etc.)`,
      },
      {
        valeur: 'Maquette',
        precision: `<u>Pour un objet:</u> validation du fonctionnement général<br />
<u>Pour un logiciel:</u> validation de l’algorithme seul, avec des données théoriques`,
      },
      {
        valeur: 'Recherche fondamentale / études théoriques',
        precision: `<u>Pour un objet:</u> recherche de composants, de matériaux, de fournisseurs de pièces<br />
<u>Pour un logiciel:</u> écriture de l’algorithme`,
      },
      {
        valeur: 'Idée',
        precision: `Définition de la problématique et de la façon de la résoudre sur
le papier`,
      },
    ];

    function afficherModificationChampFPPI(cat) {
      champAEnvoyer.categorie = cat;
      champAEnvoyer.contenu = fppi.contenu[cat];
      modifierChampFPPIDialog.value = true;
    }

    async function chargerFPPI() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/fppi/${route.params.id}`)
        .then(async (res) => {
          fppi.initiee = true;
          fppi.contenu = { ...res.data };
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function initierFPPI() {
      await axios.post(`${process.env.VUE_APP_API_URL}/outils/fppi/${route.params.id}`)
        .then(async (res) => {
          await chargerFPPI();
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

    async function modifierchamp() {
      await axios.put(
        `${process.env.VUE_APP_API_URL}/outils/fppi/${route.params.id}`,
        champAEnvoyer,
      )
        .then((res) => {
          fppi.contenu[champAEnvoyer.categorie] = champAEnvoyer.contenu;
          modifierChampFPPIDialog.value = false;
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

    async function selectionnerImage(id) {
      await axios.post(`${process.env.VUE_APP_API_URL}/outils/fppi/${route.params.id}/image/${id}`)
        .then(async (res) => {
          switch (res.data.operation) {
            case 'ajout': {
              fppi.contenu.schemas.push(id);
              break;
            }
            case 'suppression': {
              fppi.contenu.schemas = fppi.contenu.schemas.filter((x) => x !== id);
              break;
            }
            default: {
              toast('⚠️ Opération inconnue', {
                type: 'error',
              });
            }
          }
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

    async function genererFPPI() {
      if (generationEnCours.value) {
        toast('⚠️ Génération en cours', {
          type: 'error',
        });
      } else {
        generationEnCours.value = true;
        await axios.get(`${process.env.VUE_APP_API_URL}/outils/fppi/${route.params.id}/genererPDF`)
          .then((res) => {
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
            generationEnCours.value = false;
          });
      }
    }

    watch(() => fppi.contenu.stade_developpement, async (s, sInit) => {
      if (sInit !== 'INIT') {
        champAEnvoyer.categorie = 'stade_developpement';
        champAEnvoyer.contenu = s;
        await modifierchamp();
      }
    });

    onMounted(async () => {
      await chargerFPPI();
    });

    return {
      apiUrl,
      fppi,
      projet,
      afficherModificationChampFPPI,
      modifierchamp,
      modifierChampFPPIDialog,
      champAEnvoyer,
      initierFPPI,
      champs,
      stadesDeveloppement,
      selectionnerImage,
      genererFPPI,
      generationEnCours,
    };
  },
});
</script>

<style scoped>
.fppi {
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 5%;
  padding-top: 20px;
  text-align: justify;
}

.champ {
  width: 100%;
  margin: 10px 0;
}

.champ label {
  font-weight: bold;
}

.champ label small {
  font-style: italic;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: row;
  max-height: 100vh;
}
.cards img {
  margin: 10px;
  border: 3px dotted #aaa;
  box-shadow: 3px 3px 8px 0px rgba(0,0,0,0.3);
  max-width: 23vw;
  max-height: 23vw;
}

.card {
  height: 100%;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
}

.cards .selectionne img {
  border: 3px solid green;
}
</style>
