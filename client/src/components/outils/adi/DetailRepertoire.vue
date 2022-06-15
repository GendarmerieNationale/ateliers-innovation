<template>
  <div
    class="detailRepertoire">
    <h1>{{ repertoire.nom }}</h1>
    <fieldset
      class="classement">
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
            v-for="projet in repertoire.classement.filter((p) => p.place !== null)"
            :key="`projet-${projet.id_projet}`">
            <td>
              {{ projet.place }}
            </td>
            <td
              class="gauche">
              <router-link :to="`/projet/${projet.id_projet}/adi`">
                {{ campagne.categories.map((c) => c.projets).flat().find((p) => p.id === projet.id_projet).nom }}
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>
    <div
      class="categories">
      <fieldset
        class="categorie"
        v-for="categorie in campagne.categories"
        :key="`categorie-${categorie.id}`">
        <legend>
          <div class="pli"></div>
          {{ categorie.nom }}
        </legend>
        <table
          class="tableau">
          <tr
            v-for="projet in categorie.projets"
            :key="`projet-${projet.id}`">
            <td>
              <span
                v-if="repertoire.classement.find((p) => p.id_projet === projet.id).laureat">
                🏅
              </span>
            </td>
            <td
              class="gauche">
              <router-link :to="`/projet/${projet.id}/adi`">
                {{ projet.nom }}
              </router-link>
            </td>
          </tr>
        </table>
      </fieldset>
    </div>
    <footer
      class="campagne">
      Ce répertoire a été élaboré suite aux travaux de la campagne
      <router-link :to="`/outils/adi/campagne/${campagne.id}`">
        "{{ campagne.titre }}"
      </router-link>
    </footer>
  </div>
</template>

<script>
import {
  inject,
  onMounted,
  ref,
  reactive,
} from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'adi_DetailRepertoire',
  setup() {
    const route = useRoute();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const repertoire = reactive({
      nom: '',
      classement: [],
    });
    const campagne = ref({});

    async function chargerCampagne(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/campagne/${id}`)
        .then((res) => {
          campagne.value = { ...res.data };
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerRepertoire(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/repertoires/${id}`)
        .then(async (res) => {
          repertoire.nom = res.data.nom;
          await chargerCampagne(res.data.id_campagne);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerClassement(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/repertoires/${id}/classement`)
        .then(async (res) => {
          repertoire.classement = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    onMounted(async () => {
      await chargerRepertoire(route.params.id);
      await chargerClassement(route.params.id);
    });

    return {
      repertoire,
      campagne,
    };
  },
};
</script>

<style scoped>
.detailRepertoire {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

fieldset {
  background-color: #fffa;
}

.categories fieldset {
  margin-top: 20px;
  border: none;
}

.categories legend, .classement legend {
  margin-left: 10px;
  font-weight: bold;
  font-size: 1.2em;
  font-variant: small-caps;
  padding: 10px;
  position: relative;
}

.classement .pli {
  border-top: 15px solid #14907a;
}
.classement > legend {
  background-image: linear-gradient(0deg, rgb(244, 243, 33) 40%, rgb(16, 255, 0) 100%);
}

.categorie .pli {
  border-top: 15px solid #25a6ec;
}
.categorie > legend {
  background-image: linear-gradient(0deg, rgba(80,255,251,1) 26%, rgba(183,255,242,1) 75%);
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

.campagne {
  margin-top: 50px;
  font-style: italic;
}
</style>
