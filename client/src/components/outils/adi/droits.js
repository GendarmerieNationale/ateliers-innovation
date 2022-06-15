/* eslint-disable */
const droits = {
  nom: 'ADI',
  introduction: `Droits des ADI`,
  defaut: [
    {
      libelle: 'Candidater avec un projet',
      contenu: 'Tout les utilisateurs connectés qui ont créé un projet sur le site',
    },
    {
      libelle: 'Voter',
      contenu: 'Tout utilisateur connecté.',
    },
  ],
  parametrables: [
    {
      cle: 'administrerDroits',
      libelle: 'Administrer les droits',
    },
    {
      cle: 'comiteLecture',
      libelle: 'Membres du comité de lecture',
    },
    {
      cle: 'comiteSuivi',
      libelle: 'Membres du comité de suivi',
    },
    {
      cle: 'gererCampagne',
      libelle: 'Gérer des campagnes de votes',
    },
    {
      cle: 'voirResultatsEnCours',
      libelle: `Voir les résultats quand un vote est en cours`,
    },
    {
      cle: 'gererADP',
      libelle: 'Gérer les anciennes campagnes ADP',
    },
    {
      cle: 'creerRepertoire',
      libelle: 'Créer un répertoire',
    },
  ],
};

module.exports = { droits };
