<template>
  <div
    class="historique">
    <div
      v-if="projet.chef"
      class="bouton bouton-petit"
      @click="afficherFormulaireAjouterHistoriqueProjetDialog = true">
      Ajouter une entrée
    </div>
    <ul
      class="entrees">
      <li
        class="entree"
        v-for="entree in projet.historique"
        :key="`entree-${entree.id}`">
        <div
          class="timestamp">
          <span
            v-if="entree.statut"
            class="capsule">
            {{ statutHistoriqueClair[entree.statut] }}
          </span>
          <span
            v-if="entree.type"
            class="capsule">
            {{ entree.type }}
          </span>
          {{ $moment(entree.date).format('l à H:mm:ss') }}
        </div>
        <div class="item-title">
          <Popper
            arrow
            hover
            content="Supprimer l'entrée"
            class="lien"
            v-if="projet.chef">
            <span
              @click="supprimerEntreeHistorique(entree.id)">
              ❌
            </span>
          </Popper>
          {{ entree.description }}
        </div>
      </li>
    </ul>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherFormulaireAjouterHistoriqueProjetDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherFormulaireAjouterHistoriqueProjetDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Description de l'entrée dans l'historique:</label><br />
            <textarea
              v-model="entreeHistoriqueAAjouter.description">
            </textarea>
          </div>
          <div>
            <label>Date de l'entrée:</label><br />
            <v-date-picker
              v-model="entreeHistoriqueAAjouter.date"
              :masks="masks"
              :model-config="{type: 'string', mask: masks.store}"
              is24hr
              mode="dateTime" />
          </div>
          <div>
            <label>Statut:</label>
            <select
              v-model="entreeHistoriqueAAjouter.statut">
              <option
                value="">
                Aucun statut particulier
              </option>
              <option
                value="PREVU">
                Prévu
              </option>
              <option
                value="REALISE">
                Réalisé
              </option>
            </select>
          </div>
          <div>
            <label>Type:</label>
            <select
              v-model="entreeHistoriqueAAjouter.type">
              <option
                value="">
                Entrée classique
              </option>
              <option
                value="BUDGET">
                Budget (financement, paiement, etc.)
              </option>
              <option
                value="TRL">
                Changement de TRL
              </option>
            </select>
          </div>
          <div>
            <div
              @click="ajouterEntreeHistorique"
              class="bouton bouton-petit">
              Ajouter l'entrée
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  computed,
  ref,
  inject,
  reactive,
  onMounted,
} from 'vue';
import {
  useRoute,
} from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'HistoriqueProjet',
  setup() {
    const axios = inject('$axios');
    const toast = inject('$toast');
    const route = useRoute();
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const statutHistoriqueClair = {
      PREVU: 'Prévu',
      REALISE: 'Réalisé',
    };
    const afficherFormulaireAjouterHistoriqueProjetDialog = ref(false);
    const entreeHistoriqueAAjouter = reactive({
      description: '',
      date: null,
      statut: '',
      type: '',
    });
    const masks = reactive({
      input: 'DD/MM/YYYY HH:mm',
      store: 'YYYY-MM-DD HH:mm',
    });

    async function chargerHistorique() {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/${route.params.id}/historique`)
        .then(async (res) => {
          store.dispatch('projet/initialiserHistorique', res.data);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function ajouterEntreeHistorique() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/projets/${route.params.id}/historique`,
        entreeHistoriqueAAjouter,
      )
        .then(async (res) => {
          chargerHistorique();
          afficherFormulaireAjouterHistoriqueProjetDialog.value = false;
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

    async function supprimerEntreeHistorique(id) {
      // eslint-disable-next-line
      if (window.confirm('Voulez-vous supprimer cette entrée?')) {
        await axios.delete(
          `${process.env.VUE_APP_API_URL}/projets/${route.params.id}/historique/${id}`,
        )
          .then(async () => {
            await chargerHistorique(route.params.id);
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          });
      }
    }

    onMounted(async () => {
      if (projet.value.visibilite.mavisibilite === 'TOTALE') {
        await chargerHistorique();
      }
    });

    return {
      projet,
      statutHistoriqueClair,
      afficherFormulaireAjouterHistoriqueProjetDialog,
      supprimerEntreeHistorique,
      entreeHistoriqueAAjouter,
      ajouterEntreeHistorique,
      masks,
    };
  },
};
</script>

<style scoped>
.historique {
  width: 90%;
  margin: auto;
  display: block;
  position: relative;
}

.historique ul.entrees {
  margin-top: 2em;
  padding: 0;
  display: inline-block;
}

.historique ul.entrees li {
  list-style: none;
  margin: auto;
  margin-left: 2em;
  min-height: 50px;
  border-left: 1px dashed #000;
  padding: 0 0 50px 30px;
  position: relative;
}

.historique ul.entrees li:last-child {
  border-left: 0;
}

.historique ul.entrees li::before {
  position: absolute;
  left: -18px;
  top: -5px;
  content: " ";
  border: 8px solid rgba(200, 200, 200, 1);
  border-radius: 500%;
  background: rgb(1,172,222);
  height: 20px;
  width: 20px;
  transition: all 200ms ease-in-out;
  text-align: center;
}

.historique ul.entrees li:hover::before {
  border-color: rgb(16,131,189);
  transition: all 200ms ease-in-out;
}

ul.entrees li .timestamp {
  color: #005091;
  position: relative;
  font-size: 12px;
  margin-bottom: 10px;
}

.entrees .item-title {
  color: #000;
}
</style>
