<template>
  <div
    class="autocomplete">
    <Popper
      arrow
      hover
      content="Ajouter">
      <span
        class="icone"
        v-if="resultats.length === 0 && creer.length > 0">
        <plus-box
          class="ajouter"
          @click="creerEmit" />
      </span>
    </Popper>
    <input
      type="text"
      :class="{
        valide: Object.keys(eltSelectionne).length,
        invalide: Object.keys(eltSelectionne).length === 0,
      }"
      v-model="aRechercher"
      @blur="blurRecherche"
      :placeholder="placeholder" />
    <div
      class="autocomplete-items"
      v-if="resultats.length">
      <template
        v-for="(resultat, i) in resultats.sort((a, b) => {
          if (a.hasOwnProperty('mot')) {
            return (a.mot.toLowerCase() < b.mot.toLowerCase())
            ? -1 : (a.mot.toLowerCase() > b.mot.toLowerCase()) ? 1 : 0;
          } else {
            return (a.nom.toLowerCase() < b.nom.toLowerCase())
            ? -1 : (a.nom.toLowerCase() > b.nom.toLowerCase()) ? 1 : 0;
          }
        })"
        :key="`resultat-${i}`">
        <div
          @click="selectionner(resultat)">
          <span
            v-if="resultat.type === 'ecole'">
            🏫 {{ resultat.nom }}
          </span>
          <span
            v-if="resultat.type === 'entreprise'">
            🏭 {{ resultat.nom }}
          </span>
          <span
            v-if="resultat.type === 'evenement'">
            📅 {{ resultat.nom }} ({{$moment(resultat.date_debut).format('DD/MM/YYYY')}} - {{$moment(resultat.date_fin).format('DD/MM/YYYY')}})
          </span>
          <span
            v-if="resultat.type === 'personneGendindus'">
            👨🏻‍💼 {{ resultat.nom.toUpperCase() }} {{ resultat.prenom }}
          </span>
          <span
            v-if="resultat.type === 'personnel'">
            🧑‍💼 {{resultat.nigend}} - {{resultat.grade}} {{resultat.nom}} ({{resultat.unite}})
          </span>
          <span
            v-if="resultat.type === 'unite'">
            🏢 {{resultat.code_unite}} - {{resultat.nom}}
          </span>
          <span
            v-if="resultat.type === 'motcle'">
            📑 {{resultat.mot}}
          </span>
          <span
            v-if="resultat.type === 'entiteveilleuse'">
            🔍 {{resultat.nom}}
          </span>
          <span
            v-if="resultat.type === 'projet'">
            💼 {{resultat.nom}}
          </span>
          <span
            v-if="resultat.type === 'competence'">
            🧠 {{resultat.nom}}
          </span>
        </div>
      </template>
    </div>
    <img
      class="icone"
      v-if="chargementEnCours"
      src="~@/assets/img/loader.gif" />
    <span
      class="icone"
      v-if="Object.keys(eltSelectionne).length && mode === 'unique'"
      @click="effacerValeur">
      ❌
    </span>
  </div>
  <div
    v-if="mode === 'multiple'"
    class="listeCapsules">
    <span
      v-for="(elt, i) in eltSelectionne"
      :key="`elt-${i}`"
      class="capsule">
      <span
        class="icone"
        @click="effacerElement(elt)">
        ❌
      </span>
      {{ elementClair(elt) }}
    </span>
  </div>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  toRefs,
  ref,
  watch,
  inject,
  computed,
  onMounted,
} from 'vue';
import {
  PlusBox,
} from 'mdue';
import useModelWrapper from '@/utils/modelWrapper';

export default defineComponent({
  name: 'RechercheAutocomplete',
  props: {
    // type de donnée à créer si besoin, servira à déclencher l'événement
    creer: {
      type: String,
      default: '',
    },
    // url de l'API qui ira chercher les données
    url: {
      type: Array,
      default: () => [],
    },
    // selection unique ou multiple
    mode: {
      type: String,
      default: 'unique',
    },
    // ce qu'on recherche uniquement
    type: {
      type: String,
      default: '',
    },
    modelValue: Object,
  },
  components: {
    PlusBox,
  },
  setup(props, { emit }) {
    const axios = inject('$axios');
    const { CancelToken } = axios;
    let source = CancelToken.source();
    const toast = inject('$toast');
    const internalInstance = getCurrentInstance();
    const moment = internalInstance
      .appContext.config.globalProperties.$moment;
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const {
      creer,
      url,
      mode,
      type,
    } = toRefs(props);
    const chargement = ref(false);
    const chargementEnCours = ref(false);
    const eltSelectionne = useModelWrapper(props, emit);
    switch (mode.value) {
      case 'multiple': {
        eltSelectionne.value = [];
        break;
      }
      default: {
        eltSelectionne.value = {};
      }
    }
    const aRechercher = ref('');
    const resultats = ref([]);

    function elementClair(e) {
      switch (e.type) {
        case 'ecole': {
          return `🏫 ${e.nom}`;
        }
        case 'entreprise': {
          return `🏭 ${e.nom}`;
        }
        case 'evenement': {
          return `📅 ${e.nom} (${moment(e.date_debut).format('DD/MM/YYYY')} - ${moment(e.date_fin).format('DD/MM/YYYY')})`;
        }
        case 'personneGendindus': {
          return `👨🏻‍💼 ${e.nom.toUpperCase()} ${e.prenom}`;
        }
        case 'personnel': {
          return `🧑 ${e.nigend} - ${e.grade} ${e.nom} (${e.unite})`;
        }
        case 'unite': {
          return `🏢 ${e.code_unite} - ${e.nom}`;
        }
        case 'motcle': {
          return `📑 ${e.mot}`;
        }
        case 'entiteveilleuse': {
          return `🔍 ${e.nom}`;
        }
        case 'projet': {
          return `💼 ${e.nom}`;
        }
        case 'competence': {
          return `🧠 ${e.nom}`;
        }
        default: {
          return 'Écrivez quelque chose pour rechercher...';
        }
      }
    }

    const placeholder = computed(() => {
      if (mode.value === 'unique') {
        return elementClair(eltSelectionne.value);
      }
      return 'Écrivez quelque chose pour rechercher...';
    });

    function selectionner(r) {
      switch (mode.value) {
        case 'unique': {
          eltSelectionne.value = r;
          break;
        }
        case 'multiple': {
          eltSelectionne.value.push(r);
          break;
        }
        default: {
          eltSelectionne.value = {};
        }
      }
    }

    function effacerValeur() {
      eltSelectionne.value = {};
    }

    function effacerElement(e) {
      switch (e.type) {
        case 'personnel': {
          eltSelectionne.value = eltSelectionne.value.filter((x) => x.nigend !== e.nigend);
          break;
        }
        case 'unite': {
          eltSelectionne.value = eltSelectionne.value.filter((x) => x.code_unite !== e.code_unite);
          break;
        }
        default: {
          eltSelectionne.value = eltSelectionne.value.filter((x) => (x.id !== e.id) || x.type !== e.type);
        }
      }
    }

    function creerEmit() {
      aRechercher.value = '';
      emitter.emit(`creer${creer.value}`);
    }

    async function blurRecherche() {
      // on attend que la sélection fasse son effet
      // eslint-disable-next-line
      await new Promise((r) => setTimeout(r, 300));
      resultats.value = [];
      aRechercher.value = '';
    }

    watch(aRechercher, async (r) => {
      if (r.length) {
        source = CancelToken.source();
        clearTimeout(chargement.value);
        chargement.value = setTimeout(async () => {
          chargementEnCours.value = true;
          await axios.all(url.value.map((u) => axios.get(`${process.env.VUE_APP_API_URL}/${u}/${r}`)), {
            cancelToken: source.token,
          })
            // eslint-disable-next-line
            .then(axios.spread(function (...res) {
              resultats.value = [].concat(...res.map((x) => x.data));
              if (type.value.length) {
                resultats.value = resultats.value.filter((x) => x.type === type.value);
              }
            }))
            .catch((e) => {
              if (axios.isCancel(e)) {
                console.log('Recherche annulée', e.message);
              } else {
                toast(`⚠️ ${e.response.data.msg}`, {
                  type: 'error',
                });
              }
            })
            .finally(() => {
              chargementEnCours.value = false;
              chargement.value = false;
            });
        }, 1500);
      } else {
        source.cancel('On a effacé le champ.');
      }
    });

    onMounted(async () => {
      emitter.on('entrepriseAjoutee', (e) => {
        if (creer.value === 'Entreprise') {
          selectionner(Object.assign(e, { type: 'entreprise' }));
        }
      });
      emitter.on('ecoleAjoutee', (e) => {
        if (creer.value === 'Ecole') {
          selectionner(Object.assign(e, { type: 'ecole' }));
        }
      });
      emitter.on('evenementAjoute', (e) => {
        if (creer.value === 'Evenement') {
          selectionner(Object.assign(e, { type: 'evenement' }));
        }
      });
      emitter.on('motCleVeilleAjoute', (e) => {
        if (creer.value === 'MotcleVeille') {
          selectionner(Object.assign(e, { type: 'motcle' }));
        }
      });
      emitter.on('motCleContactAjoute', (e) => {
        if (creer.value === 'MotcleContact') {
          selectionner(Object.assign(e, { type: 'motcle' }));
        }
      });
      emitter.on('motCleProjetAjoute', (e) => {
        if (creer.value === 'MotcleProjet') {
          selectionner(Object.assign(e, { type: 'motcle' }));
        }
      });
      emitter.on('personneGendindusAjoutee', (e) => {
        if (creer.value === 'PersonneGendindus') {
          selectionner(Object.assign(e, { type: 'personneGendindus' }));
        }
      });
      emitter.on('projetCree', (e) => {
        if (creer.value === 'Projet') {
          selectionner(Object.assign(e, { type: 'projet' }));
        }
      });
    });

    return {
      chargement,
      chargementEnCours,
      aRechercher,
      resultats,
      placeholder,
      eltSelectionne,
      effacerValeur,
      creerEmit,
      blurRecherche,
      selectionner,
      elementClair,
      effacerElement,
    };
  },
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.autocomplete {
  overflow: hidden;
  width: 90%;
}
input {
  border: 1px solid transparent;
  background-color: #f1f1f1;
  padding: 10px;
  font-size: 1em;
}
input[type=text] {
  background-color: #f1f1f1;
  width: 90%;
}
.autocomplete-items {
  position: absolute;
  border: 1px solid #d4d4d4;
  border-bottom: none;
  border-top: none;
  z-index: 99;
  text-align: left;
  max-height: 10em;
  overflow-y: auto;
}
.autocomplete-items div {
  padding: 10px;
  cursor: pointer;
  background-color: #fff;
  border-bottom: 1px solid #d4d4d4;
}
.autocomplete-items div:hover {
  background-color: #e9e9e9;
}
.autocomplete-active {
  background-color: DodgerBlue !important;
  color: #ffffff;
}
.icone {
  cursor: pointer;
}
.ajouter {
  filter: invert(69%) sepia(56%) saturate(7048%) hue-rotate(88deg) brightness(112%) contrast(117%);
}
.valide {
  border: solid 1px green;
}
.invalide {
  border: solid 1px red;
}
</style>
