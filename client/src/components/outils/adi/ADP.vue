<template>
  <div>
    <h3>
      <span
        v-if="$route.path.startsWith('/outils/adi/adp')"
        class="tooltip icone"
        data-tooltip-location="bottom"
        data-tooltip="Ajouter projet ADP">
        <pencil-plus-outline
          class="lien"
          @click="creer('ADP')" />
      </span>
      ADP
      <select
        v-model="annee">
        <option
          v-for="a in Array.from({length: 14}, (_, i) => i + 2007)"
          :key="`annee-${a}`"
          :value="a">{{ a }}</option>
      </select>
    </h3>
    <fieldset
      class="rubrique classement"
      v-if="classement.length > 0">
      <legend>
        <div class="pli"></div>
        Classement
      </legend>
      <table
        class="tableau">
        <thead>
          <tr>
            <th>
              Place
            </th>
            <th>
              Projet
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(rang, i) in classement.sort((a,b) => (a.place > b.place)
              ? 1
              : ((b.place > a.place)
              ? -1
              : 0))"
            :key="`class-${i}`">
            <td>
              {{ rang.place }}
            </td>
            <td>
              <router-link :to="`/projet/${rang.id}/adp`">
                {{ rang.nom }}
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>
    <fieldset
      class="rubrique ateliers"
      v-if="Object.keys(ateliers).length > 0">
      <legend>
        <div class="pli"></div>
        Ateliers
      </legend>
      <fieldset
        class="rubrique ateliers nomatelier"
        v-for="(atelier, nom, i) in ateliers"
        :key="`atelier-${i}`">
        <legend>
          <div class="pli"></div>
          {{ nom }}
        </legend>
        <fieldset
          v-for="(ps, categorie, j) in atelier"
          :key="`categorie-${j}`">
          <legend>
            {{ categorie }}
          </legend>
          <ul>
            <li
              :class="{ laureat: p.laureat }"
              v-for="(p, k) in ps"
              :key="`projets-${k}`">
              <projet-adp :projet="p" />
            </li>
          </ul>
        </fieldset>
      </fieldset>
    </fieldset>
    <fieldset
      class="rubrique categories"
      v-if="Object.keys(categories).length > 0">
      <legend>
        <div class="pli"></div>
        Catégories
      </legend>
      <fieldset
        v-for="(ps, categorie, i) in categories"
        :key="`categorie-${i}`">
        <legend>
          {{ categorie }}
        </legend>
        <ul>
          <li
            :class="{ laureat: p.laureat }"
            v-for="(p, j) in ps"
            :key="`projets-${j}`">
            <projet-adp :projet="p" />
          </li>
        </ul>
      </fieldset>
    </fieldset>
    <fieldset
      class="rubrique nonretenus"
      v-if="nonretenus.length > 0">
      <legend>
        <div class="pli"></div>
        Non retenus
      </legend>
      <ul>
        <li
          v-for="(p, i) in nonretenus"
          :key="`nonretenus-${i}`">
          <projet-adp :projet="p" />
          <span class="motifrejet">
            ({{ p.motif_rejet }})
          </span>
        </li>
      </ul>
    </fieldset>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="creerADPDialog"
      >
      <div
        class="fondOverlay"
        @click="creerADPDialog = false">
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
              v-if="projets.length > 0"
              class="selectionProjet">
              Sélectionner un projet:
              <select
                v-model="idProjetSelectionne">
                <option
                  v-for="projet in projets.sort((a, b) => {
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
        <div>
          <label>Année:</label>
          <input
          type="number"
          min="2006"
          max="2020"
          v-model="adp.annee_adp"/>
        </div>
        <div>
          <div>
            <span
              class="bouton bouton-petit"
              @click="creerAtelierDialog = true">
              Nouvel atelier
            </span>
            <span
              v-if="ateliersDispos.length > 0">
              Sélectionner un atelier:
              <select
                v-model="adp.id_atelier">
                <option :value="null">
                </option>
                <option
                  v-for="atelier in ateliersDispos.sort((a, b) => {
                    return (a.nom.toLowerCase() < b.nom.toLowerCase())
                    ? -1 : (a.nom.toLowerCase() > b.nom.toLowerCase()) ? 1 : 0;
                  })"
                  :key="`atelier-${atelier.id}`"
                  :value="atelier.id">{{ atelier.nom }}</option>
              </select>
            </span>
            <span
              v-else>
              Pas d'atelier, créez-en un en cliquant sur "Nouvel atelier".
            </span>
          </div>
        </div>
        <div>
          <span
            v-if="categoriesDispos.length > 0">
            Sélectionner une catégorie:
            <select
              v-model="adp.id_categorie">
              <option
                v-for="categorie in categoriesDispos.sort((a, b) => {
                  return (a.nom.toLowerCase() < b.nom.toLowerCase())
                  ? -1 : (a.nom.toLowerCase() > b.nom.toLowerCase()) ? 1 : 0;
                })"
                :key="`atelier-${categorie.id}`"
                :value="categorie.id">{{ categorie.nom }}</option>
            </select>
          </span>
        </div>
        <div>
          <label>Place:</label>
          <input
          type="number"
          v-model="adp.place"/>
        </div>
        <div>
          <div>
            <input
              type="checkbox"
              id="accepte"
              v-model="adp.accepte" />
            <label for="accepte">Accepté</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="laureat"
              v-model="adp.laureat" />
            <label for="laureat">Lauréat</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="fdr"
              v-model="adp.fdr" />
            <label for="fdr">Feuille de route</label>
          </div>
          <div>
            <label>Motif de rejet:</label>
            <textarea
            placeholder="Pourquoi le truc il a été tej?"
            v-model="adp.motif_rejet"/>
          </div>
        </div>
        <span
          @click="creerADP"
          class="bouton">
          Créer/Mettre à jour
        </span>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="creerAtelierDialog"
      >
      <div
        class="fondOverlay"
        @click="creerAtelierDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Nom de l'atelier:</label>
            <input
              type="text"
              v-model="atelierACreer"/>
          </div>
          <span
            v-if="atelierACreer.length"
            @click="creerAtelier"
            class="bouton">
              Créer
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  onMounted,
  ref,
  watch,
  inject,
  reactive,
  getCurrentInstance,
} from 'vue';
import { useRoute } from 'vue-router';
import {
  PencilPlusOutline,
} from 'mdue';
import ProjetAdp from './ProjetAdp.vue';

export default {
  name: 'ADP',
  components: {
    ProjetAdp,
    PencilPlusOutline,
  },
  setup() {
    const route = useRoute();
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const toast = inject('$toast');
    const axios = inject('$axios');
    const annee = ref('');
    const projets = ref([]);
    const classement = ref([]);
    const ateliers = ref({});
    const categories = ref({});
    const nonretenus = ref([]);
    const creerADPDialog = ref(false);
    const adp = reactive({
      id_projet: 0,
      objectif: '',
      benefices: '',
      accepte: false,
      laureat: false,
      fdr: false,
      place: '',
      annee_adp: '',
      id_atelier: 0,
      id_categorie: 0,
      motif_rejet: '',
      date_inscription: '',
    });
    const creation = ref(false);
    const idProjetSelectionne = ref(0);
    const ateliersDispos = ref([]);
    const creerAtelierDialog = ref(false);
    const atelierACreer = ref('');
    const categoriesDispos = ref([]);

    async function chargerProjetsADP(a) {
      classement.value = [];
      nonretenus.value = [];
      ateliers.value = {};
      categories.value = {};
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/adp/projets/annee/${a}`)
        .then((res) => {
          res.data.forEach((projet) => {
            if (projet.nom_atelier) {
              if (!(Object.keys(ateliers.value).includes(projet.nom_atelier))) {
                ateliers.value[projet.nom_atelier] = {
                  [projet.nom_categorie]: [projet],
                };
              } else if (!(Object.keys(ateliers.value[projet.nom_atelier]).includes(projet.nom_categorie))) {
                ateliers.value[projet.nom_atelier][projet.nom_categorie] = [projet];
              } else {
                ateliers.value[projet.nom_atelier][projet.nom_categorie].push(projet);
              }
            } else if (projet.nom_categorie) {
              if (!(Object.keys(categories.value).includes(projet.nom_categorie))) {
                categories.value[projet.nom_categorie] = [projet];
              } else {
                categories.value[projet.nom_categorie].push(projet);
              }
            }

            if (!projet.accepte) {
              nonretenus.value.push(projet);
            }

            // si le projet est classé, on actualise le classement
            if (projet.place) {
              classement.value.push({
                id: projet.id_projet,
                place: projet.place,
                nom: projet.nom_projet,
              });
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }

    watch(annee, async (a) => {
      await chargerProjetsADP(a);
    });

    watch(idProjetSelectionne, async (x) => {
      const p = projets.value.find((pp) => pp.id === x);
      adp.id_projet = p.id;
      adp.objectif = p.objectif;
      adp.benefices = p.benefices;
      adp.accepte = p.accepte;
      adp.laureat = p.laureat;
      adp.fdr = p.fdr;
      adp.place = p.place;
      adp.annee_adp = p.annee_adp;
      adp.id_atelier = p.id_atelier;
      adp.id_categorie = p.id_categorie;
      adp.motif_rejet = p.motif_rejet;
      adp.date_inscription = p.date_inscription;
    });

    async function chargerTousProjetsADP() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/adp/projets`)
        .then((res) => {
          projets.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function chargerAteliersDispos() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/adp/ateliers`)
        .then((res) => {
          ateliersDispos.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function chargerCategoriesDispos() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/categories`)
        .then((res) => {
          categoriesDispos.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function creerADP() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Création en cours');
      }
      // if (adp.titre.length === 0) {
      //   erreur.push('Veuillez entrer un titre');
      // }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/adp/creer`,
          adp,
        )
          .then((res) => {
            console.log(res.data);
            toast('✅ Projet ajouté', {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          })
          .finally(() => {
            creerADPDialog.value = false;
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

    async function creerAtelier() {
      const erreur = [];
      if (creation.value) {
        erreur.push('Création en cours');
      }
      // if (adp.titre.length === 0) {
      //   erreur.push('Veuillez entrer un titre');
      // }
      if (!erreur.length) {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/adp/atelier/creer`,
          { nom: atelierACreer.value },
        )
          .then((res) => {
            ateliersDispos.value.push(res.data);
            adp.id_atelier = res.data.id;
            toast('✅ Atelier ajouté', {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          })
          .finally(() => {
            creerAtelierDialog.value = false;
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

    onMounted(async () => {
      if (route.params.annee >= 2006 && route.params.annee <= 2020) {
        annee.value = route.params.annee;
      } else {
        annee.value = '2020';
      }
      // await chargerProjetsADP(annee.value);
      await chargerTousProjetsADP();
      await chargerAteliersDispos();
      await chargerCategoriesDispos();
      // on charge les projets pour le formulaire, en vérifiant côté serveur que le mec ait bien le droit
      emitter.on('creerADP', () => {
        creerADPDialog.value = true;
      });
      emitter.on('projetCree', (p) => {
        projets.value.push(p);
        idProjetSelectionne.value = p.id;
      });
    });

    function creer(a) {
      emitter.emit(`creer${a}`);
    }

    return {
      annee,
      projets,
      classement,
      ateliers,
      categories,
      nonretenus,
      creerADPDialog,
      creerADP,
      adp,
      idProjetSelectionne,
      ateliersDispos,
      creerAtelierDialog,
      atelierACreer,
      creerAtelier,
      categoriesDispos,
      creer,
    };
  },
};
</script>

<style scoped>
.classement {
  display: flex;
  justify-content: center;
}

.icone img {
  height: 20px;
  margin: 0 10px;
  cursor: pointer;
}

ul {
  text-align: left;
}

li.laureat {
  list-style-type: "\1F947";
}

fieldset {
  border: none;
  background-color: #fffa;
  margin: 20px;
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

.classement .pli {
  border-top: 15px solid #14907a;
}
.classement > legend {
  background-image: linear-gradient(0deg, rgb(244, 243, 33) 40%, rgb(16, 255, 0) 100%);
}
.nonretenus .pli {
  border-top: 15px solid #af0b41;
}
.nonretenus > legend {
  background-image: linear-gradient(0deg, rgba(237,18,139,1) 26%, rgba(247,187,105,1) 75%);
}
.categories .pli, .ateliers .pli {
  border-top: 15px solid #25a6ec;
}
.categories > legend, .ateliers > legend {
  background-image: linear-gradient(0deg, rgba(80,255,251,1) 26%, rgba(183,255,242,1) 75%);
}
.nomatelier .pli, .nomatelier > legend {
  filter: grayscale(60%);
}
</style>
