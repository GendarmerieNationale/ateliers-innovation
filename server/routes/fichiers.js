const { v4: uuidv4 } = require('uuid')
const config = require('config')
const fs = require('fs')
const fsPromises = fs.promises
const Router = require('express-promise-router')
const db = require('../db')
const droits = require('./droits')
const { retour } = require('../utils/retour')
const router = new Router();
module.exports = {
  router,
  enregistrerFichier,
  joindreFichiers,
}

async function creerFichierEnBase(fichier, uid, nigend, statut = 'TMP') {
  const { rows } = await db.query(`
    INSERT INTO fichiers (
      uuid,
      nom,
      statut,
      type,
      taille,
      proprietaire
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    RETURNING *`,
    [
      uid,
      fichier.name,
      statut,
      fichier.mimetype,
      fichier.size,
      nigend,
    ])
  return rows[0];
}

async function joindreFichiers(table, nigend, fichiers) {
  /*
    "fichiers" est un tableau contenant des objets de cette forme:
    {
      idDansTable,
      idFichier,
      descriptionFichier,
    }
  */
  let rows;

  const values = fichiers.map((x, i) => {
    return (`($1, $2, $${3*i+3}, $${3*i+4}, $${3*i+5})`)
  }).join(',');
  ({ rows } = await db.query(`
    WITH liste_fichiers_joints AS (
      INSERT INTO fichiers_joints (
         nom_table,
         auteur,
         id_dans_table,
         id_fichier,
         description_fichier
       )
        VALUES ${values}
        RETURNING id_fichier as id, description_fichier as description
    )
    SELECT lfj.*, f.nom, f.type
    FROM fichiers f
    JOIN liste_fichiers_joints lfj
      ON lfj.id = f.id
    ;`,
    [
      table,
      nigend,
    ]
      .concat(
        fichiers.map((x) => [x.idDansTable, x.idFichier, x.description]).flat()
      )
    )
  )
  return(rows[0]);
}

async function enregistrerFichier(fichier, nigend, type = 'buffer', metadonnees = {}) {
  let uid = uuidv4()
  let dir = config.get('api.fichiers')+'/'+uid.split('').splice(0,3).join('/')
  await fsPromises.mkdir(dir, { recursive: true });
  let retour = {
    erreur: true,
  };

  switch (type) {
    case 'buffer': {
      await fsPromises.writeFile(dir+'/'+uid, fichier.data)
        .then(async () => {
          retour.erreur = false;
          retour.fichier = await creerFichierEnBase(fichier, uid, nigend);
        })
        .catch((e) => {
          retour.detail = e;
        });
      break;
    }
    case 'chemin': {
      await fsPromises.rename(fichier, dir+'/'+uid)
        .then(async () => {
          retour.erreur = false;
          retour.fichier = await creerFichierEnBase(
            Object.assign(
              fichier,
              {
                name: metadonnees.nom,
                size: metadonnees.size,
                mimetype: metadonnees.mimetype,
              },
            ),
            uid,
            nigend,
            metadonnees.statut,
          );
        })
        .catch((e) => {
          retour.detail = e;
        });
      break;
    }
  }

  return retour;
}

/*
  Fonction qui reçoit un fichier et le place sur le serveur.
  Il pourra être ensuite utilisé. Les fichiers qui ne sont pas utilisés
  seront supprimés automatiquement par un CRON.
*/
router.post('/envoi', async (req, res) => {
  if (req.files) {
    if (req.files.file.size > 20000000) {
      retour(req, res, 413, 'Fichier trop gros!')
    }
    else {
      const enregistrement = await enregistrerFichier(
        req.files.file,
        req.session.nigend,
      )
      if (enregistrement.erreur) {
        retour(req, res, 500, {
          erreur: 'AJOUT_FICHIER',
          msg: "Erreur lors de l'ajout de fichier",
          detail: enregistrement.detail,
        })
      } else {
        retour(
          req,
          res,
          200,
          Object.assign(
            enregistrement.fichier,
            {size: req.files.file.size, type: req.files.file.mimetype}
          )
        );
      }
    }
  }
  else {
    res.status(400).send('Pas de fichier!')
  }

})

router.post('/supprimer', async (req, res) => {
  const { id, nom, uuid, lien } = req.body;
  let rows;
  // si le lien est complet, on enlève le lien
  if (lien.id !== '' && lien.type !== '') {
    ({ rows } = await db.query(`DELETE FROM fichiers_joints
      WHERE nom_table = $1
      AND id_dans_table = $2
      AND id_fichier = $3;`,
    [
      `${lien.type}s`,
      lien.id,
      id,
    ]))
  }

  ({ rows } = await db.query(`SELECT *
    FROM fichiers
    WHERE id = $1
      AND nom = $2
      AND uuid = $3`,
    [id,
    nom,
    uuid])
  )
  if (rows.length == 0) {
    retour(req, res, 404, "Fichier non trouvé!");
    return false;
  }
  const chemin = config.get('api.fichiers')+'/'+uuid.split('').splice(0,3).join('/')+'/'+uuid

  if (fs.existsSync(chemin)) {
    fs.unlink(chemin, async function (err) {
      if (err) {
        retour(req, res, 500, 'Fichier impossible à supprimer: ' + err)
      }
      else {
        const { rowsDeleted } = await db.query("DELETE FROM fichiers WHERE id = '"+id+"' AND nom = '"+nom+"'")
        retour(req, res, 200, 'Fichier supprimé.')
      }
    })
  } else {
    retour(req, res, 404, "Fichier introuvable.")
  }
})

/*
  Pour récupérer l'intégralité des fichiers téléversés par l'utilisateur
*/
router.get('/mesdocuments', async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      fj.id,
      fj.nom_table as emplacement,
      fj.id_dans_table as precisionid,
      fj.id_fichier,
      fj.description_fichier as nom,
      f.nom as nom_fichier
    FROM fichiers_joints fj
    JOIN fichiers f
      ON f.id = fj.id_fichier
    WHERE auteur = $1
    `, [req.session.nigend])
  if (rows.length == 0) {
    retour(req, res, 404, "Aucun document!")
    return false;
  } else {
    retour(req, res, 200, rows)
  }
})

/*
  Pour récupérer l'intégralité des fichiers téléversés par tout le monde
*/
router.get('/touslesdocuments', async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      fj.id,
      fj.nom_table as emplacement,
      fj.id_dans_table as precisionid,
      fj.id_fichier,
      fj.description_fichier as nom,
      f.nom as nom_fichier,
      f.proprietaire,
      fj.auteur as utilisateur
    FROM fichiers_joints fj
    JOIN fichiers f
      ON f.id = fj.id_fichier
    `)
  if (rows.length == 0) {
    retour(req, res, 404, "Aucun document!")
    return false;
  } else {
    retour(req, res, 200, rows)
  }
})

/*
  Pour changer le nom d'un fichier
*/
router.post('/changernom/:mesdocuments?',
  droits.verifDroitsCB.bind(undefined, 'mediatheque', 'modifierTousFichiers'),
  async (req, res) => {
    const { mesdocuments } = req.params;
    const valeurs = [
      req.body.nom,
      req.body.doc.id_fichier,
    ]
    if (mesdocuments === 'mesdocuments') {
      valeurs.push(req.session.nigend)
    }
    const { rows } = await db.query(`
      UPDATE fichiers_joints
      SET description_fichier = $1
      WHERE id_fichier = $2
      ${ mesdocuments === 'mesdocuments' ? 'AND auteur = $3' : '' }
      RETURNING *
      `, valeurs)
    if (rows.length == 0) {
      retour(req, res, 404, "Aucun document correspondant!")
      return false;
    } else {
      retour(req, res, 200, "Nom modifié!")
    }
})

/*
  Pour supprimer un fichier
*/
router.post('/supprimerdocument/:mesdocuments?',
  droits.verifDroitsCB.bind(undefined, 'mediatheque', 'modifierTousFichiers'),
  async (req, res) => {
    const { mesdocuments } = req.params;
    const valeurs = [
      req.body.id_fichier,
    ]
    if (mesdocuments === 'mesdocuments') {
      valeurs.push(req.session.nigend)
    }
    const { rows } = await db.query(`
      DELETE FROM fichiers_joints
      WHERE id_fichier = $1
      ${ mesdocuments === 'mesdocuments' ? 'AND auteur = $2' : '' }
      RETURNING *
      `, valeurs)
    if (rows.length == 0) {
      retour(req, res, 404, "Aucun document correspondant!")
      return false;
    } else {
      retour(req, res, 200, "Document supprimé!")
    }
})

router.get('/telechargement/:id/:nom/:miniature?', async (req, res) => {
  const { id, nom, miniature } = req.params
  const { rows } = await db.query(`
    SELECT * FROM fichiers
    WHERE id = $1
    AND nom = $2
    `, [
      id,
      nom
    ])
  if (rows.length == 0) {
    retour(req, res, 400, "Mauvaise requête!")
    return false;
  }
  const uuid = rows[0].uuid
  const chemin = config.get('api.fichiers')+'/'+uuid.split('').splice(0,3).join('/')+'/'+uuid

  if (fs.existsSync(chemin)) {
    retour(req, res, 200, {
      chemin,
      nom,
    }, miniature !== undefined ? 'miniature' : 'download')
  } else {
    retour(req, res, 404, "Fichier introuvable.")
  }
})

/*
            ILLUSTRATIONS
*/


router.post('/illustrations/ajouterImage',
  droits.verifDroitsCB.bind(undefined, 'mediatheque', 'ajouterIllustration'),
  async (req, res) => {
    const { id, description } = req.body;
    let rows;

    ({ rows } = await db.query(`SELECT *
      FROM fichiers
      WHERE id = $1`,
      [id])
    )
    if (rows.length == 0) {
      retour(req, res, 404, "Fichier non trouvé!");
    } else {
      await joindreFichiers(
        'illustrations',
        req.session.nigend,
        [
          {
            idDansTable: 0,
            idFichier: id,
            description: description,
          }
        ]
      )
      retour(req, res, 200, `Image "${description}" ajoutée aux illustrations`);
    }
  }
)

router.get('/illustrations/:filtre?', async (req, res) => {
  let actifs = {
    condition: 'AND fj.id_dans_table = 1',
    retour: ''
  };
  if (req.params.filtre === 'tous') {
    actifs.condition = '';
    actifs.retour = ', fj.id_dans_table as actif';
  }
  const { rows } = await db.query(`
  SELECT f.id, f.nom, fj.description_fichier ${actifs.retour}
  FROM public.fichiers_joints fj
  JOIN fichiers f ON f.id = fj.id_fichier
  where nom_table = 'illustrations'
  ${actifs.condition};
  `)
  if (rows.length == 0) { res.status(400).send("Mauvaise requête!") }
  else res.send(rows)
})

router.post('/illustrations/changementStatut',
  droits.verifDroitsCB.bind(undefined, 'mediatheque', 'desactiverIllustration'),
  async (req, res) => {
    const { id, statut } = req.body;
    let rows;
    ({ rows } = await db.query(`SELECT *
      FROM fichiers_joints
      WHERE id_fichier = $1
        AND nom_table = 'illustrations'`,
      [id])
    )
    if (rows.length == 0) {
      res.status(404).send("Fichier non trouvé!"); return false;
    } else {
      ({ rows } = await db.query(`UPDATE fichiers_joints
        SET id_dans_table = $1
        WHERE id_fichier = $2
          AND nom_table = 'illustrations'`,
        [statut, id])
      )
      retour(req, res, 200, 'Statut changé');
    }
  }
)

/*
  MEDIATHÈQUE
*/

/*
  Pour ajouter un fichier à la médiathèque
*/
router.post('/mediatheque/ajouter',
  droits.verifDroitsCB.bind(undefined, 'mediatheque', 'ajouterFichier'),
  async (req, res) => {
    const { id, description, metaDonnees } = req.body;
    if (metaDonnees.categorie.indexOf('mediatheque') === 0) {
      metaDonnees.precisioncategorie = metaDonnees.categorie.split('-')[1];
      metaDonnees.categorie = metaDonnees.categorie.split('-')[0];
    } else {
      metaDonnees.precisioncategorie = 0;
    }
    let rows;

    ({ rows } = await db.query(`
      UPDATE fichiers
      SET
        motscles = $2,
        projets = $3
      WHERE id = $1
      RETURNING *`,
      [
        id,
        metaDonnees.motscles,
        metaDonnees.projets
      ])
    )
    if (rows.length == 0) {
      retour(req, res, 404, "Fichier non trouvé!");
    } else {
      if (metaDonnees.evenement) {
        await joindreFichiers(
          'evenements',
          req.session.nigend,
          [
            {
              idDansTable: metaDonnees.evenement,
              idFichier: id,
              description: description,

            }
          ]
        )
      }
      await joindreFichiers(
        metaDonnees.categorie,
        req.session.nigend,
        [
          {
            idDansTable: metaDonnees.precisioncategorie,
            idFichier: id,
            description: description,

          }
        ]
      )
      retour(req, res, 200, `Fichier "${description}" ajoutée à la médiathèque dans la catégorie "${metaDonnees.categorie}"`);
    }
  }
)

/*
  Pour actualiser un fichier à la médiathèque
*/
router.post('/mediatheque/actualiser', async (req, res) => {
  const { id, description, metaDonnees, id_document } = req.body;
  if (metaDonnees.categorie.indexOf('mediatheque') === 0) {
    metaDonnees.precisioncategorie = metaDonnees.categorie.split('-')[1];
    metaDonnees.categorie = metaDonnees.categorie.split('-')[0];
  } else {
    metaDonnees.precisioncategorie = 0;
  }
  let rows;

  ({ rows } = await db.query(`UPDATE fichiers
    SET
      motscles = $2,
      projets = $3
    WHERE id = $1
      AND proprietaire = $4
    RETURNING *`,
    [
      id,
      metaDonnees.motscles,
      metaDonnees.projets,
      req.session.nigend
    ])
  )
  if (rows.length == 0) {
    retour(req, res, 404, "Fichier non trouvé!");
  } else {
    ({ rows } = await db.query(`
      UPDATE fichiers_joints
      SET description_fichier = $1
      WHERE id = $2
      AND auteur = $3
      RETURNING *
      `, [
        description,
        id_document,
        req.session.nigend
      ]));
    if (rows.length == 0) {
      retour(req, res, 404, "Aucun document correspondant!")
      return false;
    } else {
      retour(req, res, 200, `Fichier "${description}" actualisé`);
    }
  }
})

/*
  Pour renvoyer les fichiers de la médiathèque correspondant à une recherche
*/
router.get('/mediatheque/rechercher/:recherche', async (req, res) => {
  const { recherche } = req.params;
  const { rows } = await db.query(`
  SELECT f.id, f.nom, fj.description_fichier as description
  FROM fichiers_joints fj
  JOIN fichiers f ON f.id = fj.id_fichier
  WHERE nom_table = 'mediatheque'
  AND fj.description_fichier ILIKE $1;
  `, [
    `%${recherche}%`
  ])
  if (rows.length == 0) { res.status(404).send("Pas de résultat!") }
  else res.send(rows)
})

/*
  Pour renvoyer les fichiers de la médiathèque correspondant à une recherche
*/
router.get('/podcasts/rechercher/:recherche', async (req, res) => {
  const { recherche } = req.params;
  const { rows } = await db.query(`
  SELECT f.id, f.nom, fj.description_fichier as description
  FROM fichiers_joints fj
  JOIN fichiers f ON f.id = fj.id_fichier
  WHERE nom_table = 'podcasts'
  AND fj.description_fichier ILIKE $1;
  `, [
    `%${recherche}%`
  ])
  if (rows.length == 0) { res.status(404).send("Pas de résultat!") }
  else res.send(rows)
})
