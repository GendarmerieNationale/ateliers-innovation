<template>
  <div class="explications">
    <div
      class="bouton"
      @click="explicationsDialog = true">
      <div class="boutonLogo">
        <information-outline/>
        <span>
          Connaître les ADI
        </span>
      </div>
    </div>
    <div
      class="categories">
      <div
        class="consulter">
        <div
          class="bouton"
          @click="emitter.emit('rechercherProjetADI')">
          <div class="boutonLogo">
            <Magnify/>
            <span>
              Consulter
            </span>
          </div>
        </div>
        <div
          class="nouvelles">
          <p>
            Voici les derniers projets validés:
          </p>
          <template
            v-for="(projet) in derniersProjetsValides"
            :key="`projet-${projet.id_projet}`">
            <p>
              Le {{ $moment(projet.date_inscription).format('l à H:mm:ss') }}
              <apercu
                :id="projet.id_projet"
                type="projet" />
            </p>
          </template>
        </div>
      </div>
      <div
        class="candidater">
        <div
          v-if="connecte"
          @click="emitter.emit('afficherAjouterProjetDialog')"
          class="bouton">
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
          class="bouton">
          Se connecter pour candidater
        </div>
        <div
          class="nouvelles">
          <p>
            Voici les derniers projets déposés:
          </p>
          <template
            v-for="(projet) in derniersProjetsDeposes"
            :key="`projet-${projet.id_projet}`">
            <p>
              Le {{ $moment(projet.date_inscription).format('l à H:mm:ss') }}
              <apercu
                :id="projet.id_projet"
                type="projet" />
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
  <Droits
    type="adi"
    racine="outils/"/>

  <transition name="fade">
    <div
      class="overlay"
      v-if="explicationsDialog"
      >
      <div
        class="fondOverlay">
      </div>
      <div class="contenuFormulaireOverlay">
        <div>
          <img id="logoST" src="~@/assets/img/outils/adi/processus.png" />
        </div>
        <div
          class="fermetureInfographie">
          <span
            @click="fermerExplicationsDialog"
            class="bouton bouton-petit">
            J'ai compris
          </span>
          <span>
            <div
              v-if="connecte">
              <input
                v-model="afficherOuverture"
                type="checkbox"
                id="plusAfficher"/>
              <label
                for="plusAfficher">
                Afficher à l'ouverture
              </label>
            </div>
            <div
              v-else
              @click="emitter.emit('popupConnexion')">
              <span
                class="bouton bouton-petit">
                Se connecter
              </span>
              pour ne plus voir ceci
            </div>
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  inject,
  onMounted,
  computed,
  ref,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import Droits from '@/components/Droits.vue';
import {
  InformationOutline,
  Magnify,
  AccountPlusOutline,
} from 'mdue';
import Apercu from '@/components/Apercu.vue';

export default {
  name: 'Explications',
  components: {
    Droits,
    InformationOutline,
    Magnify,
    AccountPlusOutline,
    Apercu,
  },
  setup() {
    const store = useStore();
    const connecte = computed(() => store.state.connexion.connecte);
    const nigend = computed(() => store.state.connexion.nigend);
    const axios = inject('$axios');
    const explicationsDialog = ref(false);
    const afficherOuverture = ref(true);
    const derniersProjetsValides = ref([]);
    const derniersProjetsDeposes = ref([]);

    async function changerAffichageOuverture() {
      await axios.post(
        `${process.env.VUE_APP_API_URL}/outils/adi/config/ouverture`,
        {
          afficherOuverture: afficherOuverture.value,
        },
      )
        .then(() => {
          console.log('ok');
        })
        .catch((error) => {
          console.log(error);
        });
    }

    async function chargerOuverture() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/config/ouverture`)
        .then((res) => {
          afficherOuverture.value = res.data;
          explicationsDialog.value = res.data;
        })
        .catch((error) => {
          console.log(error);
          explicationsDialog.value = true;
        })
        .finally(() => {
          watch(afficherOuverture, () => {
            changerAffichageOuverture();
          });
        });
    }

    async function chargerDerniersProjets() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projets/derniers`)
        .then((res) => {
          derniersProjetsDeposes.value = [...res.data];
        })
        .catch((error) => {
          console.log(error);
        });
    }

    async function chargerDerniersProjetsValides() {
      await axios.get(`${process.env.VUE_APP_API_URL}/outils/adi/projets/derniers/valides`)
        .then((res) => {
          derniersProjetsValides.value = [...res.data];
        })
        .catch((error) => {
          console.log(error);
        });
    }

    async function fermerExplicationsDialog() {
      explicationsDialog.value = false;
    }

    onMounted(async () => {
      await chargerOuverture();
      await chargerDerniersProjets();
      await chargerDerniersProjetsValides();
    });

    return {
      nigend,
      fermerExplicationsDialog,
      explicationsDialog,
      afficherOuverture,
      changerAffichageOuverture,
      derniersProjetsValides,
      derniersProjetsDeposes,
      connecte,
    };
  },
};
</script>

<style scoped>
.explications {
  width: 90%;
  text-align: justify;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.explications > * {
  margin: 10px 0;
}

.categories {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.categories > * {
  width: 45%;
  min-width: 500px;
  display: flex;
  flex-direction: column;
}

.categories > div > .bouton {
  margin: 10px 0;
}

.nouvelles {
  border: dotted 1px #ccc;
  padding: 10px;
  background-color: #fffa;
}

.fermetureInfographie {
  overflow: visible;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
}
</style>
