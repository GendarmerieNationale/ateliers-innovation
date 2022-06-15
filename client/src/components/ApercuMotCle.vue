<template>
  {{ motcle }}
</template>

<script>
import {
  inject,
  onMounted,
  ref,
  toRefs,
} from 'vue';

export default {
  name: 'ApercuMotCle',
  props: {
    id: {
      type: Number,
      default: 0,
    },
    domaine: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { id, domaine } = toRefs(props);
    const motcle = ref('Chargement en cours...');
    const toast = inject('$toast');
    const axios = inject('$axios');

    async function chargerMotCle() {
      await axios.get(`${process.env.VUE_APP_API_URL}/motscles/motcle/${domaine.value}/${id.value}`)
        .then((res) => {
          motcle.value = res.data;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    onMounted(async () => {
      await chargerMotCle();
    });

    return {
      motcle,
    };
  },
};
</script>
