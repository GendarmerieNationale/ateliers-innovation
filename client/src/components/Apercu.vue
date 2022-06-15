<template>
  <div>
    <router-link
      :to="type === 'gend2024-pilier' ? `/rubrique/gend2024/pilier/${id}` : `/${type}/${id}`">
      <fieldset>
        <legend>
          {{ apercu.nom }}
        </legend>
        <div>
          <img
            v-if="apercu?.illustration?.id"
            class="illustration"
            :src="`${apiUrl}/fichiers/telechargement
/${apercu.illustration.id}/${apercu.illustration.nom}/miniature`" />
          {{ apercu.apercu }}
        </div>
      </fieldset>
    </router-link>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  toRefs,
  inject,
  reactive,
} from 'vue';

export default defineComponent({
  name: 'Badge',
  props: {
    id: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: 'defaut',
    },
  },
  setup(props) {
    const apiUrl = process.env.VUE_APP_API_URL;
    const axios = inject('$axios');
    const { type, id } = toRefs(props);
    const apercu = reactive({
      nom: '',
      apercu: '',
      illustration: {},
    });

    let lien = type.value;
    if (type.value === 'gend2024-pilier') {
      lien = 'rubriques/gend2024-pilier';
    }
    if (type.value === 'projet') {
      lien = 'projets';
    }

    async function chargeApercu() {
      const res = await axios.get(`${process.env.VUE_APP_API_URL}/${lien}/apercu/${id.value}`);
      apercu.nom = res.data.nom;
      apercu.apercu = res.data.apercu;
      apercu.illustration = res.data.illustration;
    }

    onMounted(async () => {
      await chargeApercu();
    });

    return {
      apiUrl,
      apercu,
    };
  },
});
</script>

<style scoped>
.illustration {
  float: left;
  height: 50px;
  margin: 10px;
}

fieldset {
  background-color: #fffa;
}
</style>
