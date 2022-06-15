<template>
  <router-link :to="`/projet/${projet.id_projet}/adp`">
    {{ projet.nom_projet }}
  </router-link>
  <span
    class="distinction fdr"
    v-if="projet.fdr">
    Feuille de route
  </span>
</template>

<script>
import {
  defineComponent,
} from 'vue';

export default defineComponent({
  name: 'ProjetAdp',
  props: {
    projet: {
      type: Object,
      required: true,
      default() {
        return {
          nom_projet: 'pas de nom',
        };
      },
    },
  },
  setup() {
  },
});
</script>

<style scoped>
.distinction {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  border-radius: 10px;
  border: solid 1px;
}

.laureat {
  background-color: cyan;
  border-color: blue;
}

.fdr {
  background-color: lightgreen;
  border-color: green;
}
</style>
