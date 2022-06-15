const Router = require('express-promise-router')
const db = require('../db')
const droits = require('./droits')
const { retour } = require('../utils/retour')
const router = new Router()

router.get('/domaine/:rubrique', async (req, res) => {
  const { rubrique } = req.params
  let rows;
  ({ rows } = await db.query(`
    SELECT mc.id, mc.mot, dmc.actif
    FROM motscles_domaines dmc
    LEFT JOIN mots_cles mc
      ON mc.id = dmc.id_mot_cle
    WHERE domaine = $1
    ORDER BY mc.mot
  `, [rubrique]));
  if (rows.length === 0) {
    retour(req, res, 404, 'Aucun mot-clé trouvé')
  } else {
    retour(req, res, 200, rows);
  }
})

/*
  Fonction pour ajouter un mot-clé
*/
router.post('/ajouter/:domaine',
  async (req, res) => {
    if (req.session.nigend === undefined) {
      retour(req, res, 403, {
        msg: "Vous devez être connecté",
      });
    } else if (!['projets','veille','gendindus'].includes(req.params.domaine)) {
      retour(req, res, 403, {
        erreur: 'MOTSCLES_DOMAINE_INCONNU',
        msg: "Domaine inconnu",
      });
    } else {
      const { motcle } = req.body;
      const { domaine } = req.params;
      let rows;
      ({ rows } = await db.query(`
        WITH inserted_motcle AS (
          INSERT INTO public.mots_cles (
            mot
          )
          VALUES ($1)
          ON CONFLICT (mot)
            DO NOTHING
          RETURNING id
        ),
        id_motcle AS (
          SELECT id FROM inserted_motcle
            WHERE EXISTS (SELECT 1 FROM inserted_motcle)
          UNION ALL
          SELECT id FROM public.mots_cles mc
            WHERE mc.mot = $1
        ),
        inserted_domaine AS (
          INSERT INTO motscles_domaines (
            id_mot_cle,
            actif,
            domaine
          )
          SELECT
            id,
            'true',
            $2
          FROM id_motcle
          ON CONFLICT (id_mot_cle, domaine)
            DO NOTHING
          RETURNING *
        )
        SELECT id_mot_cle FROM inserted_domaine
          WHERE EXISTS (SELECT 1 FROM inserted_domaine)
        UNION ALL
        SELECT mcd.id_mot_cle
        FROM public.motscles_domaines mcd
        JOIN id_motcle imc
          ON mcd.id_mot_cle = imc.id
          AND mcd.domaine = $2;`, [
          motcle,
          domaine,
        ])
      )
      retour(req, res, 200, {
        id: rows[0].id_mot_cle,
        mot: motcle,
        type: 'motcle',
      });
    }
  }
)

/*
  Pour rechercher un mot clé
*/
router.get('/recherche/:domaine/:texte',
  async (req, res) => {
    if (!['projets','etudes','veille','gendindus'].includes(req.params.domaine)) {
      retour(req, res, 403, {
        erreur: 'MOTSCLES_DOMAINE_INCONNU',
        msg: "Domaine inconnu",
      });
    } else {
      let rows;
      const { domaine, texte } = req.params;
      ({ rows } = await db.query(`
        SELECT
          mc.id,
          mc.mot,
          'motcle' as type
        FROM public.mots_cles mc
        JOIN public.motscles_domaines d
          ON mc.id = d.id_mot_cle
        WHERE
          mot ILIKE $1
          AND domaine = $2
        ORDER BY mot ASC;`, [
          `%${texte}%`,
          domaine,
        ])
      )
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour rechercher un mot clé par id
*/
router.get('/motcle/:domaine/:id',
  async (req, res) => {
    if (!['projets','etudes','veille','gendindus'].includes(req.params.domaine)) {
      retour(req, res, 403, {
        erreur: 'MOTSCLES_DOMAINE_INCONNU',
        msg: "Domaine inconnu",
      });
    } else {
      let rows;
      const { domaine, id } = req.params;
      ({ rows } = await db.query(`
        SELECT
          mc.mot
        FROM public.mots_cles mc
        JOIN public.motscles_domaines d
          ON mc.id = d.id_mot_cle
        WHERE
          mc.id = $1
          AND domaine = $2
        ORDER BY mot ASC;`, [
          id,
          domaine,
        ])
      )
      if (rows.length === 1) {
        retour(req, res, 200, rows[0].mot);
      } else {
        retour(req, res, 404, {
          msg: "Mot clé introuvable",
        });
      }
    }
  }
)

async function dissocierMotcleCB(domaine, req, res, next) {
  let rows;
  try {
    let table;
    let nomId;
    let id;
    let idMotcle;
    switch (domaine) {
      case 'gendindus': {
        nomId = 'id_contact';
        table = 'gendindus.contacts_liens_motscles';
        id = req.params.id;
        idMotcle = req.body.idMotcle;
        break;
      }
      case 'projets': {
        nomId = 'id_projet';
        table = 'public.projets_liens_motscles';
        id = req.params.id;
        idMotcle = req.body.idMotcle;
        break;
      }
      default: {
        table = '';
      }
    }
    if (table.length === 0) {
      retour(req, res, 400, {
        erreur: 'MOTSCLES_DOMAINE_INCONNU',
        msg: "Domaine inconnu"
      })
    } else {
      ({ rows } = await db.query(`
        DELETE FROM ${table}
        WHERE
          ${nomId} = $1
          AND id_motcle = $2
        RETURNING *;`, [
          id,
          idMotcle,
        ])
      )
      if (rows.length === 1) {
        retour(req, res, 200, {
          motcle: rows[0],
          msg: "Suppression effectuée",
        })
      } else {
        retour(req, res, 500, {
          erreur: 'MOTSCLES_SUPPRESSION',
          msg: "Impossible de dissocier ce mot-clé",
        });
      }
    }
  } catch(e) {
    let msg = "Erreur serveur";
    let erreur = "MOTSCLES_ERREUR_SERVEUR_DISSOCIATION";
    retour(req, res, 500, {
      erreur,
      msg,
      detail: e,
    });
  }
}

async function associerMotsclesCB(domaine, req, res, next) {
  let rows;
  try {
    let table;
    let nomId;
    let id;
    const { motscles } = req.body;
    switch (domaine) {
      case 'gendindus': {
        nomId = 'id_contact';
        table = 'gendindus.contacts_liens_motscles';
        id = req.params.id;
        break;
      }
      case 'projets': {
        nomId = 'id_projet';
        table = 'public.projets_liens_motscles';
        id = req.params.id;
        break;
      }
      default: {
        table = '';
      }
    }
    if (table.length === 0) {
      retour(req, res, 400, {
        erreur: 'MOTSCLES_DOMAINE_INCONNU',
        msg: "Domaine inconnu"
      })
    } else {
      try {
        let values = motscles.map((x, i) => {
          return (`($1, $${i+2})`)
        }).join(',');
        ({ rows } = await db.query(`
          WITH inserted_motscles AS (
            INSERT INTO ${table} (
              ${nomId},
              id_motcle
            )
            VALUES ${values}
            ON CONFLICT DO NOTHING
            RETURNING *
          )
          SELECT
            mc.id,
            mc.mot
          FROM inserted_motscles i
          JOIN public.mots_cles mc
            on mc.id = i.id_motcle;`,
          [id].concat(motscles.map((x) => +(x.id))))
        )

        if (rows.length > 0) {
          retour(req, res, 200, {
            motscles: rows,
            msg: "Mots-clés associés",
          })
        } else {
          retour(req, res, 500, {
            erreur: 'MOTSCLES_ASSOCIATION',
            msg: "Impossible d'associer des mots-clés",
          });
        }
      } catch(e) {
        let msg = "Erreur serveur";
        let erreur = "MOTSCLES_ERREUR_SERVEUR_ASSOCIATION_01";
        retour(req, res, 500, {
          erreur,
          msg,
          detail: e,
        });
      }
    }
  } catch(e) {
    let msg = "Erreur serveur";
    let erreur = "MOTSCLES_ERREUR_SERVEUR_ASSOCIATION_02";
    retour(req, res, 500, {
      erreur,
      msg,
      detail: e,
    });
  }
}

/*
  CI APRÈS DES FONCTIONS À MUTUALISER EN UTILISANT LES FONCTIONS
  PRÉCÉDENTES POUR LE SITE
*/
/*
  Fonction pour ajouter un mot-clé
*/
router.post('/ajouter',
  droits.verifDroitsCB.bind(undefined, 'motscles', 'ajouter'),
  async (req, res) => {
    const { motcle, domaine } = req.body;
    let rows, id;
    // on regarde si le mot existe déjà, et pour qui
    ({ rows } = await db.query(`
      SELECT mc.id, array_agg(dmc.domaine::TEXT) as domaines
      FROM motscles_domaines dmc
      LEFT JOIN mots_cles mc
      ON mc.id = dmc.id_mot_cle
      WHERE mc.mot = $1
      GROUP BY mc.id`, [
        motcle
      ]))
    if (rows.length === 0) {
      // le mot-clé n'existe pas, on l'ajoute
      ({ rows } = await db.query(`
        INSERT INTO mots_cles (mot)
          VALUES ($1)
          RETURNING *;`,
          [motcle]
        ))
    } else if (rows[0].domaines.indexOf(domaine) >=0) {
      retour(req, res, 500, 'Le mot existe déjà');
      return false;
    }
    id = rows[0].id;
    ({ rows } = await db.query(`
      INSERT INTO motscles_domaines (id_mot_cle, actif, domaine)
        VALUES ($1, $2, $3)
        RETURNING *;`,
        [id, true, domaine]
      ))
    retour(req, res, 200, {
      id: id,
      mot: req.body.motcle,
      actif: true,
    });
  }
)

/*
  Pour activer ou désactiver un mot-clé
*/
router.post('/changementStatut',
  droits.verifDroitsCB.bind(undefined, 'motscles', 'desactiver'),
  async (req, res) => {
    const { id, domaine } = req.body;
    let rows;
    // on regarde si le mot existe déjà, et pour qui
    ({ rows } = await db.query(`
      UPDATE motscles_domaines
      SET actif = NOT actif
      WHERE id_mot_cle = $1
      AND domaine = $2
      RETURNING actif`, [
        id,
        domaine,
      ]))
    if (rows.length === 0) {
      retour(req, res, 404, 'Pas de mot clé trouvé...')
    } else {
      retour(req, res, 200, `Mot clé ${rows[0].actif ? '' : 'des'}activé`);
    }
  }
)

module.exports = {
  router,
  dissocierMotcleCB,
  associerMotsclesCB,
}
