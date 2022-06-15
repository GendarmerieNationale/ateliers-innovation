const Router = require('express-promise-router')
const db = require('../db')
const { retour } = require('../utils/retour')
const motscles = require('./motscles');
const droits = require('./droits')
const omnibus = require('./omnibus')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const router = new Router();

/*
  Pour vérifier que l'utilisateur est bien le chef
*/
async function verifChefProjet(id, nigend) {
  ({ rows } = await db.query(`
    SELECT *
      FROM role_dans_projet rdp
    WHERE id_role = 1
      AND id_projet = $1
      AND personne = $2
      AND date_fin IS NULL
    `, [
      id,
      nigend,
    ]))
  return (rows.length === 1)
}

async function verifChef(req, res, next) {
  let rows;
  const {
    id
  } = req.params;
  const chef = await verifChefProjet(id, req.session.nigend);
  if (chef) {
    return next();
  } else {
    retour(req, res, 403, {
      erreur: 'PAS_CHEF_PROJET',
      msg: "Vous n'êtes pas le chef du projet."
    });
  }
}

/*
  VISIBILITÉ
*/

async function recupererVisibiliteProjet(id) {
  ({ rows } = await db.query(`
    SELECT visibilite
    FROM public.projets
    WHERE id = $1;
    `, [
      id,
    ])
  );
  return rows[0].visibilite;
}

/*
  Fonction pour vérifier la visibilité de la personne
*/
async function verifVisibilite(req, res, next) {
  let rows;
  let visibilite = 'AUCUNE';
  const { id } = req.params;
  // on vérifie si la personne es membre du projet
  ({ rows } = await db.query(`
    SELECT *
      FROM role_dans_projet rdp
    WHERE
      id_projet = $1
      AND personne = $2
      AND date_fin IS NULL
    `, [
      id,
      req.session.nigend,
    ]))
  if (rows.length === 1) {
    visibilite = 'TOTALE';
  } else {
    // la personne n'est pas membre, on regarde les droits de visibilité
    // on récupère la visibilité du projet
    const visibiliteProjet = await recupererVisibiliteProjet(req.params.id);
    if (visibiliteProjet === 'PUBLIC') {
      visibilite = 'TOTALE';
    } else if ((visibiliteProjet === 'CONNECTE') && (req.session.nigend !== undefined)) {
      visibilite = 'TOTALE';
    } else {
      // si le projet n'est pas public, on regarde si l'utilisateur a accès
      ({ rows } = await db.query(`
        SELECT *
        FROM projets_visibilite
        WHERE
          id_projet = $1
          AND (
            (
              type_visibilite = 'nigend'
              AND identifiant = $2
            )
            OR (
              type_visibilite = 'unite'
              AND identifiant = $3
            )
          )
          AND (
            precision = 'ACCEPTE'
            OR precision = 'AJOUTE'
          );
        `, [
          id,
          req.session.nigend,
          req.session.unite,
        ])
      )
    }
    if (rows.length === 1) {
      visibilite = 'TOTALE';
    } else if (visibiliteProjet === 'SEMI-PRIVE') {
      visibilite =  'PARTIELLE';
    }
  }

  // on traite selon que l'utilisateur a le droit ou non
  if (visibilite === 'AUCUNE') {
    retour(req, res, 403, {
      erreur: 'ACCES_PROJET_INTERDIT',
      msg: "Vous n'avez pas accès au projet."
    });
  } else {
    req.visibiliteProjet = visibilite;
    return next();
  }
}

/*
  Pour modifier la visibilité d'un projet
*/
async function modifierVisibiliteProjet(id, visibilite) {
  const { rows } = await db.query(`
    UPDATE public.projets
    SET
      visibilite = $1
    WHERE
      id = $2
    RETURNING *
  `, [
    visibilite,
    id,
  ])
  return rows
}

async function verifFPPI(req, res, next) {
  const { rows } = await db.query(`
    SELECT
      eb.statut
    FROM fppi.elements_basiques eb
    WHERE eb.id_projet = $1;`, [ req.params.id ]);
  if (rows[0]?.statut === 'INITIEE') {
    retour(req, res, 403, {
      erreur: 'PROJET_FPPI_EN_COURS',
      msg: 'FPPI initiée, impossible de modifier la visibilité.',
    })
  } else {
    return next();
  }
}

router.put('/projet/:id/visibilite',
  verifChef,
  verifFPPI,
  async (req, res) => {
    const { id } = req.params
    const { visibilite } = req.body;
    if (!['PUBLIC','CONNECTE','SEMI-PRIVE','PRIVE'].includes(visibilite)) {
      retour(req, res, 400, {
        erreur: 'ERREUR_TYPE_VISIBILITE',
        msg: 'Erreur de type de visibiilté',
      })
    } else {
      const visibiliteProjet = await modifierVisibiliteProjet(id, visibilite);
      if (visibiliteProjet.length === 0) {
        retour(req, res, 500, {
          erreur: 'ERREUR_MODIFICATION_VISIBILITE',
          msg: 'Erreur de modification de visibilité',
        })
      } else {
        retour(req, res, 200, {
          msg: 'Visibilité modifiée',
        });
      }
    }
  }
)

/*
  Pour récupérer l'ensemble des visibilités
*/
router.get('/projet/:id/visibilite/liste',
  verifChef,
  async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query(`
      SELECT
        type_visibilite,
        identifiant,
        precision
      FROM projets_visibilite pv
      WHERE pv.id_projet = $1
    `, [
      id,
    ])
    retour(req, res, 200, rows);
  }
)

/*
  Pour récupérer ma visibilité
*/
router.get('/projet/:id/mavisibilite',
  async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query(`
      SELECT
        precision
      FROM projets_visibilite pv
      WHERE
        pv.id_projet = $1
        AND type_visibilite = 'nigend'
        AND identifiant = $2
    `, [
      id,
      req.session.nigend
    ])
    if (rows.length === 1) {
      retour(req, res, 200, rows[0].precision);
    } else {
      retour(req, res, 200, 'NEANT');
    }
  }
)

/*
  Pour ajouter une visibilité
*/
router.post('/projet/:id/visibilite',
  verifChef,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        type,
        identifiant,
      } = req.body;
      const { rows } = await db.query(`
        INSERT INTO projets_visibilite (
          id_projet,
          type_visibilite,
          identifiant,
          precision
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        id,
        type,
        identifiant,
        'AJOUTE',
      ])
      if (rows.length === 1) {
        retour(req, res, 200, {
          msg: "Visibilité ajoutée",
          visibilite: rows[0],
        });
      } else {
        retour(req, res, 500, {
          msg: 'ERREUR_AJOUT_VISIBILITE',
          erreur: "Erreur d'ajout de visibilité.",
        });
      }
    } catch (e) {
      let msg = "Erreur d'ajout de visibilité.";
      let erreur = "ERREUR_AJOUT_VISIBILITE";
      if (e.code === '23505') {
        msg = "Visibilité déjà existante.";
        erreur = "VISIBILITE_DEJA_EXISTANTE";
      }
      retour(req, res, 500, {
        msg,
        erreur,
        detail: e,
      });
    }
  }
)

/*
  Pour demander une visibilité
*/
router.post('/projet/:id/visibilite/demander',
  async (req, res) => {
    const { id } = req.params;
    const {
      type,
    } = req.body;
    const { rows } = await db.query(`
      INSERT INTO projets_visibilite (
        id_projet,
        type_visibilite,
        identifiant,
        precision
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      id,
      'nigend',
      req.session.nigend,
      'DEMANDE',
    ])
    if (rows.length === 1) {
      retour(req, res, 200, {
        msg: "Demande déposée",
        visibilite: rows[0].precision,
      });
    } else {
      retour(req, res, 500, {
        msg: 'ERREUR_DEMANDE_VISIBILITE',
        erreur: "Erreur de demande de visibilité.",
      });
    }
  }
)

/*
  Pour supprimer une visibilité
*/
router.delete('/projet/:id/visibilite',
  verifChef,
  async (req, res) => {
    const { id } = req.params;
    const {
      type,
      identifiant,
    } = req.body;
    const { rows } = await db.query(`
      DELETE FROM projets_visibilite
      WHERE
        id_projet = $1
        AND type_entite = $2
        AND id_entite = $3
        AND (
          precision = 'ACCEPTE'
          OR precision = 'AJOUTE'
        )
        RETURNING *
    `, [
      id,
      type,
      identifiant,
    ])
    if (rows.length === 1) {
      retour(req, res, 200, {
        msg: 'Visibilité supprimée',
      });
    } else {
      retour(req, res, 500, {
        msg: 'ERREUR_SUPPRESSION_VISIBILITE',
        erreur: "Erreur de suppression de visibilité.",
      });
    }
  }
)

/*
  Pour traiter une visibilité
*/
router.put('/projet/:id/visibilite/traiter',
  verifChef,
  async (req, res) => {
    const { id } = req.params;
    const {
      type,
      identifiant,
      traitement,
    } = req.body;
    if (!['ACCEPTE','REFUSE','REVOQUE'].includes(traitement)) {
      retour(req, res, 400, {
        erreur: 'ERREUR_TYPE_ACCEPTATION_VISIBILITE',
        msg: "Erreur de type d'acceptation de visibiilté",
      })
    } else {
      const { rows } = await db.query(`
        UPDATE projets_visibilite
        SET
          precision = $4,
          date_traitement = now()
        WHERE
          id_projet = $1
          AND type_visibilite = $2
          AND identifiant = $3
        RETURNING *;
      `, [
        id,
        type,
        identifiant,
        traitement,
      ])
      if (rows.length === 1) {
        retour(req, res, 200, {
          msg: "Demande traitée",
          visibilite: rows[0],
        });
      } else {
        retour(req, res, 500, {
          msg: "Erreur de traitement de la demande de visibilité",
          erreur: 'TRAITEMENT_DEMANDE_VISIBILITE',
        });
      }
    }
  }
)

/*
  PROJETS
*/

/*
  Pour créer un projet.
*/
router.post('/creer', async (req, res) => {
  if (req.session.nigend === undefined) {
    retour(req, res, 403, "Vous devez être connecté pour créer un projet.");
  } else {
    const { nom, presentation }  = req.body;
    const nigend = req.session.nigend;
    let rows;
    ({ rows } = await db.query(`
      INSERT INTO projets (nom, presentation)
        VALUES ($1, $2)
        RETURNING id, nom;`, [
          nom,
          presentation,
        ]))
    const projet = rows[0];
    ({ rows } = await db.query(`
      INSERT INTO role_dans_projet (
        personne,
        unite,
        id_role,
        id_projet
      )
      VALUES ($1, $2, $3, $4);`, [
        nigend,
        req.session.unite,
        1,
        projet.id
      ]))
    retour(req, res, 200, projet);
  }
})

/*
  Pour récupérer la liste de mes projets
*/
router.get('/mesprojets/:precision', async (req, res) => {
  const { precision } = req.params;
  const { rows } = await db.query(`
    SELECT p.id, p.nom
    ${ precision === 'tous' ? ', rp.nom as nom_role' : ' '}
    FROM projets p
    JOIN role_dans_projet rdp
    ON p.id = rdp.id_projet
    ${ precision === 'tous'
      ? ` JOIN roles_projet rp
        ON rdp.id_role = rp.id ` : ' '}
    WHERE rdp.personne = $1
      ${ precision === 'chef' ? ' AND rdp.id_role = 1 ' : ' '}
      AND rdp.date_fin IS NULL
    ORDER BY p.nom`, [
      req.session.nigend
    ]);
  retour(req, res, 200, rows)
})

/*
  Pour récupérer la liste des projets d'un membre
*/
router.get('/parnigend/:nigend/:precision', async (req, res) => {
  const { nigend, precision } = req.params;
  const { rows } = await db.query(`
    SELECT p.id, p.nom
    ${ precision === 'tous' ? ', rp.nom as nom_role' : ' '}
    FROM projets p
    JOIN role_dans_projet rdp
    ON p.id = rdp.id_projet
    ${ precision === 'tous'
      ? ` JOIN roles_projet rp
        ON rdp.id_role = rp.id ` : ' '}
    WHERE rdp.personne = $1
      ${ precision === 'chef' ? ' AND rdp.id_role = 1 ' : ' '}
      AND rdp.date_fin IS NULL
    ORDER BY p.nom`, [
      nigend,
    ]);
  retour(req, res, 200, rows)
})

/*
  Pour rechercher un projet par nom
*/
router.get('/recherche/nom/:nom', async (req, res) => {
  const { nom } = req.params
  const { rows } = await db.query(`
    SELECT
      id,
      nom,
      'projet' as type
    FROM projets
    WHERE nom ILIKE $1
    ORDER BY nom ASC`, [
      `%${nom}%`
    ]);
  retour(req, res, 200, rows)
})

/*
  Pour avoir un aperçu d'actualité
*/
router.get('/apercu/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query(`
    SELECT
      p.nom as nom,
      p.presentation as apercu
    FROM projets p
    where p.id = $1
  `, [id])
  if (rows.length === 0) {
    retour(req, res, 404, 'Projet introuvable.')
  } else {
    retour(req, res, 200, rows[0]);
  }
})

async function recupererNomProjet(id) {
  const { rows } = await db.query(`
    SELECT nom
    FROM public.projets
    WHERE id = $1;`, [
      id,
    ]);
  if (rows.length === 1) {
    return rows[0].nom;
  }
  return false;
}
/*
  Pour récupérer les détails d'un projet et le rôle de celui qui le demande
*/
router.get('/projet/:id',
  verifVisibilite,
  async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query(`
      WITH mes_roles as (
        SELECT
          p.id,
          array_agg(
              json_build_object(
                'id', rdp.id,
                'id_role', r.id,
                'nom',  CASE
                        WHEN r.id IS NULL THEN rdp.precision_autre
                        ELSE r.nom
                        END
                )
          ) FILTER (
            WHERE
              r.id IS NOT NULL
              OR rdp.precision_autre IS NOT NULL
            ) as roles
        FROM projets p
        LEFT JOIN role_dans_projet rdp
          ON rdp.id_projet = p.id
          AND rdp.date_fin IS NULL
          AND rdp.personne = $2
        LEFT JOIN roles_projet r
          ON rdp.id_role = r.id
        WHERE p.id = $1
        GROUP BY p.id
      )
      SELECT
        p.*,
        mr.roles as mesroles,
        CASE
          WHEN cadp.id_projet IS NULL THEN false
          ELSE true
        END as adp
      FROM projets p
      JOIN mes_roles mr
        ON mr.id = p.id
      LEFT JOIN adi.candidats_adp cadp
        ON cadp.id_projet = p.id
      WHERE p.id = $1
    `, [
      id,
      req.session.nigend,
    ])
    if (rows.length === 0) {
      retour(req, res, 404, 'Projet introuvable.')
    } else {
      const projet = rows[0];
      projet.mavisibilite = req.visibiliteProjet;
      retour(req, res, 200, projet);
    }
  }
)

/*
  Pour modifier un champ d'un fichier
*/
router.put('/projet/:id/modifierchamp',
  verifChef,
  async (req, res) => {
    const { champ, valeur } = req.body;
    const { id } = req.params;
    if (![
      'presentation',
      'nom',
      'objectifs',
      'benefices',
      'communication',
      'budget',
      'origine',
      'presentation'
    ].includes(champ)) {
      retour(req, res, 400, {
        erreur: 'MAUVAIS_TYPE_CHAMP_MODIFICATION_PROJET',
        msg: 'Mauvais type de champ lors de la modification du projet.',
      })
    } else {
      ({ rows } = await db.query(`
        UPDATE projets
        SET
          ${champ} = $1
        WHERE id = $2
        RETURNING *
        ;`, [
          valeur,
          id,
        ]
        )
      )
      if (rows.length === 0) {
        retour(req, res, 500, {
          erreur: 'ERREUR_MODIFICATION_CHAMP_PROJET',
          msg: "Erreur de modification",
        });
      } else {
        retour(req, res, 200, rows[0]);
      }
    }
  }
)

/*
  Pour récupérer la présentation d'un projet
*/
router.get('/projet/:id/presentation', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query(`
    SELECT
      presentation
    FROM projets p
    WHERE p.id = $1
  `, [
    id,
  ])
  if (rows.length === 0) {
    retour(req, res, 404, 'Projet introuvable.')
  } else {
    retour(req, res, 200, rows[0].presentation);
  }
})

/*
  PARTENARIATS
*/

/*
  Pour récupérer les partenariats d'un projet
*/
async function recupererPartenariatsProjet(id) {
  const { rows } = await db.query(`
    SELECT
      *
    FROM projets_liens_entites ple
    WHERE ple.id_projet = $1
  `, [
    id,
  ])
  return rows;
}

router.get('/projet/:id/partenariats',
  verifVisibilite,
  async (req, res) => {
    if (req.visibiliteProjet === 'TOTALE') {
      const { id } = req.params
      const partenariats = await recupererPartenariatsProjet(id);
      retour(req, res, 200, partenariats);
    } else {
      retour(req, res, 403, {
        erreur: 'ACCES_PARTENARIAT_INTERDIT',
        msg: "Vous n'avez pas accès aux partenariats de ce projet."
      });
    }
  }
)

/*
  Pour ajouter un partenariat à un projet
*/
router.post('/projet/:id/partenariats/ajouter',
  verifChef,
  async (req, res) => {
    const { id } = req.params
    const {
      entite,
      description,
      type_partenariat,
      statut,
    } = req.body;
    try {
      const { rows } = await db.query(`
        INSERT INTO projets_liens_entites
          (
            id_projet,
            id_entite,
            type_entite,
            type_partenariat,
            description,
            statut
          )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        id,
        entite.id,
        entite.type,
        type_partenariat,
        description,
        statut,
      ])
      if (rows.length === 0) {
        retour(req, res, 500, {
          erreur: 'ERREUR_SERVEUR_1',
          msg: "Erreur serveur lors de l'ajout du partenariat"
        })
      } else {
        retour(req, res, 200, {
          partenariat: rows[0],
          msg: 'Partenariat ajouté',
        });
      }
    } catch(e) {
      let msg = "Erreur serveur lors de l'ajout du partenariat";
      let erreur = 'ERREUR_SERVEUR_2';
      if (e.code === '23505') {
        msg = 'Partenariat déjà existant';
        erreur = 'PARTENARIAT_DEJA_EXISTANT';
      }
      retour(req, res, 500, {
        erreur,
        msg,
        details: e,
      })
    }
  }
)

/*
  Pour supprimer un partenariat d'un projet
*/
router.delete('/projet/:id/partenariats/:idPartenariat',
  verifChef,
  async (req, res) => {
    const { id, idPartenariat } = req.params;
    const { rows } = await db.query(`
      DELETE FROM projets_liens_entites
      WHERE
        id = $1
        AND id_projet = $2
      RETURNING *
    `, [
      idPartenariat,
      id,
    ])
    if (rows.length === 0) {
      retour(req, res, 500, {
        erreur: 'ERREUR_SUPPRESSION_PARTENARIAT',
        msg: 'Erreur de suppression de partenariat'
      })
    } else {
      retour(req, res, 200, {
        msg: 'Partenariat supprimé',
      });
    }
  }
)

/*
  Pour modifier le partenariat d'un projet
*/
router.put('/projet/:id/partenariats/:idPartenariat',
  verifChef,
  async (req, res) => {
    const { id, idPartenariat } = req.params
    const { description } = req.body;
    const { rows } = await db.query(`
      UPDATE projets_liens_entites
      SET
        description = $2
      WHERE
        id = $1
        AND id_projet = $3
      RETURNING *
    `, [
      idPartenariat,
      description,
      id,
    ])
    if (rows.length === 0) {
      retour(req, res, 500, {
        erreur: 'ERREUR_MODIFICATION_PARTENARIAT',
        msg: 'Erreur de modification de partenariat'
      })
    } else {
      retour(req, res, 200, {
        msg: 'Partenariat modifié',
      });
    }
  }
)

/*
  MOTS-CLÉS
*/

router.post('/projet/:id/motscles/associer',
  verifChef,
  motscles.associerMotsclesCB.bind(undefined, 'projets')
)

router.delete('/projet/:id/motscles/dissocier',
  verifChef,
  motscles.dissocierMotcleCB.bind(undefined, 'projets')
)

router.get('/projet/:id/motscles', async (req, res) => {
  const { id } = req.params;

  ({ rows } = await db.query(`
    SELECT
      mc.id,
      mc.mot
    FROM public.projets_liens_motscles plm
    JOIN public.mots_cles mc
      on mc.id = plm.id_motcle
    WHERE plm.id_projet = $1
    `, [
      id
    ])
  )

  retour(req, res, 200, {
    motscles: rows,
  });
})

/*
  OMNIBUS
*/

// Pour récupérer l'ensemble des id de projet Omnibus d'un projet
router.get('/projet/:id/omnibus',
  verifVisibilite,
  async (req, res) => {
    if (req.visibiliteProjet === 'TOTALE') {
      const { id } = req.params;

      // on cherche les identifiants de projet sur omnibus
      ({ rows } = await db.query(`
        SELECT *
        FROM public.projets_liens_omnibus plo
        WHERE plo.id_projet = $1
        `, [
          id
        ])
      )
      let projets = rows.map((x) => ({
        id_omnibus: x.id_omnibus,
        type: x.type,
        url: `https://omnibus-pic.gendarmerie.fr/api/v4/projects/${x.id_omnibus}`,
      }))
      // on cherche les informations pour chaque identifiant de projet d'Omnibus
      if (process.env.NODE_ENV === "development") {
        projets = await omnibus.chercherFichiersSTL(projets);
        retour(req, res, 200, projets.map((p) => ({
          id_omnibus: p.id_omnibus,
          type: p.type,
          nom: `NOM ${p.id_omnibus}`,
          description: `DESCRIPTION ${p.id_omnibus}`,
          web_url: `URL ${p.id_omnibus}`,
          fichiers: p.fichiers,
          namespace: {
            id: 1,
            name: `Namespace du projet ${id} en dev`,
          },
        })));
      } else {
        /*
          En production
        */
        if (process.env.NODE_ENV === "production") {
          Promise.all(projets.map(projet =>
            fetch(projet.url)
              .then(res => res.json())
              .then(t => {
                projet.nom = t.name;
                projet.description = t.description;
                projet.web_url = t.web_url;
                projet.namespace = t.namespace;
              })
              .catch((e) => {
                projet.erreur = 'Projet introuvable'
              })
            )
          )
          .then(async () => {
            projets = await omnibus.chercherFichiersSTL(projets);
            retour(req, res, 200, projets);
          })
        }
      }
    } else {
      retour(req, res, 403, {
        erreur: 'ACCES_OMNIBUS_INTERDIT',
        msg: "Vous n'avez pas accès aux projets Omnibus de ce projet."
      });
    }
  }
)

// Pour ajouter un projet Omnibus au proje
router.post('/projet/:id/omnibus',
  verifChef,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { id: idOmnibus, type } = req.body;

      // on cherche les identifiants de projet sur omnibus
      ({ rows } = await db.query(`
        INSERT INTO public.projets_liens_omnibus (
          id_projet, id_omnibus, type
        )
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [
          id,
          idOmnibus,
          type,
        ])
      )
      let p = [];
      if (type === 'gendfablab') {
        p = [{
          id_omnibus: idOmnibus,
          url: `https://omnibus-pic.gendarmerie.fr/api/v4/projects/${idOmnibus}`,
        }];
        p = await omnibus.chercherFichiersSTL(p);
      }
      if (rows.length === 1) {
        retour(req, res, 200, {
          msg: 'Projet Omnibus ajouté',
          fichiers: p[0]?.fichiers,
        });
      } else {
        retour(req, res, 500, {
          erreur: 'ERREUR_AJOUT_OMNIBUS',
          msg: "Erreur d'ajout de projet Omnibus.",
        });
      }
    } catch(e) {
      let msg = "Erreur lors du traitement de la requête de l'ajout.";
      let erreur = "ERREUR_AJOUT_OMNIBUS_REQUETE";
      if (e.code === '23505') {
        msg = "Projet déjà ajouté.";
        erreur = "OMNIBUS_DEJA_AJOUTE";
      }
      retour(req, res, 500, {
        msg,
        erreur,
        detail: e,
      });
    }
  }
)

// Pour supprimer un projet Omnibus du projet
router.delete('/projet/:id/omnibus',
  verifChef,
  async (req, res) => {
  const { id } = req.params;
  const { idOmnibus } = req.body;

  ({ rows } = await db.query(`
    DELETE FROM public.projets_liens_omnibus
      WHERE
        id_projet = $1
        AND id_omnibus = $2
      RETURNING *;
    ;`,
      [
        id,
        idOmnibus,
      ]
    ))
  if (rows.length === 1) {
    retour(req, res, 200, {
      msg: 'Projet Omnibus supprimé',
    });
  } else {
    retour(req, res, 500, {
      msg: 'ERREUR_SUPPRESSION_OMNIBUS',
      erreur: "Erreur de suppression de projet Omnibus.",
    });
  }
})

/*
  RÔLES
*/

/*
  Pour récupérer la liste des rôles
*/
router.get('/roles', async (req, res) => {
  const { rows } = await db.query(`
    SELECT *
    FROM roles_projet
    WHERE actif
    ORDER BY nom`);
  retour(req, res, 200, rows)
})

/*
  Pour avoir tous les rôles, y compris les inactifs
*/
router.get('/roles/tous',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererRoles'),
    async (req, res) => {
    let rows;
    ({ rows } = await db.query(`
      SELECT *
      FROM roles_projet
      ORDER BY nom
    `));
    if (rows.length === 0) {
      retour(req, res, 404, 'Aucun rôle trouvé')
    } else {
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour activer ou désactiver un rôle
*/
router.post('/role/changementStatut',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererRoles'),
  async (req, res) => {
    const { id } = req.body;
    let rows;
    ({ rows } = await db.query(`
      UPDATE roles_projet
      SET actif = NOT actif
      WHERE id = $1
      AND id != 1
      RETURNING actif`, [
        id,
      ]))
    if (rows.length === 0) {
      retour(req, res, 404, 'Pas de rôle trouvé...')
    } else {
      retour(req, res, 200, `Rôle ${rows[0].actif ? '' : 'des'}activé`);
    }
  }
)

/*
  Pour ajouter un rôle
*/
router.post('/role/ajouter',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererRoles'),
  async (req, res) => {
    const { role } = req.body;
    let rows;
    // on regarde si le rôle existe déjà, et pour qui
    ({ rows } = await db.query(`
      SELECT *
      FROM roles_projet
      WHERE nom = $1`, [role]))
    if (rows.length === 0) {
      // le role n'existe pas, on l'ajoute
      ({ rows } = await db.query(`
        INSERT INTO roles_projet (nom, actif)
          VALUES ($1, true)
          RETURNING *;`,
          [role]
        ))
    } else {
      retour(req, res, 500, 'Le rôle existe déjà');
      return false;
    }
    retour(req, res, 200, {
      msg: 'Rôle ajouté',
      role: rows[0],
    });
  }
)

/*
  Pour avoir tous les rôles "autres"
*/
router.get('/roles/autres',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererRoles'),
    async (req, res) => {
    let rows;
    ({ rows } = await db.query(`
      SELECT precision_autre as nom
      FROM role_dans_projet
      WHERE
        precision_autre IS NOT NULL
        AND id_role IS NULL
      ORDER BY precision_autre
    `));
    if (rows.length === 0) {
      retour(req, res, 404, 'Aucun rôle trouvé')
    } else {
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour changer les rôles "autres"
*/
router.post('/roles/autres/changer',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererRoles'),
    async (req, res) => {
    let rows;
    const rolesAutres = req.body;
    Object.keys(rolesAutres).forEach(async (role) => {
      if (rolesAutres[role] !== 1) {
        ({ rows } = await db.query(`
          UPDATE role_dans_projet
          SET id_role = $1
          WHERE precision_autre = $2
        `, [
          rolesAutres[role],
          role,
        ]));
      }
    });
    retour(req, res, 200, 'Changements effectués');
  }
)


/*
  OBJECTIFS
*/

/*
  Pour récupérer les objectifs d'un projet
*/
async function recupererObjectifsProjet(id) {
  const { rows } = await db.query(`
    SELECT o.*, tobj.nom
    FROM projets_objectifs o
    LEFT JOIN projets_types_objectifs tobj
      ON o.id_objectif = tobj.id
    WHERE id_projet =  $1`, [ id ]);
  return rows;
}

/*
  Pour récupérer la liste des objectifs d'un projet
*/
router.get('/:id/objectifs',
  verifVisibilite,
  async (req, res) => {
    const { id } = req.params;
    const objectifs = await recupererObjectifsProjet(id);
    retour(req, res, 200, objectifs)
  }
)

/*
  Fonction pour récupérer les types d'objectifs
*/
async function recupererTypesObjectifs() {
  const { rows } = await db.query(`
    SELECT *
    FROM projets_types_objectifs
    WHERE actif
    ORDER BY nom`);
  return rows;
}

/*
  Pour récupérer la liste des objectifs
*/
router.get('/objectifs', async (req, res) => {
  const typesObjectifs = await recupererTypesObjectifs();
  retour(req, res, 200, typesObjectifs)
})

/*
  Pour avoir tous les objectifs, y compris les inactifs
*/
router.get('/objectifs/tous',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererObjectifs'),
    async (req, res) => {
    let rows;
    ({ rows } = await db.query(`
      SELECT *
      FROM projets_types_objectifs
      ORDER BY nom
    `));
    if (rows.length === 0) {
      retour(req, res, 404, {
        erreur: 'AUCUN_OBJECTIF_TROUVÉ',
        msg: 'Aucun objectif trouvé',
      })
    } else {
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour activer ou désactiver un objectif
*/
router.post('/objectifs/changementStatut',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererObjectifs'),
  async (req, res) => {
    const { id } = req.body;
    let rows;
    ({ rows } = await db.query(`
      UPDATE projets_types_objectifs
      SET actif = NOT actif
      WHERE id = $1
      AND id != 1
      RETURNING actif`, [
        id,
      ]))
    if (rows.length === 0) {
      retour(req, res, 404, {
        erreur: "AUCUN_OBJECTIF_TROUVÉ",
        msg: "Pas d'objectif trouvé",
      })
    } else {
      retour(req, res, 200, `Objectif ${rows[0].actif ? '' : 'des'}activé`);
    }
  }
)

/*
  Pour ajouter un objectif
*/
router.post('/objectifs/ajouter',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererObjectifs'),
  async (req, res) => {
    const { objectif } = req.body;
    let rows;
    // on regarde si le rôle existe déjà, et pour qui
    ({ rows } = await db.query(`
      SELECT *
      FROM projets_types_objectifs
      WHERE nom = $1`, [objectif]))
    if (rows.length === 0) {
      // l'objectif n'existe pas, on l'ajoute
      ({ rows } = await db.query(`
        INSERT INTO projets_types_objectifs (nom, actif)
          VALUES ($1, true)
          RETURNING *;`,
          [objectif]
        ))
    } else {
      retour(req, res, 400, {
        erreur: "OBJECTIF_EXISTE_DEJA",
        msg: "L'objectif existe déjà",
      });
      return false;
    }
    retour(req, res, 200, {
      msg: 'Objectif ajouté',
      objectif: rows[0],
    });
  }
)

/*
  Pour avoir tous les objectifs "autres"
*/
router.get('/objectifs/autres',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererObjectifs'),
    async (req, res) => {
    let rows;
    ({ rows } = await db.query(`
      SELECT autre_objectif as nom
      FROM public.projets_objectifs
      WHERE
        autre_objectif IS NOT NULL
        AND id_objectif IS NULL
      ORDER BY autre_objectif
    `));
    if (rows.length === 0) {
      retour(req, res, 404, {
        erreur: 'AUCUN_OBJECTIF_AUTRE_TROUVÉ',
        msg: 'Aucun objectif trouvé',
      })
    } else {
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour changer les objectifs "autres"
*/
router.post('/objectifs/autres/changer',
  droits.verifDroitsCB.bind(undefined, 'projets', 'gererObjectifs'),
    async (req, res) => {
    let rows;
    const objectifsAutres = req.body;
    Object.keys(objectifsAutres).forEach(async (objectif) => {
      if (objectifsAutres[objectif] !== 1) {
        ({ rows } = await db.query(`
          UPDATE public.projets_objectifs
          SET id_objectif = $1
          WHERE autre_objectif = $2
        `, [
          objectifsAutres[objectif],
          objectif,
        ]));
      }
    });
    retour(req, res, 200, 'Changements effectués');
  }
)

/*
  Pour supprimer un objectif d'un projet
*/
router.delete('/:id/objectifs/:idObjectif',
  verifChef,
  async (req, res) => {
    const { id, idObjectif } = req.params;
    const { rows } = await db.query(`
      DELETE FROM public.projets_objectifs
        WHERE
          id = $1
          AND id_projet = $2
        RETURNING *;`, [ idObjectif, id ]);
    if (rows.length > 0) {
      retour(req, res, 200, {
        msg: 'Objectif supprimé',
        objectifs: rows
      })
    } else {
      retour(req, res, 500, {
        erreur: 'PROJETS_ERREUR_SUPPRESSION_OBJECTIF',
        msg: "Erreur de suppression d'objectif",
      })
    }
  }
)

/*
  Pour ajouter un objectif à un projet
*/
router.post('/:id/objectifs',
  verifChef,
  async (req, res) => {
    const { id } = req.params;
    const {
      description,
      evaluation,
      idObjectif,
      autre,
    } = req.body;
    const { rows } = await db.query(`
      WITH inserted_objectif AS (
        INSERT INTO public.projets_objectifs (
          id_projet,
          id_objectif,
          autre_objectif,
          description,
          evaluation
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      )
      SELECT o.*, tobj.nom
      FROM inserted_objectif o
      LEFT JOIN projets_types_objectifs tobj
        ON o.id_objectif = tobj.id;`, [
        id,
        idObjectif === 'autre' ? null : idObjectif,
        autre,
        description,
        evaluation,
      ]);
    if (rows.length === 1) {
      retour(req, res, 200, {
        msg: 'Objectif ajouté',
        objectif: rows[0],
      })
    } else {
      retour(req, res, 500, {
        erreur: 'PROJETS_ERREUR_AJOUT_OBJECTIF',
        msg: "Erreur d'ajout d'objectif",
      })
    }
  }
)

/*
  HISTORIQUE
*/

/*
  Pour récupérer l'historique d'un projet
*/
async function recupererHistoriqueProjet(id) {
  const { rows } = await db.query(`
    SELECT *
    FROM projets_historique
    WHERE id_projet =  $1
    ORDER BY date DESC`, [ id ]);
  return rows;
}

router.get('/:id/historique',
  verifVisibilite,
  async (req, res) => {
    const { id } = req.params;
    const historique = await recupererHistoriqueProjet(id);
    retour(req, res, 200, historique)
  }
)

/*
  Pour supprimer une entrée d'historique d'un projet
*/
router.delete('/:id/historique/:idEntree',
  verifChef,
  async (req, res) => {
    const { idEntree } = req.params;
    const { rows } = await db.query(`
      DELETE FROM projets_historique
      WHERE id =  $1
      RETURNING *;`, [ idEntree ]);
    if (rows.length === 1) {
      retour(req, res, 200, {
        msg: 'Entrée supprimée',
      })
    } else {
      retour(req, res, 500, {
        msg: "Erreur lors de la suppression de l'entrée",
        erreur: 'PROJET_HISTORIQUE_SUPPRESSION_ENTREE',
      })
    }
  }
)

/*
  Pour ajouter une entrée dans l'historique d'un projet
*/
router.post('/:id/historique',
  verifChef,
  async (req, res) => {
    const { id } = req.params;
    const {
      description,
      date,
      statut,
      type,
    } = req.body;
    try {
      const { rows } = await db.query(`
        INSERT INTO projets_historique (
          id_projet,
          date,
          description,
          auteur,
          statut,
          type
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`, [
          id,
          date,
          description,
          req.session.nigend,
          statut.length ? statut : null,
          type.length ? type : null,
        ]);
      if (rows.length === 1) {
        retour(req, res, 200, {
          msg: 'Entrée ajoutée',
          entree: rows[0],
        })
      } else {
        retour(req, res, 500, {
          msg: "Erreur lors de l'ajout de l'entrée",
          erreur: 'PROJET_HISTORIQUE_AJOUT_ENTREE_1',
        })
      }
    } catch(e) {
      retour(req, res, 500, {
        msg: "Erreur lors de l'ajout de l'entrée",
        erreur: 'PROJET_HISTORIQUE_AJOUT_ENTREE_2',
        detail: e,
      })
    }
  }
)

/*
  MEMBRES
*/

/*
  Pour récupérer les membres d'un projet
*/
async function recupererMembresProjet(idProjet) {
  const { rows } = await db.query(`
    WITH roles AS (
     SELECT
      rdp.personne,
      json_build_object(
        'id', rdp.id,
        'date_debut', rdp.date_debut,
        'id_role', COALESCE (r.id, 0),
        'nom', CASE
          WHEN r.id IS NULL THEN rdp.precision_autre
          ELSE r.nom
        END
      ) as role
       FROM projets p
       LEFT JOIN role_dans_projet rdp
         ON rdp.id_projet = p.id
         AND rdp.date_fin IS NULL
       LEFT JOIN roles_projet r
         ON rdp.id_role = r.id
       WHERE p.id = $1
       ORDER BY r.id ASC
    )

    SELECT
      r.personne,
      array_agg(r.role) as roles,
      photos.photo
    FROM roles r
    LEFT JOIN referentiels_sir.photos
      ON photos.nigend = r.personne
    GROUP BY r.personne, photos.photo
  `, [
    idProjet,
  ])
  return rows;
}

router.get('/projet/:id/membres',
  verifVisibilite,
  async (req, res) => {
    if (req.visibiliteProjet === 'TOTALE') {
      const { id } = req.params
      const rows = await recupererMembresProjet(id);
      if (rows.length === 0) {
        retour(req, res, 404, {
          erreur: 'PROJET_INTROUVABLE_PAR_MEMBRES',
          msg: 'Projet introuvable.',
        })
      } else {
        retour(req, res, 200, rows);
      }
    } else {
      retour(req, res, 403, {
        erreur: 'ACCES_MEMBRES_INTERDIT',
        msg: "Vous n'avez pas accès aux membres de ce projet.",
      });
    }
  }
)

/*
  Pour révoquer le rôle d'un membre
*/
router.delete('/projet/:id/membres/revoquer/:id_membre',
  verifChef,
  async (req, res) => {
  const { id, id_membre } = req.params;
  let rows;
  ({ rows } = await db.query(`
    UPDATE role_dans_projet rdp
    SET
      date_fin = current_timestamp,
      fin_par = $3
    WHERE id_projet = $1
      AND id = $2
      AND id_role != 1
    RETURNING date_fin
  `, [
    id,
    id_membre,
    req.session.nigend,
  ]))
  if (rows.length === 0) {
    retour(req, res, 500, 'Erreur de révocation. Un chef ne peut être révoqué.')
  } else {
    retour(req, res, 200, rows);
  }
})

/*
  Pour ajouter un membre
*/
router.post('/projet/:id/membres/ajouter',
  verifChef,
  // on vérifie que le gars n'a pas d'autre rôle
  async (req, res) => {
    const { membre, idRole, precision } = req.body
    const { id } = req.params;
    let rows;

    // si on change de chef on enlève l'ancien
    if (idRole === 1) {
      ({ rows } = await db.query(`
        UPDATE role_dans_projet rdp
        SET
          date_fin = current_timestamp,
          fin_par = $3
        WHERE id_projet = $1
          AND id_role = 1
          AND personne != $2
        AND date_fin IS NULL
      `, [
        id,
        membre,
        req.session.nigend,
      ]));
    }
    try {
      ({ rows } = await db.query(`
        WITH inserted_role AS (
          INSERT INTO role_dans_projet (
            personne,
            id_role,
            date_debut,
            id_projet,
            precision_autre,
            debut_par
          )
          VALUES ($1, $2, current_timestamp, $3, $4, $5)
          RETURNING *
        )
        SELECT
          rdp.id,
          rdp.personne,
          rdp.date_debut,
          r.id as id_role,
          CASE
            WHEN r.id IS NULL THEN rdp.precision_autre
            ELSE r.nom
          END as nom_role
        FROM inserted_role rdp
        LEFT JOIN roles_projet r
         ON rdp.id_role = r.id
        `, [
          membre,
          idRole === 0 ? null : +idRole,
          id,
          idRole === 0 ? precision : null,
          req.session.nigend,
        ]))
      if (rows.length !== 1) {
        retour(req, res, 500, "Erreur d'ajout de membre.");
      } else {
        retour(req, res, 200, rows[0]);
      }
    } catch(e) {
      let msg = 'Erreur serveur';
      let erreur = 'ERREUR_SERVEUR';
      if (e.code === '23505') {
        erreur = 'RALE_DEJA_ACTIF';
        msg = 'Rôle déjà actif';
      }
      retour(req, res, 500, {
        erreur,
        msg,
        details: e,
      });
    }

  }
)

/*
  FICHIERS JOINTS
*/

/*
  Pour joindre des fichiers
*/
router.post('/projet/:id/joindrefichiers',
  verifChef,
  async (req, res) => {
    const { fichiersJoints } = req.body;
    const { id } = req.params;
    const values = fichiersJoints.map((x, i) => {
      return (`('projets', ${id}, $${2*i+1}, $${2*i+2}, '${req.session.nigend}', current_timestamp)`)
    }).join(',');
    ({ rows } = await db.query(`
      WITH liste_fichiers_joints AS (
        INSERT INTO fichiers_joints (
           nom_table,
           id_dans_table,
           id_fichier,
           description_fichier,
           auteur,
           date
         )
          VALUES ${values}
          RETURNING id_fichier as id, description_fichier as description
      )
      SELECT lfj.*, f.nom, f.type
      FROM fichiers f
      JOIN liste_fichiers_joints lfj
        ON lfj.id = f.id
      ;`,
        fichiersJoints.map((x) => [x.id, x.description]).flat()
      ))
    if (rows.length === 0) {
      retour(req, res, 500, "Erreur de fichier joint");
    } else {
      retour(req, res, 200, rows);
    }
  }
)

/*
  Pour récupérer des fichiers
*/
async function recupererFichiersProjet(id, chef) {
  ({ rows } = await db.query(`
    SELECT
      fj.id_fichier as id,
      fj.description_fichier as description,
      f.nom,
      f.type,
      f.uuid
    FROM fichiers_joints fj
    JOIN fichiers f
      ON f.id = fj.id_fichier
    WHERE fj.nom_table = 'projets'
      AND fj.id_dans_table = $1
    ;`,
      [
        id,
      ]
    ))
  if (!chef) {
    rows.forEach((r, i) => {
      delete rows[i].uuid;
    })
  }
  return rows;
}

router.get('/projet/:id/fichiers',
  verifVisibilite,
  async (req, res) => {
    if (req.visibiliteProjet === 'TOTALE') {
      const { id } = req.params;
      const chef = await verifChefProjet(id, req.session.nigend)
      const fichiers = await recupererFichiersProjet(id, chef);
      retour(req, res, 200, fichiers);
    } else {
      retour(req, res, 403, {
        erreur: 'ACCES_FICHIER_INTERDIT',
        msg: "Vous n'avez pas accès aux fichiers de ce projet."
      });
    }
  }
)

/*
  Pour supprimer des fichiers
*/
router.delete('/projet/:id/supprimerfichier/:idFichier',
  verifChef,
  async (req, res) => {
    const { id, idFichier } = req.params;
    ({ rows } = await db.query(`
      DELETE FROM fichiers_joints
        WHERE
          id_dans_table = $1
          AND id_fichier = $2
          AND nom_table = $3
        RETURNING *;
      ;`,
        [
          id,
          idFichier,
          'projets',
        ]
      ))
    if (rows.length === 0) {
      retour(req, res, 500, "Erreur de suppression");
    } else {
      retour(req, res, 200, 'Fichier supprimé');
    }
  }
)

/*
  GENDFABLAB
*/
router.get('/projet/:id/gendfablab',
  verifVisibilite,
  async (req, res) => {
    if (req.visibiliteProjet === 'TOTALE') {
      const { id } = req.params
      const { rows } = await db.query(`
        SELECT *
        FROM communautes.gendfablab_questionnaire
        WHERE id_projet = $1
      `, [
        id,
      ])
      if (rows.length === 1) {
        retour(req, res, 200, rows[0]);
      } else {
        retour(req, res, 404, {
          erreur: 'QUESTIONNAIRE_GENDFABLAB_INTROUVABLE',
          msg: "Questionnaire non rempli pour ce projet."
        });
      }
    } else {
      retour(req, res, 403, {
        erreur: 'ACCES_GENDFABLAB_INTERDIT',
        msg: "Vous n'avez pas accès aux plans GendFabLab de ce projet."
      });
    }
  }
)

router.post('/projet/:id/gendfablab',
  verifChef,
  async (req, res) => {
    const { id } = req.params
    const {
      parc,
      but,
      copieOrigine,
      modifAmelio,
      plansTiers,
      invention,
    } = req.body;
    try {
      const { rows } = await db.query(`
        INSERT INTO communautes.gendfablab_questionnaire (
          id_projet,
          parc,
          but,
          copieorigine,
          modifamelio,
          planstiers,
          invention
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (id_projet)
        DO UPDATE
        SET
          parc = excluded.parc,
          but = excluded.but,
          copieorigine = excluded.copieorigine,
          modifamelio = excluded.modifamelio,
          planstiers = excluded.planstiers,
          invention = excluded.invention
        RETURNING *
      `, [
        id,
        parc,
        but,
        copieOrigine,
        modifAmelio.valeur ? modifAmelio.precision : '',
        plansTiers.valeur ? plansTiers.precision : '',
        invention,
      ])
      if (rows.length === 1) {
        retour(req, res, 200, {
          msg: 'Sauvegarde réalisée',
          questionnaire: rows[0],
        });
      } else {
        retour(req, res, 404, {
          erreur: 'ERREUR_SAUVEGARDE_QUESTIONNAIRE',
          msg: "Une erreur s'est produite lors de l'ajout du questionnaire."
        });
      }
    } catch(e) {
      retour(req, res, 500, {
        erreur: 'ERREUR_SAUVEGARDE_QUESTIONNAIRE',
        msg: "Une erreur s'est produite lors de l'ajout du questionnaire",
        detail: e,
      });
    }
  }
)

// Pour récupérer uniquement le statut
router.get('/projet/:id/gendfablab/statut',
  verifVisibilite,
  async (req, res) => {
    if (req.visibiliteProjet === 'TOTALE') {
      const { id } = req.params
      const { rows } = await db.query(`
        SELECT statut
        FROM communautes.gendfablab_questionnaire
        WHERE id_projet = $1
      `, [
        id,
      ])
      if (rows.length === 1) {
        retour(req, res, 200, rows[0]);
      } else {
        retour(req, res, 404, {
          erreur: 'STATUT_GENDFABLAB_INTROUVABLE',
          msg: "Pas de statut Gendfablab pour ce projet."
        });
      }
    } else {
      retour(req, res, 403, {
        erreur: 'ACCES_GENDFABLAB_INTERDIT',
        msg: "Vous n'avez pas accès au statut GendFabLab de ce projet."
      });
    }
  }
)

/*
  PHOTOS FIR
*/

/*
  Pour donner l'autorisation d'une photo FIR
*/
router.post('/autoriseragorha',
  async (req, res) => {
    try {
      ({ rows } = await db.query(`
        INSERT INTO referentiels_sir.photos (
          nigend
        )
        VALUES ($1)
        RETURNING *;
      `, [
        req.session.nigend,
      ]))
      retour(req, res, 200, "Autorisation donnée. La photo sera actualisée cette nuit.");
    } catch(e) {
      let erreur = "Erreur d'autorisation";
      if (e.code === '23505') {
        erreur = "Autorisation déjà donnée, veuillez attendre la mise à jour de la base cette nuit."
      }
      retour(req, res, 500, erreur)
    }
  }
)

/*
  Pour révoquer l'autorisation d'une photo FIR
*/
router.post('/revoqueragorha',
  async (req, res) => {
    try {
      ({ rows } = await db.query(`
        DELETE FROM referentiels_sir.photos
        WHERE
          nigend = $1
        RETURNING *`,
          [
            req.session.nigend,
          ]
      ))
      if (rows.length === 0) {
        retour(req, res, 404, "La révocation est déjà prise en compte. Pour vérifier rafraîchissez la page.");
      } else {
        retour(req, res, 200, "Autorisation révoquée. La photo de la FIR n'est plus utilisée.");
      }
    } catch(e) {
      let erreur = "Erreur de révocation";
      retour(req, res, 500, erreur)
    }
  }
)

module.exports = {
  router,
  verifChefProjet,
  verifChef,
  recupererMembresProjet,
  recupererHistoriqueProjet,
  recupererPartenariatsProjet,
  recupererFichiersProjet,
  recupererNomProjet,
  recupererObjectifsProjet,
  recupererTypesObjectifs,
  modifierVisibiliteProjet,
}
