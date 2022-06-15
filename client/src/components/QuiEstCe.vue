<template>
  <span
    v-if="chargement"
    class="recherche">
    Chargement...
  </span>
  <template
    v-else>
    <router-link
      v-if="type === 'personnels'"
      :to="`/profil/${nigendEnvoye}`"
      class="tooltip"
      :data-tooltip="tooltip">
        {{ quiestce }}
    </router-link>
    <span
      v-else
      class="tooltip"
      :data-tooltip="tooltip">
      {{ quiestce }}
    </span>
  </template>
</template>

<script>
import {
  defineComponent,
  onMounted,
  toRefs,
  ref,
  watch,
  inject,
} from 'vue';

export default defineComponent({
  name: 'QuiEstCe',
  props: {
    nigendEnvoye: {
      type: String,
      required: true,
      default: '0',
    },
    type: {
      type: String,
      default: 'personnels',
    },
  },
  setup(props) {
    const axios = inject('$axios');
    const { nigendEnvoye, type } = toRefs(props);
    const chargement = ref(true);
    const quiestce = ref('');
    const tooltip = ref('');

    async function fetchNom(id) {
      const res = await axios.get(`${process.env.VUE_APP_API_URL}/quiestce/unique/${type.value}/${id}`);
      if (!res.data) {
        quiestce.value = '[INTROUVABLE]';
      } else {
        quiestce.value = res.data.nom;
        switch (type.value) {
          case 'personnels': {
            tooltip.value = res.data.unite;
            quiestce.value += ` (${res.data.grade})`;
            break;
          }
          case 'unites': {
            tooltip.value = res.data.code_unite;
            break;
          }
          default: break;
        }
      }
      chargement.value = false;
    }

    watch(props, (x) => {
      fetchNom(x);
    });

    onMounted(async () => {
      if (nigendEnvoye.value && !['0'].includes(nigendEnvoye.value)) {
        await fetchNom(nigendEnvoye.value);
      } else {
        quiestce.value = '[INTROUVABLE]';
        chargement.value = false;
      }
    });

    return {
      chargement,
      quiestce,
      tooltip,
    };
  },
});
</script>

<style scoped>
.survol {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  height: 50%;
}

.survol:hover {
  filter: invert(23%) sepia(64%) saturate(0%) hue-rotate(146deg) brightness(91%) contrast(88%);
}

.survol img {
  height: 100px;
}
</style>
