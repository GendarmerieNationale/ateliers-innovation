<template>
  <div
    class="autocomplete">
    <input
      type="text"
      v-model="aRechercher"
      :placeholder="placeholder" />
    <div
      class="autocomplete-items"
      v-if="resultats.length">
      <template
        v-for="(resultat, i) in resultats.sort((a, b) => {
          return (a.nom.toLowerCase() < b.nom.toLowerCase())
          ? -1 : (a.nom.toLowerCase() > b.nom.toLowerCase()) ? 1 : 0;
        })"
        :key="`resultat-${i}`">
        <div
          v-if="['personnel','unite'].includes(resultat.type)"
          @click="selectionner(resultat)">
          <span
            v-if="resultat.type === 'personnel'">
            🧑 {{ resultat.nigend }} - {{ resultat.grade }} {{ resultat.nom }} ({{ resultat.unite }})
          </span>
          <span
            v-if="resultat.type === 'unite'">
            🏢 {{ resultat.code_unite }} - {{ resultat.nom }}
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
      v-if="Object.keys(eltSelectionne).length"
      @click="effacerValeur">
      ❌
    </span>
  </div>
</template>

<script>
import {
  defineComponent,
  toRefs,
  ref,
  watch,
  inject,
  computed,
} from 'vue';
import useModelWrapper from '@/utils/modelWrapper';

export default defineComponent({
  name: 'RechercheAnnuaire',
  props: {
    type: {
      type: String,
      default: 'personnels',
    },
    modelValue: Object,
  },
  setup(props, { emit }) {
    const axios = inject('$axios');
    const { CancelToken } = axios;
    let source = CancelToken.source();
    const toast = inject('$toast');
    const { type } = toRefs(props);
    const chargement = ref(false);
    const chargementEnCours = ref(false);
    const eltSelectionne = useModelWrapper(props, emit);
    const aRechercher = ref('');
    const resultats = ref([]);
    const placeholder = computed(() => {
      if (eltSelectionne.value) {
        switch (eltSelectionne.value.type) {
          case 'personnel': {
            return `🧑 ${eltSelectionne.value.nigend} - ${eltSelectionne.value.grade} ${eltSelectionne.value.nom} (${eltSelectionne.value.unite})`;
          }
          case 'unite': {
            return `🏢 ${eltSelectionne.value.code_unite} - ${eltSelectionne.value.nom}`;
          }
          default: {
            return 'Écrivez quelque chose pour rechercher...';
          }
        }
      } else {
        return 'Écrivez quelque chose pour rechercher...';
      }
    });

    function effacerValeur() {
      eltSelectionne.value = {};
    }

    function selectionner(elt) {
      eltSelectionne.value = elt;
      aRechercher.value = '';
      resultats.value = [];
    }

    watch(aRechercher, (r) => {
      if (r.length) {
        source = CancelToken.source();
        clearTimeout(chargement.value);
        chargement.value = setTimeout(async () => {
          chargementEnCours.value = true;
          await axios.get(`${process.env.VUE_APP_API_URL}/quiestce/multiple/${type.value}/${r}`, {
            cancelToken: source.token,
          })
            .then((res) => {
              resultats.value = [...res.data];
            })
            .catch((e) => {
              if (axios.isCancel(e)) {
                console.log('Requête annulée', e.message);
              } else {
                toast(`⚠️ ${e.response.data}`, {
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

    return {
      chargement,
      chargementEnCours,
      aRechercher,
      resultats,
      selectionner,
      placeholder,
      eltSelectionne,
      effacerValeur,
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
</style>
