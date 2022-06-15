/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const state = {};

const getters = {
  notifications(state) {
    return state.notifications;
  },
};

const mutations = {
  actualisernotification(state, notification) {
    state[notification.type] = {
      nombre: notification.nombre || null,
      description: notification.description,
    };
  },
};

const actions = {
  actualisernotifications({ commit }, notifs) {
    Object.keys(notifs).forEach((notif) => {
      commit('actualisernotification', {
        type: notif,
        nombre: notifs[notif].nombre,
        description: notifs[notif].description,
      });
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
