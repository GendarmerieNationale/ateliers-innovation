import { createStore } from 'vuex';
import connexion from './modules/connexion';
import profils from './modules/profils';
import nav from './modules/nav';
import notifications from './modules/notifications';
import projet from './modules/projet';

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    connexion,
    nav,
    profils,
    notifications,
    projet,
  },
});
