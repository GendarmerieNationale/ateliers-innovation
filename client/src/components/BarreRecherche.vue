<template>
  <div id="enveloppeBarre">
    <div>
      <span
        class="tooltip"
        data-tooltip="Recherche"
        id="loupe"
        @click="dialogRecherche = true">
        <Magnify class="iconeMenu" />
      </span>
      <router-link
        v-if="connecte"
        to="/mapage">
        <span
          id="user"
          data-tooltip="Ma page"
          class="tooltip">
          <Account class="iconeMenu" />
        </span>
      </router-link>
      <span
        v-else
        id="user"
        data-tooltip="Se connecter"
        @click="emitter.emit('popupConnexion')"
        class="tooltip">
        <account-arrow-left class="iconeMenu" />
      </span>
      <span
        class="tooltip"
        data-tooltip="Menu"
        @click="dialogMenu = true"
        id="boutonMenuHamburger">
        <Menu class="iconeMenu" />
      </span>
      <span
        class="tooltip"
        data-tooltip="Mentions légales"
        @click="dialogMentionsLegales = true"
        id="boutonMentionsLegales">
        <scale-balance class="iconeMenu" />
      </span>
      <span
        class="tooltip"
        data-tooltip="Remarque"
        @click="afficherRemarqueDialog"
        id="boutonRemarque">
        <lightbulb-outline class="iconeMenu" />
        <span class="lumiere"></span>
      </span>
      <span
        class="tooltip"
        data-tooltip="Développement"
        @click="developpementDialog = true"
        id="boutonCode">
        <code-braces class="iconeMenu" />
      </span>
    </div>
  </div>

  <transition name="fade">
    <div
      id="rechercheOverlay"
      v-if="dialogRecherche"
      >
      <div
        class="fondOverlay"
        @click="dialogRecherche = false">
      </div>
      <div class="contenuMenuOverlay">
        <div>
          <div class="formRecherche">
            <Magnify class="iconeRecherche" />
            <input
              placeholder="Que recherchez-vous?"
              id="boutonRecherche"
              type="text"
              v-model="criteresRecherche.chaine" />
          </div>
          <ul class="cases">
            <template
              v-for="(prop, cle) in outils"
              :key="`outils-${cle}`">
              <li>
                <input
                  type="checkbox"
                  :id="`recherche_${cle}`"
                  v-model="criteresRecherche.outils[cle]" />
                <label
                  :for="`recherche_${cle}`">{{ prop }}</label>
              </li>
            </template>
          </ul>
          <div
            v-if="rechercheEnCours"
            id="rechercheEnCours">
            Recherche en cours...
          </div>
          <div
            v-else
            class="listeResultatsRecherche">
            <span
              id="aucunResultat"
              v-if="resultatsRecherche && resultatsRecherche.nbResultats === 0">
              Aucun résultat!
            </span>
            <template v-if="resultatsRecherche && resultatsRecherche.nbResultats !== 0">
              <div
              v-for="(cat, i) in Object.keys(resultatsRecherche)"
              :key="`resultatRechercheCategorie-${i}`">
                <div
                  v-if="cat === 'nbResultats'">
                  {{ resultatsRecherche.nbResultats }} résultats:
                </div>
                <fieldset
                  v-else>
                  <legend>
                    {{ cat }} ({{ resultatsRecherche[cat].length }})
                  </legend>
                  <ul>
                    <li
                      :key="`resultatRecherche-${i}`"
                      v-for="(resultat, i) in resultatsRecherche[cat]">
                      <!-- Si c'est une publication -->
                      <template
                        v-if="['actu', 'article', 'dossier', 'portrait'].includes(resultat.type)">
                        <router-link :to="`/${resultat.type}/${resultat.id}`">
                          <span class="titre">
                            {{ resultat.titre }}
                          </span>
                        </router-link>
                      </template>
                      <!-- Si c'est une photo -->
                      <a
                        target="_blank"
                        :href="`${apiUrl}/fichiers/telechargement/${resultat.id}/${resultat.lien.lien}`"
                        v-if="['phototheque', 'mediatheque', 'piecejointe'].includes(resultat.type)">
                        <span class="titre">
                          {{ resultat.titre }}
                        </span>
                      </a>
                      <template
                        v-if="resultat.type === 'piecejointe'">
                        dans
                        <router-link :to="`/${resultat.lien.typejointure.slice(0, -1)}/${resultat.lien.jointure}`">
                          <span class="titre">
                            cet article
                          </span>
                        </router-link>
                      </template>
                      <!-- Si c'est un projet -->
                      <router-link
                        :to="`/projet/${resultat.id}`"
                        v-if="resultat.type === 'projet'">
                        <span class="titre">
                          {{ resultat.titre }}
                        </span>
                      </router-link>
                      <!-- Si c'est un sujet d'études -->
                      <router-link
                        :to="`/outils/etudes/sujet/${resultat.id}`"
                        v-if="resultat.type === 'sujet_etude'">
                        <span class="titre">
                          {{ resultat.titre }}
                        </span>
                      </router-link>
                      <!-- Si c'est une entreprise -->
                      <router-link
                        :to="`/outils/gendindus/entites/entreprise/${resultat.id}`"
                        v-if="resultat.type === 'entreprise'">
                        <span class="titre">
                          {{ resultat.titre }}
                        </span>
                      </router-link>
                      <!-- Si c'est un document -->
                      <!-- Si c'est un contact -->
                      <template
                        v-if="['contact'].includes(resultat.type)">
                        <router-link :to="`/outils/gendindus/contacts/${resultat.id}`">
                          <span class="titre">
                            {{ resultat.titre }}
                          </span>
                        </router-link>
                      </template>
                      <template
                        v-if="['evenement'].includes(resultat.type)">
                        <template
                          v-if="resultat.type_evenement === 'gendindus'">
                        </template>
                        <router-link :to="`/outils/gendindus/evenements/${resultat.id}`">
                          <span class="titre">
                            {{ resultat.titre }}
                          </span>
                        </router-link>
                      </template>
                    </li>
                  </ul>
                </fieldset>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div
      id="menuOverlay"
      v-if="dialogMenu"
      >
      <div
        class="fondOverlay"
        @click="dialogMenu = false">
      </div>
      <ul class="contenuMenuOverlay menu">
        <li v-for="(rub, i) in menu" :key="`menuPrincipal-${i}`">
          <span
            v-if="rub.sousmenu && rub.sousmenu.length > 0"
            @click="rubriqueActive = rubriqueActive === i ? -1 : i">
            <Minus
              class="lien"
              v-if="rubriqueActive === i" />
            <Plus
              class="lien"
              v-else />
          </span>
          <span v-else class="vide"></span>
          <router-link :to="rub.lien">
            <span class="lienHover">{{ rub.nom }}</span>
          </router-link>
          <ul
            class="menu"
            v-if="rubriqueActive === i">
            <li
              class="sousMenu"
              v-for="(srub, j) in rub.sousmenu"
              :key="`menuPrincipal-${i}-${j}`">
              <router-link :to="srub.lien">
                <span class="lienHover">{{ srub.nom }}</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </transition>
  <transition name="fade">
    <div
      id="envoyerRemarqueOverlay"
      v-if="envoyerRemarqueDialog"
      >
      <div
        class="fondOverlay"
        @click="envoyerRemarqueDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <template
          v-if="urlRemarque.length === 0">
          <div>
            <div>
              <fieldset>
                <legend>
                  Type de remarque
                </legend>
                <input
                  type="radio"
                  v-model="remarque.type"
                  id="radioQuestion"
                  value="question">
                <label for="radioQuestion">Question</label>
                <input
                  type="radio"
                  v-model="remarque.type"
                  id="radioAnomalie"
                  value="anomalie">
                <label for="radioAnomalie">Anomalie</label>
                <input
                  type="radio"
                  v-model="remarque.type"
                  id="radioSuggestion"
                  value="suggestion">
                <label for="radioSuggestion">Suggestion</label>
              </fieldset>
            </div>
            <div>
              <fieldset>
                <legend>
                  Titre (explication succincte)
                </legend>
                <input
                  type="text"
                  v-model="remarque.titre"/>
              </fieldset>
            </div>
            <div>
              <fieldset>
                <legend>
                  Précisions
                </legend>
                <textarea v-model="remarque.corps" />
              </fieldset>
            </div>
            <div>
              <div
              v-if="remarque.type === 'anomalie'"
              class="msg info">
                Merci de préciser ce à quoi vous vous attendiez, les étapes que vous
                avez réalisées et le résultat obtenu à tort.
              </div>
            </div>
          </div>
          <span
            @click="envoyerRemarque"
            class="bouton">
            Envoyer la remarque
          </span>
          <a
            :href="`mailto:intranet-transformation@gendarmerie.interieur.gouv.fr?subject=[${remarque.type.toUpperCase()}] ${remarque.titre}&body=${remarque.corps}`">
            <span
              class="bouton bouton-tres-petit">
              Je préfère envoyer un courriel
            </span>
          </a>
        </template>
        <template
          v-else>
          <div>
            Vous pouvez consulter la remarque sur Omnibus (l'outil où est géré le projet)
          </div>
          <a
            :href="urlRemarque"
            target="_blank">
            <span
              class="bouton">
              ici
            </span>
          </a>
          <span
            @click="envoyerRemarqueDialog = false"
            class="bouton bouton-petit">
            Fermer
          </span>
        </template>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      id="mentionsLegalesOverlay"
      v-if="dialogMentionsLegales"
      >
      <div
        class="fondOverlay"
        @click="dialogMentionsLegales = false">
      </div>
      <div class="contenuMenuOverlay">
        <mentions-legales />
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div
      id="developpementOverlay"
      v-if="developpementDialog"
      >
      <div
        class="fondOverlay"
        @click="developpementDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          VERSION {{ version }}
          <div id="boutonsDev">
            <a
              target="_blank"
              href="https://omnibus-pic.gendarmerie.fr/service-de-la-transformation/site-intranet-du-service-de-la-transformation">
              <span class="bouton bouton-petit">
                Code sur Omnibus
              </span>
            </a>
            <a
              target="_blank"
              :href="`${apiUrl}/docs/`">
              <span class="bouton bouton-petit">
                Documentation des API
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  ref,
  reactive,
  watch,
  onMounted,
  inject,
  getCurrentInstance,
  toRefs,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Menu,
  ScaleBalance,
  Magnify,
  Account,
  AccountArrowLeft,
  LightbulbOutline,
  Plus,
  Minus,
  CodeBraces,
} from 'mdue';
import MentionsLegales from '@/components/MentionsLegales.vue';

export default {
  name: 'BarreRecherche',
  components: {
    MentionsLegales,
    Menu,
    ScaleBalance,
    Magnify,
    Account,
    AccountArrowLeft,
    LightbulbOutline,
    Plus,
    Minus,
    CodeBraces,
  },
  props: {
    connecte: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { connecte } = toRefs(props);
    const toast = inject('$toast');
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const axios = inject('$axios');
    const apiUrl = process.env.VUE_APP_API_URL;
    const { version } = internalInstance
      .appContext.config.globalProperties;
    const router = useRouter();
    const route = useRoute();
    const dialogMentionsLegales = ref(false);
    const dialogMenu = ref(false);
    const dialogRecherche = ref(false);
    const rechercheEnCours = ref(false);
    const resultatsRecherche = ref(null);
    const outils = ref({
      gendindus: 'Gendindus',
      etudes: 'Études',
      evenements: 'Événements',
    });
    const criteresRecherche = reactive({
      chaine: '',
      outils: {},
    });
    const rubriqueActive = ref(-1);
    const menu = ref([]);
    const developpementDialog = ref(false);
    const remarque = reactive({
      type: 'question',
      titre: '',
      corps: '',
      page: '',
    });
    const envoyerRemarqueDialog = ref(false);
    const urlRemarque = ref('null');
    let timeout = null;

    async function recherche() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/recherche/`,
        criteresRecherche,
      )
        .then((res) => {
          resultatsRecherche.value = { nbResultats: 0 };
          res.data.forEach((item) => {
            resultatsRecherche.value.nbResultats += 1;
            if (item.typeclair in resultatsRecherche.value) {
              resultatsRecherche.value[item.typeclair].push(item);
            } else {
              resultatsRecherche.value[item.typeclair] = [item];
            }
          });
        })
        .catch((e) => {
          console.log(e.response.data);
        })
        .finally(() => {
          rechercheEnCours.value = false;
        });
    }

    router.beforeEach((to, from, next) => {
      dialogRecherche.value = false;
      dialogMenu.value = false;
      next();
    });

    watch(() => criteresRecherche.chaine, (n) => {
      rechercheEnCours.value = false;
      clearTimeout(timeout);
      if (n.length > 0) {
        timeout = setTimeout(() => {
          rechercheEnCours.value = true;
          recherche();
        }, 1000);
      }
    });

    async function chargerMenu() {
      await axios.get(`${process.env.VUE_APP_API_URL}/config/menu`)
        .then((res) => {
          menu.value = [...res.data];
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function envoyerRemarque() {
      remarque.page = route.fullPath;
      const erreurs = [];
      if (remarque.titre.length === 0) {
        erreurs.push('Il faut mettre un titre!');
      }
      if (remarque.corps.length === 0) {
        erreurs.push('Il faut écrire une remarque!');
      }
      if (!['question', 'anomalie', 'suggestion'].includes(remarque.type)) {
        erreurs.push('Espèce de pirate des caraïbes!');
      }
      if (erreurs.length === 0) {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/remarques`,
          remarque,
        )
          .then((res) => {
            toast('✅ Remarque envoyée', {
              type: 'success',
            });
            urlRemarque.value = res.data.url;
          })
          .catch((e) => {
            toast(`⚠️ ${e}`, {
              type: 'error',
            });
          });
      } else {
        erreurs.forEach((item) => {
          toast(`⚠️ ${item}`, {
            type: 'error',
          });
        });
      }
    }

    function afficherRemarqueDialog() {
      if (connecte.value) {
        urlRemarque.value = '';
        envoyerRemarqueDialog.value = true;
      } else {
        emitter.emit('popupConnexion');
      }
    }

    onMounted(async () => {
      await chargerMenu();
    });

    return {
      apiUrl,
      version,
      outils,
      criteresRecherche,
      dialogMenu,
      dialogRecherche,
      recherche,
      resultatsRecherche,
      menu,
      rubriqueActive,
      rechercheEnCours,
      afficherRemarqueDialog,
      urlRemarque,
      remarque,
      envoyerRemarqueDialog,
      envoyerRemarque,
      dialogMentionsLegales,
      developpementDialog,
    };
  },
};

</script>

<style scoped>
a {
  color: black;
}

.tooltip {
  position: relative;
  display: inline-block;
}

#menuOverlay,
#rechercheOverlay,
#mentionsLegalesOverlay,
#envoyerRemarqueOverlay,
#developpementOverlay {
  z-index: 200;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#menuOverlay .contenuMenuOverlay {
  width: 30%;
  padding: 20px;
  margin: 20px;
  border: 2px solid white;
  text-align: left;
  font-size: 2em;
  font-variant: small-caps;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 200;
}

#rechercheOverlay .contenuMenuOverlay,
#mentionsLegalesOverlay .contenuMenuOverlay
 {
  width: 80%;
  height: 90%;
  padding: 20px;
  margin: 20px;
  text-align: center;
  border: 2px solid white;
  border-radius: 30px;
  z-index: 200;
  overflow-y: auto;
}

#rechercheOverlay .contenuMenuOverlay > div,
#mentionsLegalesOverlay .contenuMenuOverlay > div {
  height: 100%;
}

#rechercheOverlay .contenuMenuOverlay {
  background-color: rgba(200, 200, 255, 0.9);
}

#mentionsLegalesOverlay .contenuMenuOverlay {
  background-color: rgba(166, 228, 249, 0.9);
}

#boutonRecherche {
  width: 80%;
  font-family: 'Caviar Dreams';
  margin: 0 15px;
  border: 1px solid white;
  border-radius: 30px;
  outline: none;
  font-weight: bold;
  font-size: 1.2em;
  padding: 0 10px;
  height: 30px;
  background: transparent;
}

ul.menu {
  list-style-type: none;
  font-family: "Champagne & Limousines";
  font-variant: small-caps;
}

.iconeMenu {
  margin-top: 2px;
  font-size: 1.5em;
}

.tooltip:hover .iconeMenu {
  filter: invert(22%) sepia(5%) saturate(9%) hue-rotate(321deg) brightness(100%) contrast(85%);
}

span.vide {
  margin-left: 22px;
}

ul.menu li > span {
  font-size: 0.7em;
  margin-right: 30px;
  cursor: pointer;
}

.lienHover:hover {
  font-weight: bold;
}

.sousMenu {
  font-size: 0.8em;
  margin-left: 30px;
}

#enveloppeBarre {
  /* margin-bottom: 10px; */
  display: flex;
  justify-content: center;
  font-family: 'Caviar Dreams';
  font-weight: bolder;
  font-size: 1.2em;
  height: 80%;
  /* width: 20%; */
}

#enveloppeBarre div {
  border: 2px solid white;
  border-radius: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  background-color: #fff7;
}

#enveloppeBarre span {
  margin: 0 10px;
  cursor: pointer;
}

.formRecherche {
  height: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iconeRecherche {
  font-size: 2em;
  filter: invert(99%) sepia(100%) saturate(2%) hue-rotate(40deg) brightness(103%) contrast(101%);
}

#boutonRemarque .lumiere {
  visibility: hidden;
  position: absolute;
  left: 0;
  z-index: -1;
  margin: 5px 6px;
  height: 16px;
  width: 15px;
  background-color:#fcfcbf;
  border-radius:100%;
  box-shadow: 0px 0px 22px 10px rgba(230,223,147,1);
}

#boutonRemarque:hover .lumiere {
  visibility: visible;
}

#rechercheInput {
  background: transparent;
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
  padding: 0 80px;
  height: 30px;
  width: 25%;
  border: 2px solid white;
  border-radius: 30px;
  font-family: 'Caviar Dreams';
  outline: none;
}

#rechercheEnCours {
  margin-top: 10px;
  animation:fade 1000ms infinite;
}

#resultatsRecherche {
  font-size: 2em;
  margin-top: 20px;
  max-height: 92%;
  overflow-y: auto;
}

#resultatsRecherche .type {
  font-size: 0.7em;
}

#resultatsRecherche span.titre {
  font-weight: bold;
}

.listeResultatsRecherche {
  font-size: 1.2em;
  font-family: "Caviar Dreams";
  height: 90%;
  margin-top: 20px;
  overflow-y: auto;
}

.listeResultatsRecherche legend {
  font-family: 'Champagne & Limousines';
  font-weight: bold;
  font-variant: small-caps;
}

.listeResultatsRecherche ul {
  text-align: left;
  font-size: 1em;
}

.listeResultatsRecherche li .titre:hover {
  font-weight: bold;
}

#aucunResultat {
  font-family: "Caviar Dreams";
}

#boutonRemarque {
  /* display: none; */
}

#boutonsDev {
  display: flex;
  justify-content: space-evenly;
}

.cases {
  list-style: none;
}

.cases li {
  display:inline-block;
}
</style>
