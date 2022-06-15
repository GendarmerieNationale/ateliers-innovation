/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const state = {
  nom: '',
  adi: null,
  id: 0,
  chef: false,
  presentation: '',
  objectifs: '',
  objectifsTypes: [],
  historique: [],
  benefices: '',
  motscles: [],
  fichiers: [],
  membres: [],
  partenariats: [],
  mesroles: [{
    id: 0,
    id_role: 0,
    nom: '',
  }],
  omnibus: [],
  visibilite: {
    type: 'PUBLIC',
    liste: [],
    mavisibilite: 'NEANT',
  },
};

const getters = {
  nom(state) {
    return state.nom;
  },
  id(state) {
    return state.id;
  },
  presentation(state) {
    return state.presentation;
  },
  objectifs(state) {
    return state.objectifs;
  },
  objectifsTypes(state) {
    return state.objectifsTypes;
  },
  benefices(state) {
    return state.benefices;
  },
  fichiers(state) {
    return state.fichiers;
  },
  motscles(state) {
    return state.motscles;
  },
  historique(state) {
    return state.historique;
  },
  partenariats(state) {
    return state.partenariats;
  },
  membres(state) {
    return state.membres;
  },
  mesroles(state) {
    return state.mesroles;
  },
  typeVisibilite(state) {
    return state.visibilite.type;
  },
  listeVisibilite(state) {
    return state.visibilite.liste;
  },
  omnibus(state) {
    return state.omnibus;
  },
  projetsOmnibus: (state) => (type) => state.omnibus.filter((p) => p.type === type),
};

const mutations = {
  changerChamp(state, changement) {
    if (changement.champ === 'mesroles') {
      if (changement.valeur === null) {
        changement.valeur = [{
          id: 0,
          id_role: 0,
          nom: '',
        }];
      }
      if (changement.valeur?.map((x) => x.id_role).includes(1)) {
        state.chef = true;
      } else {
        state.chef = false;
      }
    }
    if (changement.champ === 'visibilite') {
      state.visibilite.type = changement.valeur;
    } else if (changement.champ === 'mavisibilite') {
      state.visibilite.mavisibilite = changement.valeur;
    } else {
      state[changement.champ] = changement.valeur;
    }
  },

  // Fichiers
  reinitialiserFichiers(state) {
    state.fichiers = [];
  },
  ajouterFichiers(state, fichiers) {
    state.fichiers = state.fichiers.concat(fichiers);
  },
  supprimerFichier(state, fichierId) {
    state.fichiers = state.fichiers.filter((x) => x.id !== fichierId);
  },

  // Membres
  reinitialiserMembres(state) {
    state.membres = [];
  },
  ajouterMembre(state, membre) {
    state.membres.push({
      personne: membre.personne,
      photo: membre.photo,
      roles: [...membre.roles],
    });
  },
  supprimerMembre(state, membre) {
    state.membres = state.membres.filter((x) => x.personne !== membre);
  },

  // Rôles
  ajouterRole(state, role) {
    if (state.membres.map((x) => x.personne).includes(role.personne)) {
      // le membre existe déjà, on ajoute un rôle
      state.membres.find((x) => x.personne === role.personne).roles.push(
        {
          id: role.id,
          id_role: role.id_role,
          nom: role.nom_role,
          date_debut: role.date_debut,
        },
      );
    } else {
      state.membres.push({
        personne: role.personne,
        photo: null,
        roles: [
          {
            id: role.id,
            id_role: role.id_role,
            nom: role.nom_role,
            date_debut: role.date_debut,
          },
        ],
      });
    }
  },
  supprimerRole(state, role) {
    const t = state.membres.find((x) => x.roles.map((y) => y.id).includes(role));
    t.roles = t.roles.filter((x) => x.id !== role);
    // si jamais  le rôle est de l'utilisateur
    state.mesroles = state.mesroles.filter((x) => x.id !== role);
    if (!t.roles.length) {
      // il n'y a plus de rôle pour ce membre, on le supprime
      state.membres = state.membres.filter((x) => x.personne !== t.personne);
    }
  },

  // Partenariats
  reinitialiserPartenariats(state) {
    state.partenariats = [];
  },
  ajouterPartenariat(state, partenariat) {
    state.partenariats.push({
      id: partenariat.id,
      id_entite: partenariat.id_entite,
      type_entite: partenariat.type_entite,
      type_partenariat: partenariat.type_partenariat,
      description: partenariat.description,
      statut: partenariat.statut,
    });
  },
  supprimerPartenariat(state, partenariat) {
    state.partenariats = state.partenariats.filter((p) => p.id !== partenariat.id);
  },
  modifierPartenariat(state, partenariat) {
    state.partenariats.find((p) => p.id === partenariat.id)
      .description = partenariat.description;
  },

  // Objectifs
  reinitialiserObjectifs(state) {
    state.objectifsTypes.length = 0;
  },
  ajouterObjectif(state, objectif) {
    state.objectifsTypes.push(objectif);
  },
  supprimerObjectif(state, idObjectif) {
    state.objectifsTypes = state.objectifsTypes.filter((o) => o.id !== idObjectif);
  },

  // Historique
  reinitialiserHistorique(state) {
    state.historique.length = 0;
  },
  ajouterHistorique(state, entree) {
    state.historique.push(entree);
  },
  supprimerHistorique(state, idHistorique) {
    state.historique = state.historique.filter((o) => o.id !== idHistorique);
  },

  // Mots-clés
  reinitialiserMotscles(state) {
    state.motscles = [];
  },
  associerMotcle(state, motcle) {
    state.motscles.push({
      id: motcle.id,
      mot: motcle.mot,
    });
  },
  dissocierMotcle(state, motcle) {
    state.motscles = state.motscles.filter((m) => m.id !== motcle.id);
  },

  // Omnibus
  reinitialiserOmnibus(state) {
    state.omnibus.length = 0;
  },
  ajouterOmnibus(state, projet) {
    state.omnibus.push(projet);
  },
  supprimerOmnibus(state, id) {
    state.omnibus = state.omnibus.filter((p) => p.id_omnibus !== id);
  },

  // Visibilité
  modifierTypeVisibilite(state, visibilite) {
    state.visibilite.type = visibilite;
  },
  modifierVisibilites(state, visibilites) {
    state.visibilite.liste = [...visibilites.map((v) => ({
      type: v.type_visibilite,
      identifiant: v.identifiant,
      precision: v.precision,
    }))];
  },
  supprimerVisibilite(state, visibilite) {
    state.visibilite.liste = state.visibilite.liste
      .filter((v) => v.type !== visibilite.type
        || v.identifiant !== visibilite.identifiant);
  },
  ajouterVisibilite(state, visibilite) {
    state.visibilite.liste.push({
      type: visibilite.type_visibilite,
      identifiant: visibilite.identifiant,
      precision: visibilite.precision,
    });
  },
  modifierVisibilite(state, visibilite) {
    state.visibilite.liste.find((v) => v.type === visibilite.type_visibilite
      && v.identifiant === visibilite.identifiant)
      .precision = visibilite.precision;
  },
  modifierMaVisibilite(state, visibilite) {
    state.visibilite.mavisibilite = visibilite;
  },
};

const actions = {
  changerChamp({ commit }, changement) {
    commit('changerChamp', changement);
  },
  initialiserFichiers({ commit }, fichiers) {
    commit('reinitialiserFichiers');
    commit('ajouterFichiers', fichiers);
  },
  ajouterFichiers({ commit }, fichiers) {
    commit('ajouterFichiers', fichiers);
  },
  supprimerFichier({ commit }, fichierId) {
    commit('supprimerFichier', fichierId);
  },
  initialiserMembres({ commit }, membres) {
    commit('reinitialiserMembres');
    try {
      membres.forEach((membre) => {
        commit('ajouterMembre', membre);
      });
    } catch (e) {
      console.log(JSON.stringify(membres));
      console.log(e);
    }
  },

  initialiserObjectifs({ commit }, objectifs) {
    commit('reinitialiserObjectifs');
    objectifs.forEach((objectif) => {
      commit('ajouterObjectif', objectif);
    });
  },
  ajouterObjectif({ commit }, objectif) {
    commit('ajouterObjectif', objectif);
  },
  supprimerObjectif({ commit }, objectif) {
    commit('supprimerObjectif', objectif);
  },

  initialiserHistorique({ commit }, historique) {
    commit('reinitialiserHistorique');
    historique.forEach((entree) => {
      commit('ajouterHistorique', entree);
    });
  },
  ajouterHisorique({ commit }, entree) {
    commit('ajouterHistorique', entree);
  },
  supprimerHistorique({ commit }, idEntree) {
    commit('supprimerHistorique', idEntree);
  },

  initialiserPartenariats({ commit }, partenariats) {
    commit('reinitialiserPartenariats');
    partenariats.forEach((partenariat) => {
      commit('ajouterPartenariat', partenariat);
    });
  },
  ajouterPartenariat({ commit }, partenariat) {
    commit('ajouterPartenariat', partenariat);
  },
  supprimerPartenariat({ commit }, partenariat) {
    commit('supprimerPartenariat', partenariat);
  },
  modifierPartenariat({ commit }, partenariat) {
    commit('modifierPartenariat', partenariat);
  },
  initialiserMotscles({ commit }, motscles) {
    commit('reinitialiserMotscles');
    motscles.forEach((motcle) => {
      commit('associerMotcle', motcle);
    });
  },
  associerMotsCles({ commit }, motscles) {
    motscles.forEach((motcle) => {
      commit('associerMotcle', motcle);
    });
  },
  associerMotcle({ commit }, motcle) {
    commit('associerMotcle', motcle);
  },
  dissocierMotcle({ commit }, motcle) {
    commit('dissocierMotcle', motcle);
  },
  ajouterRole({ commit }, role) {
    commit('ajouterRole', role);
  },
  supprimerMembre({ commit }, membre) {
    commit('supprimerMembre', membre);
  },
  supprimerRole({ commit }, role) {
    commit('supprimerRole', role);
  },
  initialiserOmnibus({ commit }, omnibus) {
    commit('reinitialiserOmnibus');
    omnibus.forEach((projet) => {
      commit('ajouterOmnibus', projet);
    });
  },
  ajouterOmnibus({ commit }, projet) {
    commit('ajouterOmnibus', projet);
  },
  supprimerOmnibus({ commit }, id) {
    commit('supprimerOmnibus', id);
  },
  modifierTypeVisibilite({ commit }, visibilite) {
    commit('modifierTypeVisibilite', visibilite);
  },
  modifierVisibilites({ commit }, visibilites) {
    commit('modifierVisibilites', visibilites);
  },
  supprimerVisibilite({ commit }, visibilite) {
    commit('supprimerVisibilite', visibilite);
  },
  ajouterVisibilite({ commit }, visibilite) {
    commit('ajouterVisibilite', visibilite);
  },
  traiterVisibilite({ commit }, visibilite) {
    commit('modifierVisibilite', visibilite);
  },
  modifierMaVisibilite({ commit }, visibilite) {
    commit('modifierMaVisibilite', visibilite);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
