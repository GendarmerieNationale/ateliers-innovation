<template>
  <div id="containerApp">
    <gerer-profil />
    <creer-projet />
    <header>
      <div class="gauche">
        <router-link to="/">
          <img id="logoST" src="~@/assets/img/logo_ST_bleue.png" />
        </router-link>
      </div>
      <div
        class="centre">
        <span
          class="ariane"
          v-if="ariane.length">
          <template
            v-for="(lien, i) in ariane"
            :key="`ariane-${i}`">
            <router-link
              :to="lien.route">
              {{ lien.titre }}
            </router-link>
          </template>
        </span>
      </div>
      <div class="droite">
        <span
          class="titreDroite"
          v-if="titre">
          {{ titre }}
        </span>
      </div>
    </header>
    <div class="content">
      <router-view>
      </router-view>
    </div>
    <footer v-if="$route.path.indexOf('/admin') != 0 && $route.path.indexOf('/rebours') != 0">
      <barre-recherche
        :connecte="connecte" />
    </footer>
  </div>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  inject,
  computed,
} from 'vue';
import { useStore } from 'vuex';
import BarreRecherche from '@/components/BarreRecherche.vue';
import GererProfil from '@/components/GererProfil.vue';
import CreerProjet from '@/components/CreerProjet.vue';
// eslint-disable-next-line
import '@/assets/css/popper.css';

export default defineComponent({
  name: 'App',
  components: {
    BarreRecherche,
    GererProfil,
    CreerProjet,
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const store = useStore();
    const titre = computed(() => store.state.nav.titre);
    const ariane = computed(() => store.state.nav.ariane);
    const connecte = computed(() => store.state.connexion.connecte);
    const toast = inject('$toast');
    const axios = inject('$axios');
    const apiUrl = process.env.VUE_APP_API_URL;
    const mobileUrl = process.env.VUE_APP_MOBILE_URL;

    /*
      Cette fonction permet de chercher les informations de session sur le
      serveur.
    */
    async function verifConnexion() {
      let verifProfil = false;
      await axios.get(`${process.env.VUE_APP_API_URL}/infosconnexion`)
        .then((res) => {
          if (res.data.connecte) {
            // le serveur voit l'utilisateur comme connecté
            if (res.data.nigend !== store.state.connexion.nigend) {
              /*
                si le NIGEND n'est pas le bon dans le client
                on actualise les données du client
              */
              store.dispatch('connexion/chargerUtilisateur', {
                nom: res.data.nom,
                unite: res.data.unite,
                nigend: res.data.nigend,
              });
              // on charge l'utilisateur, on va vérifier son profil
              verifProfil = true;
            }
          } else if (store.state.connexion.connecte) {
            /*
              pour le serveur l'utilisateur n'est pas connecté
              mais le client voit l'utilisateur connecté
              on le déconnecte donc du client
            */
            store.dispatch('connexion/deconnecterUtilisateur');
          }
          return verifProfil;
        })
        .catch((e) => {
          console.error(`Impossible de vérifier la connexion: ${e}`);
        })
        .then(async (verif) => {
          if (verif) {
            await axios.get(`${process.env.VUE_APP_API_URL}/profils/perso`, { refresh: Math.random() })
              .then((resVerif) => {
                emitter.emit('connexion');
                store.dispatch('connexion/chargerProfil', resVerif.data);
              })
              .catch((err) => {
                console.error(`Erreur 1: ${err}`);
              });
          }
        });
    }

    /*
      Affiche la popup de connexion, qui diffère en prod et en dev.
      Dès que la fenêtre est fermée, le client charge les données
      de session.
    */
    function popupConnexion() {
      const win = window.open(
        `${apiUrl}/connecter`,
        'newwindow',
        'width=300,height=250',
      );
      const timer = setInterval(() => {
        if (win.closed) {
          clearInterval(timer);
          verifConnexion();
        }
      }, 1000);
      return false;
    }

    /* eslint-disable */
    function mobileCheck() {
      let check = false;
      (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))window.location=b})(navigator.userAgent||navigator.vendor||window.opera,mobileUrl);
      return check;
    };
    /* eslint-enable */

    onMounted(() => {
      // On regarde si on est sur mobile
      // mobileCheck();
      /*
        Au chargement de l'application on vérifie la connexion car
        l'utilisateur peut avoir fermé l'onglet ou ouvert un nouvel
        onglet.
        On vérifie ensuite régulièrement, au cas où l'utilisateur
        s'est déconnecté d'un autre endroit, pour éviter qu'il croit
        avoir accès à certaines fonctionnalités
      */
      verifConnexion();
      setInterval(verifConnexion, 10000);
      emitter.on('popupConnexion', () => {
        popupConnexion();
      });
      emitter.on('connexion', () => {
        console.log('Vous êtes connecté!');
      });

      // pour actualiser un badge
      emitter.on('actualiseBadge', async ({ type, valeur }) => {
        await axios.post(`${process.env.VUE_APP_API_URL}/badges/badge-${type}`, { valeur })
          .then((res) => {
            if (res.data.nouveauNiveau === true) {
              toast(`Nouveau niveau pour le badge "${res.data.badge}"!`, {
                styles: {
                  background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
                },
              });
            }
          })
          .catch((err) => {
            console.error(`Erreur badge: ${err}`);
          });
      });

    });

    return {
      connecte,
      verifConnexion,
      popupConnexion,
      ariane,
      titre,
    };
  },
});

</script>

<style>
@keyframes fade {
  from { opacity: 1.0; }
  50% { opacity: 0.4; }
  to { opacity: 1.0; }
}

.recherche {
  animation:fade 500ms infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

body {
  background-image: url(~@/assets/img/SlideSansCubes.png);
  background-attachment: fixed;
  background-size: cover;
  margin: 0;
  font-size: 16px;
}

.bg-light {
  background:linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(~@/assets/img/SlideSansCubes.png);
}

@media only screen and (max-width: 1100px){
  body {
    font-size: 13px !important;
  }
}

a {
  color: black;
  text-decoration: none;
}

#containerApp {
  display: flex;
  flex-direction: column;
  height: 99vh;
}

#containerApp > header {
  height: 10vh;
  z-index: 100;
  display: flex;
  justify-content: space-between;
}

#containerApp > header > * {
}

#containerApp > header .gauche {
  display: flex;
  align-items: center;
}

#containerApp > header .gauche a {
  height: 100%;
  width: 13vw;
  display: flex;
  align-items: center;
}

#containerApp > header .centre {
  display: flex;
  flex-grow: 1;
  justify-content: flex-start;
  align-items: center;
}

#containerApp > header .droite {
  display: flex;
  justify-content: flex-end;
}

#containerApp > header .titreDroite {
  font-family: 'Amelia Bloomer';
  font-size: 10em;
  padding-right: 20px;
  margin-top: -15px;
}

#containerApp > header .titreDroite::first-letter {
  text-transform: capitalize;
}

#containerApp > .content {
  flex-grow: 1;
  display: flex;
  height: 85%;
}

#containerApp > footer {
  height: 5%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

#logoST {
  max-height: 100%;
  max-width: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

a {
  text-decoration: none;
  cursor: pointer;
}

.chapo {
  font-size: 0.7em;
}

.texte p, .texte ul {
  margin: 0
}

.texte p {
  text-indent: 30px;
}
</style>
