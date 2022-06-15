/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const state = {
  profils: [],
  sujets: [],
  competences: [],
};

const getters = {
  profils(state) {
    return state.profils;
  },
  sujets(state) {
    return state.sujets;
  },
  competences(state) {
    return state.sujets;
  },
};

const mutations = {
  changerProfils(state, profils) {
    state.profils = [...profils];
  },
  changerSujets(state, sujets) {
    state.sujets = [...sujets];
  },

  // Compétences
  reinitialiserCompetences(state) {
    state.competences = [];
  },
  ajouterCompetence(state, competence) {
    state.competences.push(competence);
  },
  actualiserCompetence(state, competence) {
    state.competences.find((c) => c.id === competence.id).commentaire = competence.commentaire;
  },
  supprimerCompetence(state, idCompetence) {
    state.competences = state.competences.filter((x) => x.id_competence !== idCompetence);
  },
};

const actions = {
  chargerProfils({ commit }, profils) {
    commit('changerProfils', profils);
  },
  chargerSujets({ commit }, sujets) {
    commit('changerSujets', sujets);
  },

  // Compétences
  chargerCompetences({ commit }, competences) {
    commit('reinitialiserCompetences');
    competences.forEach((competence) => {
      commit('ajouterCompetence', competence);
    });
  },
  ajouterCompetences({ commit }, competences) {
    competences.forEach((competence) => {
      commit('ajouterCompetence', competence);
    });
  },
  ajouterCompetence({ commit }, competence) {
    commit('ajouterCompetence', competence);
  },
  actualiserCompetence({ commit }, competence) {
    commit('actualiserCompetence', competence);
  },
  supprimerCompetence({ commit }, competence) {
    commit('supprimerCompetence', competence);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
