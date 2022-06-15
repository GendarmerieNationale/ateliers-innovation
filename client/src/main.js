import { createApp } from 'vue';
import moment from 'moment';
import mitt from 'mitt';
import axios from 'axios';
import matomo from 'vue-matomo';
import VCalendar from 'v-calendar';
import 'v-calendar/dist/style.css';
import DKToast from 'vue-dk-toast';
import VueSplide from '@splidejs/vue-splide';
import Popper from 'vue3-popper';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
// on importe tous les styles
import './assets/css/polices.css';
import './assets/css/badges.css';
import './assets/css/boutons.css';
import './assets/css/bulles.css';
import './assets/css/capsules.css';
import './assets/css/data-tooltip.css';
import './assets/css/fondus.css';
import './assets/css/messages.css';
import './assets/css/outilsnav.css';
import './assets/css/overlays.css';
import './assets/css/style.css';
import './assets/css/tableaux.css';

moment.locale('fr');

const app = createApp(App);

app.component('Popper', Popper);

axios.defaults.withCredentials = true;
app.provide('$axios', axios);

app.config.globalProperties.version = require('../package.json').version;

app.config.globalProperties.$moment = moment;
const emitter = mitt();
app.config.globalProperties.emitter = emitter;

app
  .use(matomo, {
    host: process.env.VUE_APP_MATOMO_URL,
    siteId: process.env.VUE_APP_MATOMO_SITE_ID,
    router,
  })
  .use(store)
  .use(router)
  .use(VCalendar, {})
  .use(DKToast, {
    duration: 3000,
    positionY: 'bottom',
    positionX: 'center',
  })
  .use(VueSplide)
  .mount('#app');
//  .use(new VueSocketIO(optionsVueIO))

// createApp(App).use(store).use(router).mount('#app');
