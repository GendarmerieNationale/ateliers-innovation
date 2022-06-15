<template>
  <div class="home">
    <div
      id="supraConteneur"
      :class="{
        fonduHaut: !scroll.haut,
        fonduBas: !scroll.bas
        }"
      @scroll="verifScroll">
      <div class="bienvenue">
        <h2>Bienvenue sur le site du</h2>
        <h1>Service de la Transformation</h1>
      </div>
      <div class="principal">
        <div class="conteneurGend2024">
          <div
            class="lienGend2024"
            @mouseover="survole2024 = true"
            @mouseout="survole2024 = false">
            <router-link to="/rubrique/gend2024">
              <forme
                :zoom="3"
                forme="Octahedron"
                couleur="05aae3"
                couleursurvole="00ced1"
                :survole="survole2024"
                cle="lienGend2024"/>
                Gend 20.24
            </router-link>
          </div>
        </div>
        <div id="conteneurEmpilement">
          <Empilement />
        </div>
        <div
          class="robot">
          <div
            @click="$router.push('/quisommesnous')"
            class="bubble bubble-bottom-right">
            Qui sommes-nous?
          </div>
          <img id="robot" src="~@/assets/img/robot.png" />
          <div
            @click="$router.push('/outils/lapause')"
            class="bubble bubble-bottom-left">
            ☕ Faites une pause à la DGGN
          </div>
        </div>
      </div>
      <notre-actu />
    </div>
  </div>
</template>

<script>
import {
  computed,
  getCurrentInstance,
  ref,
  onMounted,
} from 'vue';
import {
  useRoute,
  useRouter,
} from 'vue-router';
import { useStore } from 'vuex';
import Forme from '@/components/Forme.vue';
import Empilement from '@/components/Empilement.vue';
import NotreActu from '@/views/NotreActu.vue';

export default {
  name: 'AccueilNonConnecte',
  components: {
    Empilement,
    Forme,
    NotreActu,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const survole2024 = ref(false);
    const store = useStore();
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const connexion = computed(() => store.state.connexion);
    const scroll = ref({
      haut: true,
      bas: false,
    });

    function verifScroll() {
      const myDiv = document.getElementById('supraConteneur');
      scroll.value.haut = myDiv.scrollTop === 0;
      scroll.value.bas = myDiv.scrollHeight - myDiv.scrollTop === myDiv.offsetHeight;
    }

    function popupGererProfil() {
      emitter.emit('gererProfil', {
        fonction: 'creer',
        afficherRobot: false,
      });
    }

    onMounted(() => {
      // on vérifie si on est avant le lancement
      const moment = internalInstance
        .appContext.config.globalProperties.$moment;
      const DEBUT = moment();
      const FIN = moment('2021-06-10 09:00');
      if ((FIN.diff(DEBUT) > 0) && (route.path.indexOf('force') < 0)) {
        // on redirige vers le compte à rebours
        router.push('/rebours');
      }
    });

    return {
      survole2024,
      popupGererProfil,
      connexion,
      scroll,
      verifScroll,
    };
  },
};
</script>

<style scoped>
a {
  color: black;
}

.home {
  width: 100%;
  height: 100%;
  display: flex;
}

#supraConteneur {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: mask 0.5s ease-in-out;
}

.bienvenue {
  font-family: 'Champagne & Limousines';
  font-variant: small-caps;
  display: flex;
  flex-direction: column;
  height: 10%;
  justify-content: center;
  text-align: right;
  padding-right: 5%;
}

h1, h2 {
  margin: 0;
  padding: 0;
}

h1 {
  font-size: 3em;
}

h2 {
  font-size: 2em;
}

.principal {
  display: flex;
  width: 100%;
  height: 65%;
}

.conteneurGend2024 {
  width: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.lienGend2024 {
  cursor: pointer;
  font-family: "Caviar Dreams";
  font-variant: small-caps;
  font-size: 3em;
}

#conteneurEmpilement {
  height: 100%;
  width: 50%;
  display: flex;
  justify-content: center;
}

.robot {
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5%;
}

@keyframes tilt {
  0% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(0);
  }
}

.robot .bubble:hover {
  animation: tilt .1s linear 2;
}

.robot > * {
  cursor: pointer;
}

.robot img {
  max-width: 80%;
  max-height: 80%;
}

.robot .bubble {
  align-self: flex-start;
  font-family: 'Caviar Dreams';
  margin-top: 5%;
}

#scroll {
  position: fixed;
}
</style>
