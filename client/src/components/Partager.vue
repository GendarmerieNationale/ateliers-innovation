<template>
  <div
    class="partager"
    :key="`partage-${type}-${partageId}`">
    <span>
      <span
        class="partage tooltip"
        :class="{ dejaPartage: datePartage.length > 0 }"
        :data-tooltip="datePartage.length ? `Déja partagé le ${datePartage}` : 'Partager'"
        @click="dialogPartage = true">
        <Share
          class="lien partager" />
      </span>
    </span>
  </div>
  <transition name="fade">
    <div
      id="partageOverlay"
      v-if="dialogPartage"
      >
      <div
        class="fondOverlay"
        @click="dialogPartage = false">
      </div>
      <div class="contenuMenuOverlay boutonsPartage">
        <a
          class="survol"
          :href="`mailto:?subject=Lien intéressant sur le site du ST&body=${appUrl+route.fullPath}`">
          <div
             class="wrapper"
             @click="dialogPartage = false">
            <img src="~@/assets/img/courriel.png" />
          </div>
          <span>
            Par courriel
          </span>
        </a>
        <div>
          <div
            class="survol"
            @click="precisionPartage = !precisionPartage">
            <div class="wrapper">
              <img src="~@/assets/img/user.png" />
            </div>
            <span>
              Sur mon profil
            </span>
          </div>
          <div
            class="precisionPartage"
            v-if="precisionPartage">
            <textarea
              v-model="commentaire"
              class="commentairePartage"
              placeholder="Vous pouvez ajouter un commentaire à votre partage ici."></textarea>
            <span
              class="boutonPartage"
              @click="e => partager(e.target)">
              Partager
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  defineComponent,
  toRefs,
  computed,
  inject,
  ref,
  onMounted,
  getCurrentInstance,
} from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import {
  Share,
} from 'mdue';

export default defineComponent({
  name: 'Partager',
  components: {
    Share,
  },
  props: ['partageId', 'type'],
  setup(props) {
    const route = useRoute();
    const axios = inject('$axios');
    const toast = inject('$toast');
    const internalInstance = getCurrentInstance();
    const apiUrl = process.env.VUE_APP_API_URL;
    const appUrl = process.env.VUE_APP_URL;
    const store = useStore();
    const connexion = computed(() => store.state.connexion);
    const { partageId, type } = toRefs(props);
    const dialogPartage = ref(false);
    const precisionPartage = ref(false);
    const datePartage = ref('');
    const commentaire = ref('');

    function popupConnexion() {
      window.open(
        `${apiUrl}/connecter`,
        'newwindow',
        'width=300,height=250',
      );
      return false;
    }

    async function partager(elt) {
      if (!elt.classList.contains('recherche')) {
        elt.classList.toggle('recherche');
        if (connexion.value.connecte) {
          await axios.post(`${process.env.VUE_APP_API_URL}/fil/partager/`, { id: partageId.value, type: type.value, commentaire: commentaire.value })
            .then((res) => {
              dialogPartage.value = false;
              datePartage.value = internalInstance.appContext.config.globalProperties.$moment(res.data.date).format('l');
              toast('✅ Publication partagée', {
                type: 'success',
              });
            })
            .catch((e) => {
              toast(`⚠️ ${e.response.data}`, {
                type: 'error',
              });
            });
        } else {
          popupConnexion();
        }
        elt.classList.toggle('recherche');
      }
    }

    async function verifPartage() {
      const res = await axios.get(`${process.env.VUE_APP_API_URL}/fil/partage/verif/${type.value}/${partageId.value}`);
      if (res.data.length > 0) {
        datePartage.value = internalInstance.appContext.config.globalProperties.$moment(res.data).format('l');
      }
    }

    onMounted(async () => {
      verifPartage();
    });

    return {
      appUrl,
      route,
      connexion,
      partager,
      dialogPartage,
      datePartage,
      precisionPartage,
      commentaire,
    };
  },
});
</script>

<style scoped>
.partage {
  cursor: pointer;
}

.dejaPartage img {
  filter: invert(15%) sepia(82%) saturate(3332%) hue-rotate(210deg) brightness(95%) contrast(101%);
}

@keyframes fade {
  from { opacity: 1.0; }
  50% { opacity: 0.2; }
  to { opacity: 1.0; }
}

.partage > span {
  margin: 0 5px;
}

.recherche {
  animation:fade 500ms infinite;
}

/*
  À VOIR SI ON PEUT MUTUALISER AVEC OVERLAYS.CSS
*/
#partageOverlay {
  z-index: 109;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Caviar Dreams';
}

#partageOverlay .contenuMenuOverlay {
  width: 40%;
  min-height: 20%;
  padding: 20px;
  margin: 20px;
  border: 2px solid white;
  /* font-size: 2em; */
  font-variant: small-caps;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 300;
}

.boutonsPartage {
  display: flex;
  /* font-size: 1.5em !important; */
  font-weight: bold;
  justify-content: space-around;
  align-items: center;
}

.boutonsPartage > * {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 90%;
  width: 50%;
}

.survol {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 2em;
}

.survol:hover {
  filter: invert(23%) sepia(64%) saturate(0%) hue-rotate(146deg) brightness(91%) contrast(88%);
}

.boutonsPartage .wrapper {
  /* height: 50%; */
  display: flex;
  justify-content: center;
  align-items: center;
}

.boutonsPartage span {
  color: black;
}

.boutonsPartage img {
  max-height: 50%;
  max-width: 50%;
}

.precisionPartage {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.precisionPartage > * {
  margin: 10px 0;
}

.precisionPartage label {
  cursor: pointer;
}

.precisionPartage textarea {
  resize: none;
  font-family: 'Caviar Dreams';
  background-color: #dddd
}

.commentairePartage {
  width: 100%;
}

.boutonPartage {
  border: solid 2px white;
  padding: 10px;
  font-family: "Caviar Dreams";
  transition: all 0.4s ease;
  cursor: pointer;
  color: black;
}

.boutonPartage:hover {
  background-color: black;
}

.boutonPartage * {
  transition: all 0.4s ease;
}

.boutonPartage:hover, .boutonPartage:hover * {
  color: white;
}
</style>
