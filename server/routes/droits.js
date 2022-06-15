const Router = require('express-promise-router')
const { retour } = require('../utils/retour')
const config = require('config')
const db = require('../db')
const router = new Router()

/*
  Fonction qui permet de vérifier un droit.
  Cette fonction est exportée pour pouvoir
  être utilisée dans un autre module.
*/
async function verifDroits(droit, unite, nigend, action) {
  const { rows } = await db.query(`
    SELECT type, action, autorisation
    FROM droits
    WHERE
      id_droit = $1
      AND action = $2
      AND (
        (type = 'nigend' AND identifiant = $3)
      OR
        (type = 'unite' AND identifiant = $4)
      )`,
    [
      droit,
      action,
      nigend,
      unite,
    ])

    let t = rows.filter((x) => x.type === 'nigend');
    if (t.length === 1) { return t[0].autorisation; }

    t = rows.filter((x) => x.type === 'unite');
    if (t.length === 1) { return t[0].autorisation; }

    return false;
}

/*
  Fonction callback qui permet au middleware express de couper la route
  si l'utilisateur n'a pas le droit.
*/
async function verifDroitsCB(droit, type, req, res, next) {
  const d = await verifDroits(droit, req.session.unite, req.session.nigend, type);
  if (d) {
    return next();
  } else {
    retour(req, res, 403, {
      erreur: "DROIT_ACCES_INTERDIT",
      msg: "Accès interdit.",
    });
  }
}

/*
  Fonction callback qui permet au middleware express de couper la route
  si l'utilisateur n'a pas le droit.
*/
async function verifAdministrationCB(typeId, id, req, res, next) {
  let droit = false;
  // si on n'est l'admin global, on regarde si on a le droit d'administrer
  if (req.session.nigend === config.get('app.adminGlobal')) {
    return next();
  } else if (!(['id_droit', 'id'].includes(typeId))) {
    retour(req, res, 400, {
      erreur: "DROIT_VERIF_ADMINISTRATION_TYPE_ID_INCONNU",
      msg: "Type d'identifiant inconnu",
    });
  } else {
    // on regarde de quel droit il s'agit
    let typeDroit = '';
    if (typeId === 'id_droit') {
      typeDroit = id;
    } else {
      ({ rows } = await db.query(`
        SELECT id_droit FROM public.droits
          WHERE id = $1;`,
          [id]
        ))
      if (rows.length === 1) {
        typeDroit = rows[0].id_droit;
      }
    }
    if (typeDroit.length > 0) {
      droit = await verifDroits(typeDroit, req.session.unite, req.session.nigend, 'administrerDroits');
      if (droit) {
        return next();
      } else {
        retour(req, res, 403, {
          erreur: "DROIT_ACCES_INTERDIT",
          msg: "Accès interdit.",
        });
      }
    } else {
      retour(req, res, 400, {
        erreur: "DROIT_VERIFICATION_ADMINISTRATION",
        msg: "Erreur de vérification de droit d'administration",
      });
    }
  }
}

/*
  Chercher un droit par identifiant
*/
router.get('/recap/:id/:autorise?', async (req, res) => {
  const { id, autorise } = req.params;
  const { rows } = await db.query(`
    SELECT id, type, identifiant, action, autorisation, precision
    FROM droits
    WHERE id_droit = $1
      ${autorise === 'autorisation' ? ' AND autorisation ' : ''}`,
    [
      id,
    ])
  if (rows.length === 0) {
    retour(req, res, 404, {
      msg: 'Pas de droit',
    });
  } else {
    retour(req, res, 200, rows)
  }
})

/*
  Savoir si la personne est administrateur
*/
router.get('/administration/:id', async (req, res) => {
  const droit = await verifDroits(
    req.params.id,
    req.session.unite,
    req.session.nigend,
    'administrerDroits');
  retour(req, res, 200, (req.session.nigend === config.get('app.adminGlobal')) || droit);
})

/*
  Ajouter un droit
*/
router.post('/',
  (req, res, next) => verifAdministrationCB('id_droit', req.body.id_droit, req, res, next),
  async (req, res) => {
    const { id_droit, type, identifiant, action, autorisation } = req.body;
    let rows;
    ({ rows } = await db.query(`
      INSERT INTO droits (type, identifiant, id_droit, action, autorisation)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`,
        [type, identifiant, id_droit, action, autorisation]
      ))
    retour(req, res, 200, rows[0]);
  }
)

/*
  Supprimer un droit
*/
router.delete('/supprimer',
  (req, res, next) => verifAdministrationCB('id', req.body.id, req, res, next),
  async (req, res) => {
    let rows;
    ({ rows } = await db.query(`
      DELETE FROM droits
        WHERE id = $1
        RETURNING *;`,
        [req.body.id]
      ))
    if (rows.length === 1) {
      retour(req, res, 200, {
        msg: 'Droit supprimé',
      });
    } else {
      retour(req, res, 403, {
        erreur: "DROIT_SUPPRESSION",
        msg: "Erreur de suppression de droit.",
      });
    }
  }
)

router.get('/verifdroit/:type/:droit', async(req, res) => {
  const droit = await verifDroits(
    req.params.type,
    req.session.unite,
    req.session.nigend,
    req.params.droit);
  retour(req, res, 200, droit)
})

router.get('/precision/:droit/:action', async(req, res) => {
  const { droit, action } = req.params;
  if (req.session.nigend === undefined) {
    retour(req, res, 403, {
      erreur: "UTILISATEUR_NON_CONNECTE",
      msg: "Vous devez être connecté.",
    })
  } else {
    let rows;
    ({ rows } = await db.query(`
      SELECT type, autorisation, precision
      FROM droits
      WHERE
        id_droit = $1
        AND action = $2
        AND (
          (type = 'nigend' AND identifiant = $3)
        OR
          (type = 'unite' AND identifiant = $4)
        )`,
        [
          droit,
          action,
          req.session.nigend,
          req.session.unite,
        ]
      ))
    retour(req, res, 200, {
      precisions: rows,
    })
  }
})

module.exports = {
  router,
  verifDroits,
  verifDroitsCB,
}
