<template>
  <table
    v-if="projets.length"
    class="tableau">
    <thead>
      <tr>
        <th>
        </th>
        <th>
          Nom
        </th>
        <th>
          Catégorie
        </th>
        <th>
          Description
        </th>
        <th
          v-if="afficherPieces && projets.filter((p) => p.type === 'gendfablab').length > 0">
          Modèles
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="projetOmnibus in projets"
        :key="`projet-${projetOmnibus.id_omnibus}`">
        <td>
          <span
            v-if="chef"
            class="lien"
            @click="supprimerOmnibus(projetOmnibus.id_omnibus)">
            ❌
          </span>
        </td>
        <td>
          <a
            target="_blank"
            :href="projetOmnibus.web_url">
            {{ projetOmnibus.nom }}
          </a>
        </td>
        <td>
          {{ projetOmnibus.namespace.name }}
        </td>
        <td>
          {{ projetOmnibus.description }}
        </td>
        <td
          v-if="afficherPieces && projets.filter((p) => p.type === 'gendfablab').length > 0">
          <ul>
            <li
              v-for="(fichier, j) in projetOmnibus.fichiers"
              :key="`fichier-${projetOmnibus.id_omnibus}-${j}`">
              <a
                :href="`${projetOmnibus.web_url}/-/raw/master/${fichier.name}?inline=false`"
                target="_blank">
                <span
                  class="bouton bouton-petit">
                  Télécharger
                </span>
              </a>
              <a
                :href="`${projetOmnibus.web_url}/-/blob/master/${fichier.name}`"
                target="_blank">
                <span
                  class="bouton bouton-petit">
                  Voir
                </span>
              </a>
              <span>
              {{ fichier.name }}</span>
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
  <div
    v-else
    class="msg erreur">
    Pas de projet à afficher
  </div>
</template>

<script>
import {
  inject,
  toRefs,
} from 'vue';
import {
  useRoute,
} from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'TableauOmnibus',
  props: {
    chef: {
      type: Boolean,
      default: false,
    },
    projets: {
      type: Array,
      default: () => [],
    },
    afficherPieces: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    // eslint-disable-next-line
    const { chef, projets, afficherPieces } = toRefs(props);
    const axios = inject('$axios');
    const toast = inject('$toast');
    const store = useStore();
    const route = useRoute();

    async function supprimerOmnibus(id) {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
        await axios.delete(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/omnibus`,
          { data: { idOmnibus: id } },
        )
          .then((res) => {
            store.dispatch('projet/supprimerOmnibus', id);
            toast(`✅ ${res.data.msg}`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          });
      }
    }

    return {
      supprimerOmnibus,
    };
  },
};
</script>

<style scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
</style>
