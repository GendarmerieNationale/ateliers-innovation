<template>
  <div>
    <div
      class="boutons">
      <div
        class="bouton bouton-petit"
        @click="emitter.emit('rechercherProjetADI')">
        <div class="boutonLogo">
          <Magnify/>
          <span>
            Consulter
          </span>
        </div>
      </div>
      <div
        v-if="connecte"
        @click="emitter.emit('afficherAjouterProjetDialog')"
        class="bouton bouton-petit">
        <div class="boutonLogo">
          <account-plus-outline/>
          <span>
            Candidater
          </span>
        </div>
      </div>
      <div
        v-else
        @click="emitter.emit('popupConnexion')"
        class="bouton bouton-petit">
        Se connecter pour candidater
      </div>
    </div>
    <fieldset
      class="criteres">
      <legend>
        Critères
      </legend>
      <ul>
        <li
          v-for="(valeur, param) in $route.query"
          :key="`param-${param}`">
          <b>{{ param }}: </b>
          <qui-est-ce
            v-if="param === 'chef'"
            :nigendEnvoye="valeur"
            :key="`NIGEND-${valeur}`">
          </qui-est-ce>
          <qui-est-ce
            v-if="param === 'avisdemande'"
            :nigendEnvoye="valeur"
            type="unites"
            :key="`unite-${valeur}`">
          </qui-est-ce>
          <span
            v-if="param === 'statut'">
            {{ valeur }}
          </span>
          <span
            v-if="param === 'texte'">
            {{ valeur }}
          </span>
        </li>
      </ul>
    </fieldset>
    <table
      class="tableau"
      v-if="projets.length > 0">
      <thead>
        <tr>
          <th>
            Projet
          </th>
          <th>
            Date de candidature
          </th>
          <th>
            Statut
          </th>
          <th>
            Campagne
          </th>
          <th>
            Unités pour avis
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="projet in projets"
          :key="`projet-${projet.id}`">
          <td>
            <router-link :to="`/projet/${projet.id}/adi`">
              {{ projet.nom }}
            </router-link>
          </td>
          <td>
            {{ $moment(projet.date_inscription).format('DD/MM/YYYY') }}
          </td>
          <td>
            {{ projet.statut }}
          </td>
          <td>
            <router-link
              v-if="projet.id_campagne"
              :to="`/outils/adi/campagne/${projet.id_campagne}`">
              {{ projet.titre_campagne }}
            </router-link>
          </td>
          <td class="gauche">
            <ul v-if="projet.unites_avis.length">
              <li
                v-for="unite in projet.unites_avis"
                :key="`unite-${unite}`">
                {{ unite }}
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-else
      class="msg avertissement">
      Pas de projet correspondant aux critères.
    </div>
  </div>
</template>

<script>
import {
  inject,
  onMounted,
  ref,
  computed,
} from 'vue';
import {
  useRoute,
  useRouter,
} from 'vue-router';
import { useStore } from 'vuex';
import {
  AccountPlusOutline,
  Magnify,
} from 'mdue';
import QuiEstCe from '@/components/QuiEstCe.vue';

export default {
  name: 'Projets',
  components: {
    AccountPlusOutline,
    Magnify,
    QuiEstCe,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const connecte = computed(() => store.state.connexion.connecte);
    const projets = ref([]);

    async function chargerProjets() {
      if (Object.keys(route.query).length === 0) {
        router.push('/outils/adi');
      } else {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/adi/projets`,
          route.query,
        )
          .then((res) => {
            projets.value = [...res.data];
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          });
      }
    }

    onMounted(async () => {
      chargerProjets();
    });

    return {
      connecte,
      projets,
    };
  },
};
</script>

<style scoped>
.selectionProjet {
  margin: 0 10px;
}

.boutons {
  display: flex;
  justify-content: space-evenly;
}

.boutons > * {
  margin: 10px;
}

.criteres {
  background-color: #fffa;
  text-align: left;
}
</style>
