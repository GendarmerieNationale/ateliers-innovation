const Router = require('express-promise-router')
const db = require('../../db')
const { retour } = require('../../utils/retour')
const droits = require('../droits')
const projets = require('../projets')
const router = new Router()
module.exports = { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     ADI_Projet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: L'identifiant unique du projet.
 *           example: 14
 *         nom:
 *           type: string
 *           description: Nom du projet
 *           example: Projet ALPHA.
 *         date_inscription:
 *           type: string
 *           format: date-time
 *           description: Date de l'inscription du projet aux ADI
 *           exemple: 2022-01-08T07:00:00.000Z
 *         id_campagne:
 *           type: integer
 *           description: L'identifiant unique de la campagne.
 *           example: 153
 *         titre_campagne:
 *           type: string
 *           description: Titre de la campagne
 *           example: Vote pour les ADI 2024
 *     ADI_Avis:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: L'identifiant unique de l'avis.
 *           example: 146
 *         id_projet:
 *           type: integer
 *           description: L'identifiant unique du projet.
 *           example: 14
 *         code_unite:
 *           type: integer
 *           description: Le code de l'unité dont on a besoin de l'avis
 *           example: 9114
 *         type_avis:
 *           type: string
 *           description: Le type de l'avis
 *           example: innocuite
 *         explication:
 *           type: string
 *           description: Le motif pour avoir mis cet avis
 *           example: Ce projet est tout simplement nul. Bouh. Remboursez!
 *         avis:
 *           type: boolean
 *           description: Booléen indiquant si l'avis est favorable
 *           example: true
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de l'avis
 *           exemple: 2022-01-08T07:00:00.000Z
 *         auteur:
 *           type: string
 *           description: NIGEND du rédacteur de l'avise
 *           example: 308698
*/

/*
  NOTIFICATIONS
*/

/*
  Pour récupérer les notifs:
  - les projets non assignés à une campagne pour un gestionnaire
  - les campagnes futures ou en cours pour lesquelles je n'ai pas voté
*/

router.get('/notifications', async (req, res) => {
  let rows;
  const notifications = {
    campagnes_non_votees: {
      nombre: 0,
      description: "Nombre de campagne en cours pour lesquelles vous n'avez pas voté",
    },
    nouveauxprojets: {
      nombre: 0,
      description: "Nombre de projets candidats qui n'ont pas été traités"
    },
  };

  ({ rows } = await db.query(`
    WITH campagnes_votees AS (
      SELECT DISTINCT id_campagne
      FROM adi.votes
      WHERE votant = $1
    )
    SELECT count(*) as campagnes_non_votees
      FROM adi.campagnes_votes camp
    LEFT JOIN campagnes_votees cv
      ON cv.id_campagne = camp.id
    WHERE fin >= current_timestamp
      AND cv.id_campagne IS NULL
    `, [req.session.nigend]))
  if (+rows[0].campagnes_non_votees !== 0) {
    notifications.campagnes_non_votees.nombre = +rows[0].campagnes_non_votees;
  }

  const gererCampagne = await droits.verifDroits('adi',
    req.session.unite,
    req.session.nigend,
    'gererCampagne');
  if (gererCampagne) {
    ({ rows } = await db.query(`
      SELECT
        count(*) as non_assigne
      FROM projets p
      JOIN adi.candidats cand
        ON cand.id_projet = p.id
      LEFT JOIN adi.participation_campagne part
        ON part.id_projet = cand.id_projet
      LEFT JOIN adi.campagnes_votes camp
        ON camp.id = part.id_campagne
      WHERE camp.titre IS NULL
      `))
    if (+rows[0].non_assigne !== 0) {
      notifications.nouveauxprojets.nombre = +rows[0].non_assigne;
    }
  }
  retour(req, res, 200, notifications);
})

/*
  CONFIG
*/
/**
 * @swagger
 * /outils/adi/config/ouverture:
 *   get:
 *     tags:
 *       - ADI
 *     summary: Récupérer l'info d'affichage de popup d'explication
 *     description: Récupère l'information si l'utilisateur veut voir la fenêtre affichée à l'accès de la page
 *     responses:
*       200:
*         description: La valeur booléenne recherchée.
*         content:
*           application/json:
*             schema:
*               type: boolean
*               description: Le booléen indiquant si le réglage de l'utilisateur.
*               example: true
*/
router.get('/config/ouverture', async (req, res) => {
  if (req.session.nigend === undefined) {
    retour(req, res, 403, {
      erreur: "UTILISATEUR_NON_CONNECTE",
      msg: "Vous devez être connecté!"
    });
  } else {
    const { rows } = await db.query(`
      SELECT
        popup_explications
      FROM
        adi.config
      WHERE
        nigend = $1
      `, [
        req.session.nigend,
      ])
      if (rows.length === 0) {
        retour(req, res, 200, true);
      } else {
        retour(req, res, 200, rows[0].popup_explications);
      }
  }
})

/**
 * @swagger
 * /outils/adi/config/ouverture:
 *   post:
 *     tags:
 *       - ADI
 *     summary: Changer l'information d'affichage de la popup d'explication
 *     description: Modifier l'information si l'utilisateur veut voir la fenêtre affichée à l'accès de la page
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     requestBody:
 *       description: La nouvelle valeur à prendre en compte.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               afficherOuverture:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Un objet qui contient l'information enregistrée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 popup_explications:
 *                   type: boolean
 *                   description: Le booléen indiquant si le réglage de l'utilisateur.
 *                   example: true
 *       500:
 *         description: Erreur serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur:
 *                   type: string
 *                   description: identifiant de l'erreur, dans ce cas "ERREUR_SERVEUR"
 *                   example: ERREUR_SERVEUR
 *                 msg:
 *                   type: string
 *                   description: Message compréhensible par un humain
 *                   example: Erreur serveur.
*/
router.post('/config/ouverture', async (req, res) => {
  if (req.session.nigend === undefined) {
    retour(req, res, 403, {
      erreur: "UTILISATEUR_NON_CONNECTE",
      msg: "Vous devez être connecté!"
    });
  } else {
    const { rows } = await db.query(`
      INSERT INTO adi.config (
        nigend,
        popup_explications
      )
      VALUES ($1,$2)
      ON CONFLICT (nigend)
        DO UPDATE SET popup_explications = $2
      RETURNING popup_explications
    `, [
      req.session.nigend,
      req.body.afficherOuverture,
    ])
    if (rows.length === 0) {
      retour(req, res, 500, {
        erreur: 'ADI_ERREUR_SERVEUR_OUVERTURE',
        msg: 'Erreur serveur.',
      });
    } else {
      retour(req, res, 200, {
        popup_explications: rows[0].popup_explications,
      });
    }
  }
})

/*
  PROJETS
*/

/**
 * @swagger
 * /outils/adi/projets:
 *   post:
 *     tags:
 *       - ADI
 *     summary: Rechercher des projets
 *     description: Rechercher des projets en fonction de critères particuliers.
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     requestBody:
 *       description: Les critères à rechercher.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: ['NOUVEAU','CANDIDAT','AJOURNE','REFUSE','POUR_AVIS','COMITE_SUIVI','VALIDE']
 *                 description: statut du projet recherché
 *                 example: VALIDE
 *               texte:
 *                 type: string
 *                 description: texte à rechercher
 *                 example: voiture volante
 *               chef:
 *                 type: integer
 *                 description: NIGEND du chef de projet
 *                 example: 308698
 *               avisdemande:
 *                 type: integer
 *                 description: code de l'unité a qui on a demandé l'avis
 *                 example: 13231
 *     responses:
*       200:
*         description: L'entreprise avec son identifiant.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ADI_Projet'
*       400:
*         description: Mauvais paramètres.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: MAUVAIS_PARAMETRES
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain indiquant le nombre d'erreurs
*                   example: 4 erreur(s).
*                 erreurs:
*                   type: array
*                   description: Liste des erreurs rencontrés
*                   items:
*                     type: string
*                     description: Erreur rencontrée
*                     example: Il faut au moins un paramètre de recherche
*       500:
*         description: Erreur serveur ou dans la recherche de l'événement.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: ERREUR_SERVEUR
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Erreur serveur.
*/
router.post('/projets', async (req, res) => {
  const {
    statut,
    chef,
    texte,
    avisdemande,
  } = req.body;
  let parametres = [];
  let erreurs = [];
  const where = [];
  const withs = [];
  if (statut !== undefined) {
    if (['NOUVEAU','CANDIDAT','AJOURNE','REFUSE','POUR_AVIS','COMITE_SUIVI','VALIDE'].includes(statut)) {
      parametres.push({
        valeur: statut,
        type: 'statut',
      })
      where.push(`cand.statut = $${parametres.findIndex((x) => x.type === 'statut') + 1}`)
    } else {
      erreurs.push('Mauvais statut');
    }
  }
  if (avisdemande !== undefined) {
    if (Number.isInteger(+avisdemande)) {
      parametres.push({
        valeur: +avisdemande,
        type: 'avisdemande',
      })
      withs.push(`avis AS (
        SELECT id_projet, code_unite
        FROM adi.avis
        WHERE
          code_unite = $${parametres.findIndex((x) => x.type === 'avisdemande') + 1}
      )`);
      // where.push(`avis.code_unite = $${parametres.findIndex((x) => x.type === 'avisdemande') + 1}`)
    } else {
      erreurs.push("Mauvais code unité pour l'avis demandé");
    }
  }
  if (texte !== undefined) {
    parametres.push({
      valeur: `%${texte}%`,
      type: 'texte',
    })
    where.push(`(
      p.presentation ILIKE $${parametres.findIndex((x) => x.type === 'texte') + 1}
      OR p.objectifs ILIKE $${parametres.findIndex((x) => x.type === 'texte') + 1}
      OR p.benefices ILIKE $${parametres.findIndex((x) => x.type === 'texte') + 1}
    )`)
  }
  if (chef !== undefined) {
    if (Number.isInteger(+chef)) {
      parametres.push({
        valeur: +chef,
        type: 'chef',
      })
      withs.push(`chefs AS (
        SELECT id_projet, personne
        FROM public.role_dans_projet
        WHERE
          personne = $${parametres.findIndex((x) => x.type === 'chef') + 1}
          AND id_role = 1
          AND date_fin IS NULL
      )`);
      where.push(`chefs.personne = $${parametres.findIndex((x) => x.type === 'chef') + 1}`)
    } else {
      erreurs.push('Mauvais format de chef');
    }
  }
  if (parametres.length === 0) {
    erreurs.push('Il faut au moins un paramètre de recherche');
  }
  if (erreurs.length !== 0) {
    retour(req, res, 400, {
      erreur: 'ADI_RECHERCHER_PROJETS_MAUVAIS_PARAMETRES',
      msg: `${erreurs.length} erreur(s)`,
      erreurs,
    });
  } else {
    try {
      const { rows } = await db.query(`
        ${withs.length === 0 ? ''
          : ` WITH ${withs.join(' , ')}`}
        SELECT
          p.id,
          p.nom,
          part.id_campagne,
          camp.titre as titre_campagne,
          cand.date_inscription,
          cand.statut,
          array_remove(array_agg(DISTINCT aa.code_unite), NULL) as unites_avis
        FROM projets p
        JOIN adi.candidats cand
          ON cand.id_projet = p.id
        ${parametres.find((x) => x.type === 'chef')
          ? `JOIN chefs
               ON chefs.id_projet = p.id`
          : ''}
        ${parametres.find((x) => x.type === 'avisdemande')
          ? `JOIN avis
               ON avis.id_projet = p.id`
          : ''}
        LEFT JOIN adi.avis aa
          ON aa.id_projet = p.id
        LEFT JOIN adi.participation_campagne part
          ON part.id_projet = cand.id_projet
        LEFT JOIN adi.campagnes_votes camp
          ON camp.id = part.id_campagne
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        GROUP BY p.id, part.id_campagne, camp.titre, cand.date_inscription, cand.statut
        ORDER BY p.nom
        `, parametres.map((x) => x.valeur))
      retour(req, res, 200, rows);
    } catch(e) {
      retour(req, res, 500, {
        erreur: 'ADI_ERREUR_SERVEUR_RECHERCHE_PROJETS',
        msg: 'Erreur serveur',
        detail: e,
      });
    }
  }
})

/**
 * @swagger
 * /outils/adi/projets/derniers/{valides}:
 *   get:
 *     tags:
 *       - ADI
 *     summary: Récupérer les derniers projets
 *     description: Récupère les derniers projets, avec l'option de ne récupérer que les validés
 *     parameters:
 *      - in: path
 *        name: valides
 *        required: false
 *        description: chaîne 'valides' si on ne veut que les valides.
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: La liste des derniers projets, dans la limite de 10.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 id_projet:
 *                   type:  integer
 *                   description: L'identifiant unique du projet.
 *                   example: 14
 *                 nom:
 *                   type: string
 *                   description: Le nom du projet.
 *                   example: Projet de ouf
 *                 statut:
 *                   type: string
 *                   description: Le statut du projet.
 *                   example: CANDIDAT
 *                 date_inscription:
 *                   type: string
 *                   format: date-time
 *                   description: date de l'inscription du projet aux ADI
 *                   exemple: 2022-01-08T07:00:00.000Z
*/
router.get('/projets/derniers/:valides?', async (req, res) => {
  const { valides } = req.params;
  const { rows } = await db.query(`
    SELECT
      c.date_inscription,
      c.id_projet,
      p.nom,
      c.statut
    FROM adi.candidats c
    JOIN public.projets p
      ON c.id_projet = p.id
    ${ valides === 'valides' ? " WHERE c.statut = 'VALIDE' " : ' ' }
    ORDER BY date_inscription DESC
    LIMIT 10
    `)
  retour(req, res, 200, rows);
})

/**
 * @swagger
 * /outils/adi/projets/recherche/{nom}:
 *   get:
 *     tags:
 *       - ADI
 *     summary: Rechercher un projet par nom
 *     description: Récupère les derniers projets, avec l'option de ne récupérer que les validés
 *     parameters:
 *      - in: path
 *        name: nom
 *        required: true
 *        description: chaîne de caractères à rechercher dans le nom des projets.
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: La liste des derniers projets ayant la chaîne de caractères recherchée dans le nom
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 id_projet:
 *                   type: integer
 *                   description: L'identifiant unique du projet.
 *                   example: 14
 *                 nom:
 *                   type: string
 *                   description: Le nom du projet.
 *                   example: Projet de ouf
*/
router.get('/projets/recherche/:nom', async (req, res) => {
  const { nom } = req.params
  const nigend = req.session.nigend;
  const { rows } = await db.query(`
    SELECT p.id, p.nom
    FROM projets p
    JOIN adi.candidats cand
      ON cand.id_projet = p.id
    LEFT JOIN adi.participation_campagne part
      ON part.id_projet = cand.id_projet
    WHERE nom ILIKE $1
      AND cand.statut = 'VALIDE'
    ORDER BY nom DESC`, [
      `%${nom}%`
    ]);
  retour(req, res, 200, rows)
})

/**
 * @swagger
 * /outils/adi/projet/{id}/adi:
 *   get:
 *     tags:
 *       - ADI
 *     summary: Récupère les informations d'ADI d'un projet
 *     description: Récupère les derniers projets, avec l'option de ne récupérer que les validés
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: identifiant du projet.
 *        schema:
 *          type: integer
 *     responses:
 *       200:
 *         description: La liste des derniers projets ayant la chaîne de caractères recherchée dans le nom
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_projet:
 *                   type: integer
 *                   description: L'identifiant unique du projet.
 *                   example: 14
 *                 id_campagne:
 *                   type: integer
 *                   description: L'identifiant unique de la campagne, si le projet est dans une campagne.
 *                   example: 46
 *                 nom:
 *                   type: string
 *                   description: Le nom du projet.
 *                   example: Projet de ouf
 *                 presentation:
 *                   type: string
 *                   description: Présentation du projet.
 *                   example: Ce projet indique quel personnel on peut virer sur la base du temps qu'il passe à jouer à Tetris sur LRPGN.
 *                 objectifs:
 *                   type: string
 *                   description: Les objectifs du projet
 *                   example: Ce projet a comme objectif principal de devenir innovateur expert. Au moins les choses sont dites.
 *                 benefices:
 *                   type: string
 *                   description: Bénéfices du projet.
 *                   example: Ce projet permet de faire des trucs trop bien, comme économiser de l'argent
 *                 statut:
 *                   type: string
 *                   description: Le statut du projet.
 *                   example: CANDIDAT
 *                 date_inscription:
 *                   type: string
 *                   format: date-time
 *                   description: date de l'inscription du projet aux ADI
 *                   exemple: 2022-01-08T07:00:00.000Z
*/
router.get('/projet/:id/adi', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query(`
    SELECT
      c.*,
      p.presentation,
      p.objectifs,
      p.benefices,
      part.id_campagne
    FROM adi.candidats c
    JOIN projets p
      ON c.id_projet = p.id
    LEFT JOIN adi.participation_campagne part
      ON part.id_projet = p.id
    WHERE c.id_projet = $1`, [
      id
    ]);
  retour(req, res, 200, rows[0])
})

// fonction permettant d'ajouter un élément particulier dans un historique
async function ajouterHistorique(idProjet,historique) {
  ({ rows } = await db.query(`
    INSERT INTO adi.historique (
      id_projet,
      contenu
    )
    VALUES ($1, $2)
  `, [
    idProjet,
    historique,
  ]))
}

// fonction permettant de modifier le statut d'un projet
async function modifierStatut(idProjet,statut,nigend,contexte = null) {
  const historique = {
    type: 'changement_statut',
    statut,
    auteur: nigend,
  }
  await ajouterHistorique(idProjet,{...historique,...contexte});
  const { rows } = await db.query(`
    UPDATE adi.candidats
    SET statut = $2
    WHERE id_projet = $1`, [
      idProjet,
      statut,
    ]);
}

/**
 * @swagger
 * /outils/adi/envoyerprojet:
 *   post:
 *     tags:
 *       - ADI
 *     summary: Pour inscrire un projet aux ADI
 *     description: On enregistre un projet aux ADI.
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     requestBody:
 *       description: Les propriétés du projet à ajouter.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_projet:
 *                 type: integer
 *                 description: identifiant du projet
 *                 example: 14
 *               objectifs:
 *                 type: string
 *                 description: Les objectifs du projet
 *                 example: Ce projet a comme objectif principal de devenir innovateur expert. Au moins les choses sont dites.
 *               benefices:
 *                 type: string
 *                 description: Bénéfices du projet.
 *                 example: Ce projet permet de faire des trucs trop bien, comme économiser de l'argent
 *     responses:
*       200:
*         description: Le contact avec son détail.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 id:
*                   type: integer
*                   description: L'identifiant unique du projet.
*                   example: 14
*                 nom:
*                   type: string
*                   description: nom du projet.
*                   example: Projet de fou
*                 date_creation:
*                   type: string
*                   format: date-time
*                   description: date de création du projet
*                   exemple: 2022-01-08T07:00:00.000Z
*                 presentation:
*                   type: string
*                   description: Présentation du projet.
*                   example: Ce projet indique quel personnel on peut virer sur la base du temps qu'il passe à jouer à Tetris sur LRPGN.
*                 date_inscription:
*                   type: string
*                   format: date-time
*                   description: date de l'inscription du projet aux ADI
*                   exemple: 2022-01-08T07:00:00.000Z
*       500:
*         description: Erreur serveur.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: DEPOT_CANDIDATURE
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Ce projet a déjà candidaté.
*                 detail:
*                   type: object
*                   description: Contenu technique de l'erreur
*/
router.post('/envoyerprojet', async (req, res) => {
  if (req.session.nigend === undefined) {
    retour(req, res, 403, {
      erreur: "UTILISATEUR_NON_CONNECTE",
      msg: "Vous devez être connecté!"
    });
  } else {
    let rows;
    const {
      id_projet,
    } = req.body;
    try {
      ({ rows } = await db.query(`
        WITH inserted_projet AS (
          INSERT INTO adi.candidats (
            id_projet
          )
          VALUES ($1)
          RETURNING *
        )
        SELECT
          p.*,
          inserted_projet.date_inscription
        FROM public.projets p
        JOIN inserted_projet
          ON inserted_projet.id_projet = p.id
        WHERE p.id = $1
        `, [
          id_projet,
        ]))
      if (rows.length === 1) {
        ajouterHistorique(id_projet, {
          type: 'changement_statut',
          statut: 'NOUVEAU',
          auteur: req.session.nigend,
        });
        retour(req, res, 200, rows[0]);
      } else {
        retour(req, res, 500, {
          erreur: 'ADI_DEPOT_CANDIDATURE_01',
          msg: "Erreur de dépôt de candidature."
        });
      }
    } catch(e) {
      let erreur = 'ADI_DEPOT_CANDIDATURE_02';
      let msg = 'Erreur de dépôt de candidature.';
      if (e.code === '23505') {
        msg = "Ce projet a déjà candidaté.";
        erreur = 'ADI_DEJA_CANDIDAT';
      }
      retour(req, res, 500, {
        msg,
        erreur,
        detail: e
      });
    }
  }
})

/*
  Pour retourner le statut d'un projet
*/
async function statutProjet(id) {
  let rows;
  ({ rows } = await db.query(`
    SELECT statut
    FROM adi.candidats
    WHERE id_projet = $1
    `, [
      id,
    ]))
  return rows[0].statut;
}

/*
  Pour vérifier si la campagne correspond au statut
*/
async function verifStatutProjet(id, acceptation, statuts) {
  let rows;
  const s = await statutProjet(id);
  if (acceptation) {
    return (statuts.includes(s));
  } else {
    return (!statuts.includes(s));
  }
}

/*
  Fonction callback qui permet au middleware express de couper la route
  si le statut n'est pas correct
*/
async function verifStatutProjetCB(acceptation, statut, req, res, next) {
  const d = await verifStatutProjet(req.params.id, acceptation, statut);
  if (d) {
    return next();
  } else {
    retour(req, res, 500, {
      erreur: 'ADI_STATUT_INCOMPATIBLE',
      msg: "Le statut est incompatible avec l'opération."
    });
  }
}

/**
 * @swagger
 * /outils/adi/projet/{id}/validercandidature:
 *   put:
 *     tags:
 *       - ADI
 *     summary: Valider la participation d'un projet
 *     description: Le chef de projet valide l'inscription du projet aux ADI
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: identifiant du projet à inscrire.
 *         schema:
 *           type: string
 *     responses:
*       200:
*         description: Envoi du message de prise en compte
*         content:
*           application/json:
*             schema:
*               type: string
*               description: Message à renvoyer
*               example: Modification prise en compte
*       500:
*         description: Erreur serveur.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: STATUT_INCOMPATIBLE
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Le statut est incompatible avec l'opération.
*/
router.put('/projet/:id/validercandidature',
  projets.verifChef,
  // vérifier si le statut est correct
  (req, res, next) => verifStatutProjetCB(true, ['NOUVEAU','AJOURNE'], req, res, next),
  async (req, res) => {
    const { id } = req.params;
    await modifierStatut(id, 'CANDIDAT', req.session.nigend);
    retour(req, res, 200, 'Modification prise en compte')
  }
)

/**
 * @swagger
 * /outils/adi/projet/{id}/arbitrercomitelecture:
 *   post:
 *     tags:
 *       - ADI
 *     summary: Valider la candidature d'un projet
 *     description: Le comité de lecture confirme l'inscription du projet aux ADI
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: identifiant du projet à inscrire.
 *         schema:
 *           type: string
 *     responses:
*       200:
*         description: Envoi du message de prise en compte
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 statut:
*                   type: string
*                   description: Nouveau statut du projet
*                   example: AJOURNE
*                 msg:
*                   type: string
*                   description:  Message à renvoyer
*                   example: Le comité de lecture a ajourné le projet
*       400:
*         description: Mauvais paramètres.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: MAUVAIS_TYPE_REPONSE
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Mauvais type de réponse.
*       500:
*         description: Erreur serveur.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: ERREUR_SERVEUR
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Erreur étrange de traitement de requête.
*/
const TYPES_AVIS = ['innocuite','generalisation'];
router.post('/projet/:id/arbitrercomitelecture',
  droits.verifDroitsCB.bind(undefined, 'adi', 'comiteLecture'),
  // vérifier si le statut est correct
  (req, res, next) => verifStatutProjetCB(true, ['CANDIDAT'], req, res, next),
  async (req, res) => {
    const { id } = req.params
    let rows;
    const {
      reponse,
      commentaire,
      pouravis,
    } = req.body;
    let statut = '';
    let msg;
    switch(reponse) {
      case 'accepte': {
        // on ajoute les unités desquelles on veut les avis
        const values = pouravis.map((x, i) => {
          return (`($1, $2, $${i+3})`)
        }).join(',');
        TYPES_AVIS.forEach(async (type, i) => {
          ({ rows } = await db.query(`
            INSERT INTO adi.avis (id_projet, type_avis, code_unite)
            VALUES ${values}`, [id, type].concat(pouravis.map((x) => x.code_unite))));
        });
        statut = 'POUR_AVIS';
        msg = 'Le comité de lecture a validé le projet';
        break;
      }
      case 'ajourne': {
        statut = 'AJOURNE';
        msg = 'Le comité de lecture a ajourné le projet';
        break;
      }
      case 'refuse': {
        statut = 'REFUSE';
        msg = 'Le comité de lecture a refusé le projet';
        break;
      }
      default: {
        retour(req, res, 400, {
          erreur: 'ADI_MAUVAIS_TYPE_REPONSE',
          msg: "Mauvais type de réponse."
        });
      }
    }
    if (statut.length !== 0) {
      ({ rows } = await db.query(`
        INSERT INTO adi.commentaires (
          id_projet,
          type,
          contenu,
          auteur,
          date
        )
        VALUES ($1,$2,$3,$4,$5)
        `, [
          id,
          'COMITE_LECTURE',
          commentaire,
          req.session.nigend,
          'now()',
        ]));
      await modifierStatut(
        id,
        statut,
        req.session.nigend,
        { contexte: 'COMITE_LECTURE' }
      );
      retour(req, res, 200, {
        statut,
        msg,
      })
    }
    else {
      retour(req, res, 500, {
        erreur: 'ADI_ERREUR_SERVEUR_AVIS',
        msg: "Erreur étrange de traitement de requête."
      });
    }
  }
)

/**
 * @swagger
 * /outils/adi/projet/{id}/avisdirections/{tout}:
 *   get:
 *     tags:
 *       - ADI
 *     summary: Récupérer les avis des directions
 *     description: Récupère les avis des directions sur un projet, soit tous soit ceux dont on a besoin pour le prochain comité
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: identifiant unique du projet
 *        schema:
 *          type: string
 *      - in: path
 *        name: tout
 *        required: false
 *        description: chaîne 'tout' si on veut tous les avis
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: La liste des avis.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/ADI_Avis'
*/
router.get('/projet/:id/avisdirections/:tout?', async (req, res) => {
  const { id, tout } = req.params
  // "tout" permet d'avoir tous les avis, sinon juste les avis
  // à prendre en compte lors du prochain comité seront renvoyés
  const { rows } = await db.query(`
    ${
      tout === 'tout' ? '' :
      `WITH derniere_date AS (
        SELECT
        MAX(date) as date
        FROM adi.historique
        WHERE
          id_projet = $1
          AND contenu->>'statut' = 'POUR_AVIS'
        )`
    }
    SELECT *
    FROM adi.avis
    WHERE id_projet = $1
    ${
      tout === 'tout' ? '' :
      ` AND (
        date > (SELECT date from derniere_date)
        OR date is null) `
    }
    ORDER BY id asc`, [
      id
    ]);
  retour(req, res, 200, rows)
})

/**
 * @swagger
 * /outils/adi/projet/{id}/avis:
 *   put:
 *     tags:
 *       - ADI
 *     summary: Donner son avis sur la candidature d'un projet
 *     description: Une personne appartenant à une unité dont le comité de lecture a demandé l'avis envoie celui-ci
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: identifiant du projet à propos duquel on donne l'avis.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: L'avis en question.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unite:
 *                 type: integer
 *                 description: Code unité au nom duquel on donne l'avis
 *                 example: 9114
 *               type:
 *                 type: string
 *                 description: Type de l'avis
 *                 example: innocuite
 *               avis:
 *                 type: boolean
 *                 description: Booléen selon que l'avis est favorable ou non
 *                 example: true
 *               explication:
 *                 type: string
 *                 description: Motivation de l'avis
 *                 example: Ce projet est tout simplement nul. Bouh. Remboursez!
 *     responses:
*       200:
*         description: Envoi du message de prise en compte
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 avis:
*                   $ref: '#/components/schemas/ADI_Avis'
*                 msg:
*                   type: string
*                   description: Message retourné
*                   example: Avis pris en compte
*                 comitesuivi:
*                   type: boolean
*                   description: Booléen si c'était le dernier avis et que le projet passe maintenant en comité de suivi
*                   example: true
*       400:
*         description: Type d'avis non reconnu.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: MAUVAIS_TYPE
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Type non reconnu.
*       500:
*         description: Erreur serveur.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: ERREUR_SERVEUR
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Erreur d'ajout d'avis.
*/
router.put('/projet/:id/avis',
  // vérifier si le statut est correct
  (req, res, next) => verifStatutProjetCB(true, ['POUR_AVIS'], req, res, next),
  async (req, res) => {
    if (req.session.nigend === undefined) {
      retour(req, res, 403, {
        erreur: "UTILISATEUR_NON_CONNECTE",
        msg: "Vous devez être connecté!"
      });
    } else {
      const { id } = req.params
      let rows;
      const {
        unite,
        type,
        avis,
        explication,
      } = req.body;
      if (!TYPES_AVIS.includes(type)) {
        retour(req, res, 400, {
          erreur: 'ADI_MAUVAIS_TYPE_AVIS_CANDIDATURE',
          msg: "Type non reconnu",
        })
      } else {
        ({ rows } = await db.query(`
          UPDATE adi.avis
          SET
            avis = $3,
            explication = $4,
            auteur = $5,
            date = now()
          WHERE
            id_projet = $1
            AND code_unite = $2
            AND type_avis = $6
            AND avis IS NULL
          RETURNING *`, [
            id,
            unite,
            avis,
            explication,
            req.session.nigend,
            type,
          ]));
          const avisretourne = rows[0];
        if (rows.length === 0) {
          retour(req, res, 500, {
            erreur: 'ADI_ERREUR_SERVEUR_AVIS_CANDIDATURE',
            msg: "Erreur d'ajout d'avis.",
          })
        } else {
          // on regarde s'il y a d'autres avis, si c'est bon on place au comité de lecture
          let comitesuivi = false;
          ({ rows } = await db.query(`
            SELECT * FROM adi.avis
            WHERE id_projet = $1
            AND avis IS NULL`, [
              id
            ]));
          if (rows.length === 0) {
            // il n'y a pas d'autres avis à mettre
            await modifierStatut(id, 'COMITE_SUIVI', req.session.nigend);
            comitesuivi = true;
          }
          retour(req, res, 200, {
            avis: avisretourne,
            msg: "Avis pris en compte",
            comitesuivi,
          })
        }
      }
    }
  }
)

/**
 * @swagger
 * /outils/adi/projet/{id}/arbitrercomitesuivi:
 *   post:
 *     tags:
 *       - ADI
 *     summary: Arbitrer en comité de suivi
 *     description: Le comité de suivi arbitre sur le projet suite à l'avis des directions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: identifiant du projet à arbitrer.
 *         schema:
 *           type: string
 *     responses:
*       200:
*         description: Envoi du message de prise en compte
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 statut:
*                   type: string
*                   description: Nouveau statut du projet
*                   example: AJOURNE
*                 msg:
*                   type: string
*                   description:  Message à renvoyer
*                   example: Le comité de suivi a ajourné le projet
*       400:
*         description: Mauvais paramètres.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: MAUVAIS_TYPE_REPONSE
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Mauvais type de réponse.
*       500:
*         description: Erreur serveur.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 erreur:
*                   type: string
*                   description: identifiant de l'erreur
*                   example: ERREUR_SERVEUR
*                 msg:
*                   type: string
*                   description: Message compréhensible par un humain
*                   example: Erreur étrange de traitement de requête.
*/
router.post('/projet/:id/arbitrercomitesuivi',
  // vérifier si le statut est correct
  (req, res, next) => verifStatutProjetCB(true, ['COMITE_SUIVI'], req, res, next),
  droits.verifDroitsCB.bind(undefined, 'adi', 'comiteSuivi'),
  async (req, res) => {
    const { id } = req.params
    let rows;
    const {
      reponse,
      commentaire,
    } = req.body;
    let statut = '';
    let msg;
    switch(reponse) {
      case 'accepte': {
        statut = 'VALIDE';
        msg = 'Le comité de suivi a validé le projet';
        break;
      }
      case 'ajourne': {
        statut = 'AJOURNE';
        msg = 'Le comité de suivi a ajourné le projet';
        break;
      }
      case 'refuse': {
        statut = 'REFUSE';
        msg = 'Le comité de suivi a refusé le projet';
        break;
      }
      default: {
        retour(req, res, 400, {
          erreur: 'ADI_MAUVAIS_TYPE_REPONSE_ARBITRER_COMITE_SUIVI',
          msg: "Mauvais type de réponse."
        });
      }
    }
    if (statut.length !== 0) {
      ({ rows } = await db.query(`
        INSERT INTO adi.commentaires (
          id_projet,
          type,
          contenu,
          auteur,
          date
        )
        VALUES ($1,$2,$3,$4,$5)
        `, [
          id,
          'COMITE_SUIVI',
          commentaire,
          req.session.nigend,
          'now()',
        ]));
      await modifierStatut(
        id,
        statut,
        req.session.nigend,
        { contexte: 'COMITE_SUIVI' }
      );
      retour(req, res, 200, {
        statut,
        msg,
      })
    }
    else {
      retour(req, res, 500, {
        erreur: 'ADI_ERREUR_SERVEUR_ARBITRER_COMITE_SUIVI',
        msg: "Erreur étrange de traitement de requête."
      });
    }
  }
)

/**
 * @swagger
 * /outils/adi/projet/{id}/historique:
 *   get:
 *     tags:
 *       - ADI
 *     summary: Récupère l'historique ADI d'un projet
 *     description: Pour récupérer l'ensemble des opérations du processus des ADI concernant le projet
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: identifiant du projet.
 *        schema:
 *          type: integer
 *     responses:
 *       200:
 *         description: La liste des opérations réalisées (calidation, arbistrage, avis, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Identifiant du commentaire ou de l'avis
 *                     example: 45
 *                   id_projet:
 *                     type: integer
 *                     description: Identifiant du projet
 *                     example: 54
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: date de l'opération
 *                     exemple: 2022-01-08T07:00:00.000Z
 *                   contenu:
 *                     type: object
 *                     description: commentaire ou avis
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: ['commentaire', 'avis', 'changement_statut']
 *                         description: Type de l'opération.
 *                         example: commentaire
 *                       auteur:
 *                         type: string
 *                         description: NIGEND de la personne ayant procédé à l'opération
 *                         example: 308698
 *                       statut:
 *                         type: string
 *                         description: Si l'opération est un changement de statut, celui-ci
 *                         example: POUR_AVIS
 *                       precision:
 *                         type: string
 *                         description: Type de l'avis ou du commentaire
 *                         example: innocuite
 *                       commentaire:
 *                         type: string
 *                         description: Si l'opération est un commentaire, le commentaire en question
 *                         example: Bah c'est bien je trouve, non?
 *                       valeur:
 *                         type: boolean
 *                         description: Si l'opération est un avis, le booléen si c'est favorable ou non
 *                         example: true
 *                       explication:
 *                         type: string
 *                         description: Si l'opération est un avis, la motivation de celui-ci
 *                         example: Je trouve que c'est vraiment pourri, on va pas se mentir.
 *                       unite:
 *                         type: integer
 *                         description: Si l'opération est un avis, code unité au nom de laquelle l'auteur a publié l'avis
 *                         example: 9114
*/
router.get('/projet/:id/historique', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query(`
    SELECT *
        FROM adi.historique
        WHERE id_projet = $1

    UNION ALL

    SELECT
      id,
      id_projet,
      date,
      json_build_object(
        'type', 'commentaire',
        'precision', type,
        'auteur', auteur,
        'commentaire', contenu
      ) as contenu
      FROM adi.commentaires
        WHERE id_projet = $1

    UNION ALL

    SELECT
      id,
      id_projet,
      date,
      json_build_object(
        'type', 'avis',
        'precision', type_avis,
        'valeur', avis,
        'auteur', auteur,
        'explication', explication,
        'unite', code_unite
      ) as contenu
      FROM adi.avis
      WHERE id_projet = $1
        AND avis IS NOT NULL

    ORDER BY date desc`, [
      id
    ]);
  retour(req, res, 200, rows)
})

/*
  CAMPAGNES
*/

/*
  Pour retourner le statut d'une campagne
*/
async function statutCampagne(id) {
  let rows;
  ({ rows } = await db.query(`
    SELECT
      CASE
        WHEN debut > current_timestamp  THEN 'avenir'
        WHEN fin < current_timestamp  THEN 'passee'
        ELSE 'encours'
      END as statut
    FROM adi.campagnes_votes v
      WHERE id = $1
    `, [
      id,
    ]))
  return rows[0].statut;
}

/*
  Pour vérifier si la campagne correspond au statut
*/
async function verifStatutCampagne(id, acceptation, statut) {
  let rows;
  const s = await statutCampagne(id);
  if (acceptation) {
    return (s === statut);
  } else {
    return (s !== statut);
  }
}

/*
  Fonction callback qui permet au middleware express de couper la route
  si l'utilisateur n'a pas le droit.
*/
async function verifStatutCampagneCB(acceptation, statut, req, res, next) {
  const d = await verifStatutCampagne(req.params.id, acceptation, statut);
  if (d) {
    return next();
  } else {
    retour(req, res, 500, "Accès interdit.");
  }
}

/*
  Pour récupérer toutes les campagnes
*/
router.get('/campagnes/:precision?', async (req, res) => {
  const { precision } = req.params;
  let where = '';
  if (precision === 'avecrepertoire') {
    where = 'WHERE rlc.id_repertoire IS NOT NULL'
  }
  if (precision === 'sansrepertoire') {
    where = 'WHERE rlc.id_repertoire IS NULL'
  }
  const { rows } = await db.query(`
    SELECT
      camp.*,
      array_agg(
        json_build_object(
          'id', catcamp.id_categorie,
          'nom', catvot.nom
        )
      ) as categories
    FROM adi.campagnes_votes camp
    JOIN adi.categories_campagne catcamp
      ON catcamp.id_campagne = camp.id
    JOIN adi.categories_votes catvot
      ON catcamp.id_categorie = catvot.id
    LEFT JOIN adi.repertoires_liens_campagnes rlc
      ON rlc.id_campagne = camp.id
    ${where}
    GROUP BY camp.id
    ORDER BY debut DESC
    `)
  retour(req, res, 200, rows);
})

/*
  Pour récupérer toutes les campagnes
*/
router.get('/campagne/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(`
    WITH projets_par_categorie AS (
      SELECT
        part.id_categorie,
        array_agg(
          json_build_object(
            'id', part.id_projet,
            'nom', p.nom
          )
        ) as projets
      FROM adi.campagnes_votes c
      JOIN adi.participation_campagne part
        ON c.id = part.id_campagne
      JOIN public.projets p
        ON p.id = part.id_projet
      WHERE c.id = $1
      GROUP BY c.id, part.id_categorie
    )
    , categories_projet AS (
      SELECT
        cat.id_categorie,
        catvot.nom
      FROM adi.categories_campagne cat
      JOIN adi.categories_votes catvot
        ON cat.id_categorie = catvot.id
      WHERE cat.id_campagne = $1
    )
    , campagne_groupee AS (
      SELECT
        $1 as id_campagne,
        array_agg(
          json_build_object(
            'id',cp.id_categorie,
            'nom', cp.nom,
            'projets', ppc.projets
          )
        ) as categories
      FROM projets_par_categorie ppc
      FULL OUTER JOIN categories_projet cp
        ON ppc.id_categorie = cp.id_categorie
    )
    SELECT
      *,
      CASE
        WHEN c.debut > current_timestamp  THEN 'avenir'
        WHEN c.fin < current_timestamp  THEN 'passee'
        ELSE 'encours'
      END as statut
    FROM campagne_groupee cg
    JOIN adi.campagnes_votes c
      ON c.id = cg.id_campagne
    `, [+id])
  if (rows.length !== 1) {
    retour(req, res, 404, {
      erreur: 'ADI_CAMPAGNES_RECUPERER',
      msg: 'Pas de campagne trouvée',
    });
  } else {
    retour(req, res, 200, rows[0]);
  }
})

/*
  Pour publier les résultats d'une campagne
*/
router.post('/campagne/:id/publierresultats',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  async (req, res) => {
    const {
      id
    } = req.params;
    let rows;
    ({ rows } = await db.query(`
      UPDATE adi.campagnes_votes
        SET
          date_publication_resultats = current_timestamp
        WHERE id = $1
          AND date_publication_resultats IS NULL
      RETURNING date_publication_resultats;
      `, [
        id,
      ]))
    if (rows.length !== 1)  {
      retour(req, res, 404, {
        erreur: 'ADI_PUBLIER_RESULTATS',
        msg: "Erreur de publication de résultat",
      });
    } else {
      retour(req, res, 200, rows[0].date_publication_resultats);
    }
})

/*
  Pour récupérer les résultats d'une campagnes
*/
router.get('/campagne/:id/resultats', async (req, res) => {
  const { id } = req.params;
  let rows;
  let r = [];
  let autorisation = false;
  ({ rows } = await db.query(`
    SELECT
      date_publication_resultats
    FROM
      adi.campagnes_votes
    WHERE id = $1
    `, [+id]))
  autorisation = (rows[0].date_publication_resultats !== null);
  if (!autorisation) {
    autorisation = await droits.verifDroits('adi',
      req.session.unite,
      req.session.nigend,
      'voirResultatsEnCours');
  }
  if (autorisation) {
    ({ rows } = await db.query(`
      WITH resultats AS (
        SELECT
          v.id_projet,
          v.id_categorie,
          count(*) as nb_votes
        FROM adi.votes v
        WHERE id_campagne = $1
        GROUP BY v.id_projet, v.id_categorie
      )
      SELECT
        r.*,
        cat.nom as nom_categorie,
        p.nom as nom_projet
        FROM
          resultats r
        JOIN public.projets p
        ON p.id = r.id_projet
        JOIN adi.categories_votes cat
        ON cat.id = r.id_categorie
        ORDER BY nb_votes DESC
      `, [+id]))
    r = rows;
  }
  retour(req, res, 200, r);
})

/*
  Pour créer une campagne
*/
router.post('/campagne/creer',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  async (req, res) => {
    const {
      titre,
      description,
      dates,
      categories,
    } = req.body
    let rows;
    ({ rows } = await db.query(`
      INSERT INTO adi.campagnes_votes (
        titre,
        description,
        debut,
        fin
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `, [
        titre,
        description,
        dates.start,
        dates.end,
      ]))
    if (rows.length !== 1)  {
      retour(req, res, 500, "Erreur d'intégration de la campagne");
    } else {
      const idCampagne = rows[0].id;
      const values = categories.map((x, i) => {
        return (`($1, $${i+2})`)
      }).join(',');
      ({ rows } = await db.query(`
        INSERT INTO adi.categories_campagne(id_campagne, id_categorie)
        VALUES ${values}
        `, [idCampagne].concat(categories.map((x) => +(x.categorie.id)))));
      ({ rows } = await db.query(`
        SELECT
          camp.*,
          array_agg(
            json_build_object(
              'id', catcamp.id_categorie,
              'nom', catvot.nom
            )
          ) as categories
        FROM adi.campagnes_votes camp
        JOIN adi.categories_campagne catcamp
        ON catcamp.id_campagne = camp.id
        JOIN adi.categories_votes catvot
        ON catcamp.id_categorie = catvot.id
        WHERE camp.id = $1
        GROUP BY camp.id
        `, [idCampagne]));
      retour(req, res, 200, rows[0]);
    }
})

/*
  Pour modifier la description d'une campagne
*/
router.post('/campagne/:id/modifierdescription',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  (req, res, next) => verifStatutCampagneCB(false, 'passee', req, res, next),
  async (req, res) => {
    const {
      description,
    } = req.body
    const { id } = req.params;
    let rows;
    try {
      ({ rows } = await db.query(`
        UPDATE adi.campagnes_votes
        SET
          description = $1
        WHERE
          id = $2
        `, [
          description,
          id,
        ]));
      retour(req, res, 200, 'Description modifiée');
    } catch (e) {
      let erreur = 'ADI_MODIFIER_DESCRIPTION_CAMPAGNE';
      let msg = 'Erreur de projet.';
      retour(req, res, 500, {
        msg,
        erreur,
        detail: e,
      });
    }
})

/*
  Pour modifier les dates d'une campagne
*/
router.post('/campagne/:id/modifdates',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  (req, res, next) => verifStatutCampagneCB(true, 'avenir', req, res, next),
  async (req, res) => {
    const { dates } = req.body;
    const { id } = req.params;
    const { rows } = await db.query(`
      UPDATE adi.campagnes_votes
      SET
        debut = $1,
        fin = $2
      WHERE
        id = $3
      RETURNING *
      `, [
        dates.start,
        dates.end,
        id,
      ])
    if (rows.length !== 1) {
      retour(req, res, 404, {
        erreur: 'ADI_MODIFIER_DATES_CAMPAGNE',
        msg: 'Impossible de modifier les dates.',
      });
    } else {
      retour(req, res, 200, rows[0]);
    }
  }
)

/*
  Pour ajouter des projets à une catégorie
*/
router.post('/campagne/:id/ajouterprojets',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  (req, res, next) => verifStatutCampagneCB(false, 'passee', req, res, next),
  async (req, res) => {
    const {
      projetsAajouter,
      idCategorie,
    } = req.body
    const { id } = req.params;
    let rows;
    const values = projetsAajouter.map((x, i) => {
      return (`($1, $2, $${i+3})`)
    }).join(',');
    try {
      ({ rows } = await db.query(`
        INSERT INTO adi.participation_campagne(id_campagne, id_categorie, id_projet)
        VALUES ${values}
        RETURNING *
        `, [id, idCategorie].concat(projetsAajouter.map((x) => +x))));
      retour(req, res, 200, 'Projets associés');
    } catch (e) {
      let msg = 'Erreur de projet.';
      let erreur = 'ADI_AJOUT_PROJET_CATEGORIE';
      if (e.code === '23505') {
        msg = "Ce projet est déjà dans une catégorie.";
        erreur = "ADI_DEJA_CATEGORIE";
      }
      retour(req, res, 500, {
        msg,
        erreur,
        detail: e,
      });
    }
})

/*
  Pour supprimer un projet d'une catégorie
*/
router.delete('/campagne/:id/projet/:idprojet/supprimer',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  (req, res, next) => verifStatutCampagneCB(true, 'avenir', req, res, next),
  async (req, res) => {
    const { id, idprojet } = req.params;
    let rows;
    try {
      ({ rows } = await db.query(`
        DELETE FROM adi.participation_campagne
        WHERE
          id_campagne = $1
          AND id_projet = $2
        RETURNING *
        `, [
          id,
          idprojet,
        ]));
      retour(req, res, 200, 'Participation supprimée');
    } catch (e) {
      let msg = 'Erreur de suppression.';
      let erreur = 'ADI_SUPPRESSION_PROJET';
      retour(req, res, 500, {
        msg,
        erreur,
        detail: e,
      });
    }
})

/*
  Pour supprimer un projet d'une catégorie
*/
router.put('/campagne/:id/projet/:idprojet/modifiercategorie',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  (req, res, next) => verifStatutCampagneCB(true, 'avenir', req, res, next),
  async (req, res) => {
    const { id, idprojet } = req.params;
    const { idCategorie } = req.body;
    let rows;
    try {
      ({ rows } = await db.query(`
        UPDATE adi.participation_campagne
        SET
          id_categorie = $3
        WHERE
          id_campagne = $1
          AND id_projet = $2
        RETURNING *
        `, [
          id,
          idprojet,
          idCategorie,
        ]));
      retour(req, res, 200, {
        msg: 'Participation mise à jour',
      });
    } catch (e) {
      let erreur = 'ADI_SUPPRESSION_PROJET_CATEGORIE';
      let msg = 'Erreur de suppression.';
      retour(req, res, 500, {
        erreur,
        msg,
        detail: e,
      });
    }
})

/*
  CATÉGORIES
*/

/*
  Pour récupérer toutes les catégories
*/
router.get('/categories', async (req, res) => {
  const { rows } = await db.query(`
    SELECT *
    FROM adi.categories_votes
    ORDER BY nom
    `)
  retour(req, res, 200, rows);
})

/*
  Pour créer une catégorie
*/
router.post('/categorie/creer',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererCampagne'),
  async (req, res) => {
    const {
      nom
    } = req.body
    let rows;
    ({ rows } = await db.query(`
      INSERT INTO adi.categories_votes (
        nom
      )
      VALUES ($1)
      RETURNING id;
      `, [
        nom
      ]))
    if (rows.length !== 1)  {
      retour(req, res, 500, {
        erreur: 'ADI_CREER_CATEGORIE',
        msg: "Erreur d'intégration de la catégorie",
      });
    } else {
      retour(req, res, 200, rows[0]);
    }
})

/*
  VOTES
*/

/*
  Pour récupérer les votes d'une campagne pour un utilisateur
*/
router.get('/campagne/:id/votesperso', async (req, res) => {
  const { id } = req.params;
  ({ rows } = await db.query(`
    SELECT * FROM adi.votes
    WHERE
      votant = $1
      AND id_campagne = $2`,
      [
        req.session.nigend,
        +id,
      ]
  ))
  let votes = {};
  rows.forEach((vote) => {
    if (!Object.keys(votes).map((x) => +x).includes(vote.id_categorie)) {
      votes[vote.id_categorie] = [vote.id_projet];
    } else {
      votes[vote.id_categorie].push(vote.id_projet);
    }
  })
  retour(req, res, 200, votes);
})

/*
  Pour récupérer le nombre total de votes d'une campagne
*/
router.get('/campagne/:id/totalvotes', async (req, res) => {
  const { id } = req.params;
  ({ rows } = await db.query(`
    select count (distinct votant) as nb_votants
    FROM adi.votes
    WHERE id_campagne = $1`,
      [
        +id,
      ]
  ))
  retour(req, res, 200, rows[0].nb_votants);
})

/*
  Pour créer un vote
*/
router.post('/campagne/:id/vote',
  (req, res, next) => verifStatutCampagneCB(false, 'passee', req, res, next),
  async (req, res) => {
  if (req.session.nigend === undefined) {
    retour(req, res, 403, "Vous devez être connecté!");
  } else {
    const {
      votes
    } = req.body
    const { id } = req.params;
    // On vérifie que l'utilisateur n'a pas déjà voté
    ({ rows } = await db.query(`
      SELECT * FROM adi.votes
      WHERE
        votant = $1
        AND id_campagne = $2`,
        [
          req.session.nigend,
          +id,
        ]
    ))
    if (rows.length !== 0)  {
      retour(req, res, 403, "Vous avez déjà voté!");
    } else {
      let values = [];
      let valeurs = [
        req.session.nigend,
        id,
      ]
      let i = 3;
      for (const [key, value] of Object.entries(votes)) {
        valeurs.push(+key);
        const idCat = i;
        value.forEach((item) => {
          values.push(`($1, $2, $${idCat}, $${++i})`);
          valeurs.push(item);
        });
        i += 1;
      }
      let rows;
      ({ rows } = await db.query(`
        INSERT INTO adi.votes (
          votant,
          id_campagne,
          id_categorie,
          id_projet
        )
        VALUES ${values.join(',')} RETURNING *;`, valeurs))
      if (rows.length === 0)  {
        retour(req, res, 500, {
          erreur: 'ADI_VOTE',
          msg: "Erreur de vote",
        });
      } else {
        retour(req, res, 200, votes);
      }
    }
  }
})

/*
  Pour annuler un vote
*/
router.get('/campagne/:id/annulervote',
  (req, res, next) => verifStatutCampagneCB(false, 'passee', req, res, next),
  async (req, res) => {
  const { id } = req.params;
  ({ rows } = await db.query(`
    DELETE FROM adi.votes
    WHERE
      votant = $1
      AND id_campagne = $2`,
      [
        req.session.nigend,
        id,
      ]
  ))
  retour(req, res, 200, 'Votes effacés');
})


/*
  ADP
*/

/*
  Pour récupérer les ADP d'une année
*/
router.get('/adp/projets/annee/:annee', async (req, res) => {
  const { annee } = req.params;
  const { rows } = await db.query(`
    SELECT
      c.*,
      a.nom as nom_atelier,
      cv.nom as nom_categorie,
      p.nom as nom_projet
    FROM adi.candidats_adp c
    JOIN projets p
      ON p.id = c.id_projet
    LEFT JOIN adi.ateliers_adp a
      ON a.id = c.id_atelier
    LEFT JOIN adi.categories_votes cv
      ON cv.id = c.id_categorie
    WHERE annee_adp = $1
    ORDER BY place
    `, [+annee])
  if (rows.length === 0) {
    retour(req, res, 404, {
      erreur: 'ADI_AUCUN_ADP_ANNEE',
      msg: "Pas d'ADP trouvé pour cette année",
    });
  } else {
    retour(req, res, 200, rows);
  }
})

/*
  Pour récupérer tous les projets
*/
router.get('/adp/projets/',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererADP'),
  async (req, res) => {
    const { annee } = req.params;
    const { rows } = await db.query(`
      SELECT
        c.*,
        json_build_object(
          'nom', a.nom,
          'id', a.id
        ) as atelier,
        json_build_object(
          'nom', cv.nom,
          'id', cv.id
        ) as categorie,
        p.nom,
        p.id
      FROM adi.candidats_adp c
      JOIN projets p
        ON p.id = c.id_projet
      LEFT JOIN adi.ateliers_adp a
        ON a.id = c.id_atelier
      LEFT JOIN adi.categories_votes cv
        ON cv.id = c.id_categorie
      ORDER BY place
      `)
    if (rows.length === 0) {
      retour(req, res, 404, {
        erreur: 'ADI_PROJETS_ADP',
        msg: "Pas de projet",
      });
    } else {
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour récupérer tous les ateliers
*/
router.get('/adp/ateliers',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererADP'),
  async (req, res) => {
    const { annee } = req.params;
    const { rows } = await db.query(`
      SELECT *
      FROM adi.ateliers_adp
      ORDER BY nom
      `)
    if (rows.length === 0) {
      retour(req, res, 404, {
        erreur: 'ADI_AUCUN_ATELIER',
        msg: "Pas d'atelier",
      });
    } else {
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour créer un atelier.
*/
router.post('/adp/atelier/creer',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererADP'),
  async (req, res) => {
    const { nom }  = req.body;
    let rows;
    ({ rows } = await db.query(`
      INSERT INTO adi.ateliers_adp (nom)
      VALUES ($1)
      RETURNING *;`, [
        nom
      ])
    )
    retour(req, res, 200, rows[0]);
  }
)

/*
  Pour créer un ADP
*/
router.post('/adp/creer',
  droits.verifDroitsCB.bind(undefined, 'adi', 'gererADP'),
  async (req, res) => {
    const {
      id_projet,
      date_inscription,
      accepte,
      laureat,
      fdr,
      place,
      annee_adp,
      id_atelier,
      id_categorie,
      motif_rejet
    } = req.body
    let rows;
    ({ rows } = await db.query(`
      INSERT INTO adi.candidats_adp(
        id_projet,
        date_inscription,
        accepte,
        laureat,
        fdr,
        place,
        annee_adp,
        id_atelier,
        id_categorie,
        motif_rejet
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      ON CONFLICT (id_projet)
      DO UPDATE
      SET
        id_projet = excluded.id_projet,
        date_inscription = excluded.date_inscription,
        accepte = excluded.accepte,
        laureat = excluded.laureat,
        fdr = excluded.fdr,
        place = excluded.place,
        annee_adp = excluded.annee_adp,
        id_atelier = excluded.id_atelier,
        id_categorie = excluded.id_categorie,
        motif_rejet = excluded.motif_rejet
      RETURNING *`,
      [
        id_projet,
        date_inscription,
        accepte,
        laureat,
        fdr,
        place,
        annee_adp,
        id_atelier,
        id_categorie,
        motif_rejet
      ]))

    if (rows.length !== 1)  {
      retour(req, res, 500, {
        erreur: 'ADI_CREER_ADP',
        msg: "Erreur d'ajout d'ADP",
      });
    } else {
      retour(req, res, 200, rows[0]);
    }
})

/*
  Pour récupérer les informations d'ADP par projet
*/
router.get('/projet/:id/adp', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query(`
    SELECT
      c.*,
      p.presentation,
      p.benefices,
      p.objectifs
    FROM adi.candidats_adp c
    JOIN projets p
      ON c.id_projet = p.id
    WHERE c.id_projet = $1`, [
      id
    ]);
  if (rows.length !== 1)  {
    retour(req, res, 404, {
      erreur: 'ADI_AUCUN_ADP',
      msg: "Pas d'ADP",
    });
  } else {
    retour(req, res, 200, rows[0]);
  }
})

/*
  RÉPERTOIRES
*/

/*
  Pour lister tous les répertoires
*/
router.get('/repertoires', async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      *
    FROM adi.repertoires
    ORDER BY date_creation DESC;`);
  if (rows.length === 0)  {
    retour(req, res, 404, {
      erreur: 'ADI_AUCUN_REPERTOIRE',
      msg: "Pas de répertoire",
    });
  } else {
    retour(req, res, 200, rows);
  }
})

/*
  Pour créer un répertoire
*/
router.post('/repertoires',
  droits.verifDroitsCB.bind(undefined, 'adi', 'creerRepertoire'),
  async (req, res) => {
    const {
      nom,
      campagne,
      resultats,
    } = req.body;
    // on ajoute le répertoire
    ({ rows } = await db.query(`
      INSERT INTO adi.repertoires (
         nom,
         createur
       )
        VALUES ($1, $2)
        RETURNING *;`,
        [
          nom,
          req.session.nigend,
        ]
      ))
    if (rows.length !== 1) {
      retour(req, res, 404, {
        erreur: 'ADI_CREATION_REPERTOIRE',
        msg: "Erreur lors de la création du répertoire",
      });
    } else {
      const idRepertoire = rows[0].id;
      // on ajoute le lien avec la campagne
      ({ rows } = await db.query(`
        INSERT INTO adi.repertoires_liens_campagnes (
           id_repertoire,
           id_campagne
         )
          VALUES ($1, $2)
          RETURNING *;`,
          [
            idRepertoire,
            campagne,
          ]
        )
      );
      // on ajoute les résultats
      ({ rows } = await db.query(`
        INSERT INTO adi.repertoires_resultats (
           id_repertoire,
           id_projet,
           place,
           laureat
         )
          VALUES ${resultats.map((x, i) => {
             return (`($1, $${3*i+2}, $${3*i+3}, $${3*i+4})`)
            }).join(',')}
          RETURNING *;`,
          [idRepertoire].concat(resultats.map((a) => [a.id, a.place, a.laureat]).flat()),
        )
      );
      if (rows.length !== resultats.length)  {
        retour(req, res, 404, {
          erreur: 'ADI_REPERTOIRE_COHERENCE_NOMBRE_PROJETS',
          msg: "Erreur dans la cohérence du nombre des projets du répertoire.",
        });
      } else {
        retour(req, res, 200, {
          idRepertoire,
          msg: 'Répertoire créé',
        });
      }
    }

  }
)

/*
  Pour récupérer un répertoire
*/
router.get('/repertoires/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(`
    SELECT
      r.*,
      rlc.id_campagne
    FROM adi.repertoires r
    LEFT JOIN adi.repertoires_liens_campagnes rlc
        ON r.id = rlc.id_repertoire
    WHERE r.id = $1;`, [
      id,
    ]);
  if (rows.length === 0)  {
    retour(req, res, 404, {
      erreur: 'ADI_REPERTOIRE_INTROUVABLE',
      msg: "Répertoire introuvable",
    });
  } else {
    retour(req, res, 200, rows[0]);
  }
})


/*
  Pour récupérer un classement
*/
router.get('/repertoires/:id/classement', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(`
    SELECT
      r.place,
      r.laureat,
      r.id_projet
    FROM adi.repertoires_resultats r
    WHERE id_repertoire = $1
    ORDER BY r.place ASC;`, [
      id,
    ]);
  if (rows.length === 0)  {
    retour(req, res, 404, {
      erreur: 'ADI_REPERTOIRE_CLASSEMENT_INTROUVABLE',
      msg: "Classement introuvable",
    });
  } else {
    retour(req, res, 200, rows);
  }
})
