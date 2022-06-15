<template>
  <div>
    <div
      class="bouton"
      @click="ajouterMembreDialog = true"
      v-if="projet.chef">
      Ajouter membre/rôle
    </div>
    <table
      class="tableau"
      v-if="projet.membres.length >0">
      <thead>
        <tr>
          <th>
            Nom
          </th>
          <th>
            Rôles
          </th>
          <th>
            Membre depuis
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(membre, i) in projet.membres"
          :key="`membre-${i}`">
          <td>
            <qui-est-ce
              :nigendEnvoye="membre.personne"
              :key="'NIGEND-'+membre.personne">
            </qui-est-ce>
          </td>
          <td>
            <div
              class="projets listeCapsules">
              <span
                v-for="(role, j) in membre.roles"
                :key="`role-${i}-${j}`"
                class="capsule">
                <span
                  v-if="projet.chef"
                  @click="revoquer(role.id)"
                  class="lien">❌</span> {{ role.nom }}
              </span>
            </div>
          </td>
          <td>
            {{ $moment.min(membre.roles.map((x) => $moment(x.date_debut))).format('DD/MM/YYYY') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="ajouterMembreDialog"
      >
      <div
        class="fondOverlay"
        @click="ajouterMembreDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Rôle:</label>
            <div>
              <select
                v-model="droit.idRole">
                <option
                  :value="0">
                  - autre -
                </option>
                <option
                  v-for="(role) in roles"
                  :key="`role-${role.id}`"
                  :value="role.id">{{ role.nom }}</option>
              </select>
              <input
                v-if="droit.idRole === 0"
                type="text"
                placeholder="Préciser le rôle"
                v-model="droit.precision"/>
                <div
                  class="msg avertissement"
                  v-if="droit.idRole === 1">
                  Si vous sélectionnez un nouveau chef, vous ne serez plus le chef.
                  Il faudra demander au chef de vous assigner un rôle.
                </div>
            </div>
          </div>
          <div>
            <label>Personne qui aura ce rôle:</label>
            <recherche-annuaire
              v-model="membreSelectionne"/>
          </div>
          <span
            @click="ajouter"
            class="bouton">
            Ajouter
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  defineComponent,
  onMounted,
  ref,
  inject,
  reactive,
  watch,
  computed,
} from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import QuiEstCe from '@/components/QuiEstCe.vue';
import RechercheAnnuaire from '@/components/RechercheAnnuaire.vue';

export default defineComponent({
  name: 'Membres',
  components: {
    QuiEstCe,
    RechercheAnnuaire,
  },
  setup() {
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const route = useRoute();
    const toast = inject('$toast');
    const axios = inject('$axios');
    const roles = ref([]);
    const membreSelectionne = ref({});
    const ajouterMembreDialog = ref(false);
    const droit = reactive({
      precision: '',
      membre: '',
      idRole: 0,
    });

    async function chargerRoles() {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/roles`)
        .then(async (res) => {
          roles.value = [...res.data];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data}`, {
            type: 'error',
          });
        });
    }

    async function revoquer(id) {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr?')) {
        await axios.delete(`${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/membres/revoquer/${id}`)
          .then(() => {
            store.dispatch('projet/supprimerRole', id);
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data}`, {
              type: 'error',
            });
          })
          .finally(() => {
            // revoquerMembreDialog.value = false;
          });
      }
    }

    async function ajouter() {
      const erreurs = [];
      if (droit.membre.length === 0) {
        erreurs.push('Il faut mettre un NIGEND!');
      }
      if (droit.idRole === 0 && droit.precision.length === 0) {
        erreurs.push('Il faut préciser le rôle');
      }
      if (erreurs.length > 0) {
        erreurs.forEach((item) => {
          toast(`⚠️ ${item}`, {
            type: 'error',
          });
        });
      } else {
        await axios.post(`${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/membres/ajouter`, droit)
          .then(async (res) => {
            if (droit.idRole === 1) {
              // on a changé de chef
              store.dispatch('projet/changerChamp', {
                champ: 'chef',
                valeur: false,
              });
              // on supprime la relation de membre
              store.dispatch(
                'projet/supprimerRole',
                projet.value.mesroles.find((x) => x.id_role === 1).id,
              );
            }
            store.dispatch('projet/ajouterRole', res.data);
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
            ajouterMembreDialog.value = false;
          });
      }
    }

    watch(membreSelectionne, (p) => {
      droit.membre = p.nigend;
    });

    onMounted(async () => {
      await chargerRoles();
    });

    return {
      roles,
      membreSelectionne,
      droit,
      revoquer,
      ajouterMembreDialog,
      ajouter,
      projet,
    };
  },
});
</script>

<style scoped>
</style>
