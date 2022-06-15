/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const state = {
  connecte: false,
  nom: '',
  nigend: '',
  unite: '',
  profil: {},
};

const getters = {
  connecte(state) {
    return state.connecte;
  },
  nom(state) {
    return state.nom;
  },
  nigend(state) {
    return state.nigend;
  },
  unite(state) {
    return state.unite;
  },
  profil(state) {
    return state.profil;
  },
};

const mutations = {
  connecter(state) {
    state.connecte = true;
  },
  deconnecter(state) {
    state.connecte = false;
  },
  changerNom(state, nom) {
    state.nom = nom;
  },
  changerUnite(state, unite) {
    state.unite = unite;
  },
  changerNigend(state, nigend) {
    state.nigend = nigend;
  },
  changerProfil(state, profil) {
    if (profil != null) {
      state.profil = { ...profil };
    }
  },
};

const actions = {
  chargerUtilisateur({ commit }, utilisateur) {
    commit('connecter');
    commit('changerNom', utilisateur.nom);
    commit('changerUnite', utilisateur.unite);
    commit('changerNigend', utilisateur.nigend);
  },
  deconnecterUtilisateur({ commit }) {
    commit('deconnecter');
    commit('changerNom', '');
    commit('changerUnite', '');
    commit('changerNigend', '');
    commit('changerProfil', {});
  },
  chargerProfil({ commit }, profil) {
    commit('changerProfil', profil);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
