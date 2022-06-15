/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const state = {
  retour: {},
  ariane: [],
  titre: '',
  lienGend2024: false,
  actuparprofil: false,
};

const getters = {
  retour(state) {
    return state.retour;
  },
  ariane(state) {
    return state.ariane;
  },
  titre(state) {
    return state.titre;
  },
  lienGend2024(state) {
    return state.lienGend2024;
  },
  actuparprofil(state) {
    return state.actuparprofil;
  },
};

const mutations = {
  changerLienGend2024(state, lienGend2024) {
    state.lienGend2024 = lienGend2024;
  },
  changerTitre(state, titre) {
    state.titre = titre;
  },
  changerTitreRetour(state, titre) {
    state.retour.titre = titre;
  },
  changerLienRetour(state, lien) {
    state.retour.lien = lien;
  },
  resetRetour(state) {
    state.retour = {};
  },
  changerAriane(state, ariane) {
    state.ariane = [...ariane];
  },
  resetAriane(state) {
    state.ariane = [];
  },
  changerActuparprofil(state, actuparprofil) {
    state.actuparprofil = actuparprofil;
  },
};

const actions = {
  chargerLienGend2024({ commit }, lienGend2024) {
    if (lienGend2024 !== undefined) {
      commit('changerLienGend2024', lienGend2024);
    } else {
      commit('changerLienGend2024', '');
    }
  },
  chargerTitre({ commit }, titre) {
    if (titre !== undefined) {
      commit('changerTitre', titre);
    } else {
      commit('changerTitre', '');
    }
  },
  chargerRetour({ commit }, retour) {
    if (retour !== undefined) {
      commit('changerTitreRetour', retour.titre);
      commit('changerLienRetour', retour.lien);
    } else {
      commit('resetRetour');
    }
  },
  chargerAriane({ commit }, ariane) {
    if (ariane !== undefined) {
      commit('changerAriane', ariane);
    } else {
      commit('resetAriane');
    }
  },
  chargerActuparprofil({ commit }, actuparprofil) {
    if (actuparprofil !== undefined) {
      commit('changerActuparprofil', actuparprofil);
    } else {
      commit('changerActuparprofil', false);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
