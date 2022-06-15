<template>
  <table
    class="tableau"
    v-if="projet.partenariats.length">
    <thead>
      <tr>
        <th>
        </th>
        <th>
          Statut
        </th>
        <th>
          Entité
        </th>
        <th>
          Type
        </th>
        <th>
          Description du partenariat
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="partenariat in projet.partenariats"
        :key="`partenariat-${partenariat.id}-${partenariat.type_entite}-${partenariat.type_partenariat}-${partenariat.statut}`">
        <td>
          <span
            v-if="projet.chef"
            class="lien"
            @click="supprimerPartenariat(partenariat)">
            ❌
          </span>
        </td>
        <td>
          {{ partenariat.statut }}
        </td>
        <td>
          <apercu-entite :entite="{
            id: partenariat.id_entite,
            precision: partenariat.type_entite,
          }"/>
        </td>
        <td>
          {{ partenariat.type_partenariat }}
        </td>
        <td>
          <span
            v-if="projet.chef"
            @click="afficherModifierPartenariatDialog(partenariat)"
            class="tooltip"
            data-tooltip-location="bottom"
            data-tooltip="Modifier la description">
            <pencil-outline
              class="lien" />
          </span>
          {{ partenariat.description }}
        </td>
      </tr>
    </tbody>
  </table>
  <div
    v-else
    class="message">
    <div
      class="msg info">
      Pas de partenariat pour ce projet
    </div>
  </div>
  <div
    v-if="projet.chef"
    class="bouton bouton-petit"
    @click="afficherFormulaireAjouterPartenariatDialog = true">
    Ajouter partenariat
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherFormulaireAjouterPartenariatDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherFormulaireAjouterPartenariatDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Entités:</label>
            <input
              type="radio"
              v-model="typeEntite"
              id="radioEntreprise"
              value="entreprise">
            <label for="radioEntreprise">Entreprise</label>
            <input
              type="radio"
              v-model="typeEntite"
              id="radioEcole"
              value="ecole">
            <label for="radioEcole">École</label>
            <recherche-autocomplete
              v-model="partenariat.entite"
              :type="typeEntite"
              :url="correspondancesType[typeEntite].url"
              :creer="correspondancesType[typeEntite].creer"/>
          </div>
          <div>
            <label>Type de partenariat:</label>
            <input
              name="type_partenariat"
              type="radio"
              v-model="partenariat.type_partenariat"
              id="radioFinancier"
              value="financier">
            <label for="radioFinancier">financier</label>
            <input
              name="type_partenariat"
              type="radio"
              v-model="partenariat.type_partenariat"
              id="radioAcademique"
              value="academique">
            <label for="radioAcademique">académique</label>
            <input
              name="type_partenariat"
              type="radio"
              v-model="partenariat.type_partenariat"
              id="radioIndustriel"
              value="industriel">
            <label for="radioIndustriel">industriel</label>
          </div>
          <div>
            <label>Statut du partenariat:</label>
            <input
              name="statut_partenariat"
              type="radio"
              v-model="partenariat.statut"
              id="radioPrevu"
              value="PREVU">
            <label for="radioPrevu">prévu</label>
            <input
              name="statut_partenariat"
              type="radio"
              v-model="partenariat.statut"
              id="radioRealise"
              value="REALISE">
            <label for="radioRealise">réalisé</label>
          </div>
          <div>
            <textarea
              rows="5"
              cols="150" v-model="partenariat.description">
            </textarea>
          </div>
          <span
            v-if="projet.chef"
            @click="ajouterPartenariat"
            class="bouton bouton-petit">
            Ajouter le partenariat
          </span>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="modifierPartenariatDialog"
      >
      <div
        class="fondOverlay"
        @click="modifierPartenariatDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Description:</label>
            <textarea
              rows="3"
              cols="150" name="chapo"
              v-model="partenariatAModifier.description" />
          </div>
          <div>
            <div
              @click="modifierPartenariat"
              class="bouton bouton-petit">
              Modifier
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      class="overlay"
      v-if="ajouterEntrepriseDialog"
      >
      <div
        class="fondOverlay"
        @click="ajouterEntrepriseDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Nom de l'entreprise:</label>
            <input
              type="text"
              v-model="entreprise.nom"/>
          </div>
          <span
            @click="ajouterEntreprise"
            class="bouton">
            Ajouter entreprise
          </span>
        </div>
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div
      class="overlay"
      v-if="ajouterEcoleDialog"
      >
      <div
        class="fondOverlay"
        @click="ajouterEcoleDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <div>
            <label>Nom de l'école:</label>
            <input
              type="text"
              v-model="ecole.nom"/>
          </div>
          <span
            @click="ajouterEcole"
            class="bouton">
            Ajouter école
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  computed,
  ref,
  reactive,
  inject,
  onMounted,
  getCurrentInstance,
} from 'vue';
import {
  useRoute,
} from 'vue-router';
import { useStore } from 'vuex';
import {
  PencilOutline,
} from 'mdue';
import ApercuEntite from '@/components/outils/gendindus/components/ApercuEntite.vue';
import RechercheAutocomplete from '@/components/RechercheAutocomplete.vue';

export default {
  name: 'PartenariatsProjet',
  components: {
    PencilOutline,
    ApercuEntite,
    RechercheAutocomplete,
  },
  setup() {
    const creation = ref(false);
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const route = useRoute();
    const axios = inject('$axios');
    const toast = inject('$toast');
    const store = useStore();
    const projet = computed(() => store.state.projet);
    const afficherFormulaireAjouterPartenariatDialog = ref(false);
    const partenariat = reactive({
      entite: {},
      statut: '',
      type_partenariat: '',
      description: '',
    });
    const modifierPartenariatDialog = ref(false);
    const partenariatAModifier = reactive({
      id: 0,
      type_entite: '',
      statut: '',
      type_partenariat: '',
      description: '',
    });
    const typeEntite = ref('entreprise');
    const correspondancesType = {
      entreprise: {
        url: ['outils/gendindus/entreprises/recherche'],
        creer: 'Entreprise',
      },
      ecole: {
        url: ['outils/etudes/ecoles/recherche'],
        creer: 'Ecole',
      },
    };
    const ajouterEntrepriseDialog = ref(false);
    const ajouterEcoleDialog = ref(false);
    const entreprise = reactive({
      nom: '',
    });
    const ecole = reactive({
      nom: '',
    });

    async function ajouterEntreprise() {
      if (creation.value) {
        toast('⚠️ Ajout en cours', {
          type: 'error',
        });
      } else {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/gendindus/entreprises/ajouter`,
          entreprise,
        )
          .then((res) => {
            emitter.emit('entrepriseAjoutee', res.data);
            toast('✅ Entreprise ajoutée', {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
            ajouterEntrepriseDialog.value = false;
            creation.value = false;
          });
      }
    }

    async function ajouterEcole() {
      if (creation.value) {
        toast('⚠️ Ajout en cours', {
          type: 'error',
        });
      } else {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/outils/etudes/ecole/creer`,
          ecole,
        )
          .then((res) => {
            emitter.emit('ecoleAjoutee', res.data);
            toast('✅ École ajoutée', {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
            ajouterEcoleDialog.value = false;
            creation.value = false;
          });
      }
    }

    async function ajouterPartenariat() {
      if (creation.value) {
        toast('⚠️ Ajout en cours', {
          type: 'error',
        });
      } else {
        creation.value = true;
        await axios.post(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/partenariats/ajouter`,
          partenariat,
        )
          .then((res) => {
            store.dispatch('projet/ajouterPartenariat', res.data.partenariat);
            toast(`✅ ${res.data.msg}`, {
              type: 'success',
            });
          })
          .catch((e) => {
            toast(`⚠️ ${e.response.data.msg}`, {
              type: 'error',
            });
          })
          .finally(() => {
            afficherFormulaireAjouterPartenariatDialog.value = false;
            creation.value = false;
          });
      }
    }

    async function chargerPartenariats(id) {
      await axios.get(`${process.env.VUE_APP_API_URL}/projets/projet/${id}/partenariats`)
        .then(async (res) => {
          store.dispatch('projet/initialiserPartenariats', res.data);
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function supprimerPartenariat(p) {
      // eslint-disable-next-line
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce partenariat?')) {
        await axios.delete(
          `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/partenariats/${p.id}`,
        )
          .then((res) => {
            store.dispatch('projet/supprimerPartenariat', p);
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

    function afficherModifierPartenariatDialog(p) {
      modifierPartenariatDialog.value = true;
      partenariatAModifier.id = p.id;
      partenariatAModifier.type_entite = p.type_entite;
      partenariatAModifier.type_partenariat = p.type_partenariat;
      partenariatAModifier.statut = p.statut;
      partenariatAModifier.description = p.description;
    }

    async function modifierPartenariat() {
      await axios.put(
        `${process.env.VUE_APP_API_URL}/projets/projet/${route.params.id}/partenariats/${partenariatAModifier.id}`,
        {
          description: partenariatAModifier.description,
        },
      )
        .then((res) => {
          store.dispatch('projet/modifierPartenariat', partenariatAModifier);
          modifierPartenariatDialog.value = false;
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

    onMounted(async () => {
      if (projet.value.visibilite.mavisibilite === 'TOTALE') {
        await chargerPartenariats(route.params.id);
      }
      emitter.on('creerEntreprise', () => {
        ajouterEntrepriseDialog.value = true;
      });
      emitter.on('creerEcole', () => {
        ajouterEcoleDialog.value = true;
      });
    });

    return {
      projet,
      afficherFormulaireAjouterPartenariatDialog,
      ajouterPartenariat,
      partenariat,
      supprimerPartenariat,
      afficherModifierPartenariatDialog,
      modifierPartenariatDialog,
      modifierPartenariat,
      partenariatAModifier,
      typeEntite,
      correspondancesType,
      ajouterEntrepriseDialog,
      ajouterEcoleDialog,
      entreprise,
      ecole,
      ajouterEcole,
      ajouterEntreprise,
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
  /* width: 100px; */
  font-size: 12px;
}

.entrees .item-title {
  color: #000;
}

.message {
  margin: 10px;
}
</style>
