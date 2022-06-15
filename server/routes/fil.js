const Router = require('express-promise-router')
const db = require('../db')
const { retour } = require('../utils/retour')
const router = new Router()
module.exports = { router }

/*
  Pour récupérer un fil, par bouts
*/
router.get('/:id/:page', async (req, res) => {
  const { id, page } = req.params;
  let nigend = id === 'perso' ? req.session.nigend : id;
  const { rows } = await db.query(`
    SELECT
      'actu' as type,
      json_build_object(
        'type',
        'actu',
        'id',
        a.id
        ) as lien,
      a.date_publication as date
    FROM actus a
    WHERE a.auteur = $1
    AND statut = 'VALIDE'

    UNION ALL

    SELECT
      'article' as type,
      json_build_object(
        'type',
        'article',
        'id',
        a.id
        ) as lien,
      a.date_publication as date
    FROM articles a
    WHERE a.auteur = $1
    AND statut = 'VALIDE'

    UNION ALL

    SELECT
      'portrait' as type,
      json_build_object(
        'type',
        'portrait',
        'id',
        p.id
        ) as lien,
      p.date_publication as date
    FROM portraits p
    WHERE p.auteur = $1
    AND statut = 'VALIDE'

    UNION ALL

    SELECT
      'dossier' as type,
      json_build_object(
        'type',
        'dossier',
        'id',
        d.id
        ) as lien,
      d.date_publication as date
    FROM dossiers d
    WHERE d.auteur = $1
    AND statut = 'VALIDE'

    UNION ALL

    SELECT
      'vote' as type,
      json_build_object(
        'vote',
        v.vote,
        'type',
        v.type,
        'id',
        v.idvote
        ) as lien,
      v.date as date
    FROM votes v
    WHERE v.votant = $1

    UNION ALL

    SELECT
      'partage' as type,
      json_build_object(
        'type',
        p.type,
        'id',
        p.id_partage,
        'commentaire',
        p.commentaire
        ) as lien,
      p.date as date
    FROM partages p
    WHERE p.auteur = $1

    UNION ALL

    SELECT
      'projet' as type,
        json_build_object(
        'type',
        'projet',
        'id',
        p.id,
        'typeProjet',
        'creation'
        ) as lien,
      p.date_creation as date
    FROM projets p
    JOIN role_dans_projet rdp
    ON p.id = rdp.id_projet
      WHERE rdp.id_role = 1
    AND rdp.personne = $1

    UNION ALL

    SELECT
      'projet' as type,
      json_build_object(
        'type',
        'projet',
        'typeProjet',
        'role',
        'role',
        r.nom,
        'id',
        p.id
        ) as lien,
      rdp.date_debut as date
    FROM role_dans_projet rdp
    JOIN roles_projet r
      ON r.id = rdp.id_role
    JOIN projets p
      ON p.id = rdp.id_projet
    WHERE rdp.personne = $1

    UNION ALL

    SELECT
      'projet' as type,
      json_build_object(
        'type',
        'projet',
        'typeProjet',
        'finrole',
        'role',
        r.nom,
        'id',
        p.id
        ) as lien,
      rdp.date_fin as date
    FROM role_dans_projet rdp
    JOIN roles_projet r
      ON r.id = rdp.id_role
    JOIN projets p
      ON p.id = rdp.id_projet
    WHERE rdp.personne = $1
      AND date_fin IS NOT NULL

    UNION ALL

    SELECT
      'mediatheque' as type,
      json_build_object(
        'nomFichier',
        f.nom,
        'idFichier',
        f.id,
        'description_fichier',
        fj.description_fichier
        ) as lien,
      f.date as date
    FROM fichiers_joints fj
    JOIN fichiers f
      ON f.id = fj.id_fichier
    WHERE fj.nom_table = 'mediatheque'
      AND fj.auteur = $1

      UNION ALL

    SELECT
      'badge' as type,
      json_build_object(
        'idBadge',
        b.badge,
        'niveau',
        b.niveau
        ) as lien,
      b.date_obtention as date
    FROM badges_niveaux b
    WHERE b.nigend = $1


    UNION ALL

  	SELECT
      'entreprise' as type,
      json_build_object(
        'nom',
        e.nom,
        'id',
        e.id
        ) as lien,
      e.date_creation as date
    FROM gendindus.entreprises e
    WHERE e.createur = $1

    UNION ALL

    SELECT
      'evenement' as type,
      json_build_object(
        'nom',
        e.nom,
        'id',
        e.id
        ) as lien,
      e.date_creation as date
    FROM public.evenements e
    WHERE e.createur = $1

    ORDER BY date DESC
    LIMIT 10
    OFFSET $2
    `, [
      nigend,
      10*(+page)
    ])
  retour(req, res, 200, rows);
})

/*

            DÉBUT DU PARTAGE

*/

/*
  Pour partager quelque chose sur le mur.
*/
router.post('/partager', async (req, res) => {
  const { id, type, commentaire }  = req.body
  const nigend = req.session.nigend;
  let rows;
  ({ rows } = await db.query(`
    INSERT INTO partages (type, id_partage, auteur, commentaire)
      VALUES ($1, $2, $3, $4)
      RETURNING date;`, [
        type,
        id,
        nigend,
        commentaire
      ]))
  retour(req, res, 200, rows[0]);
})

/*
  Pour vérifier si on a déjà partagé quelque chose
*/
router.get('/partage/verif/:type/:id', async (req, res) => {
  const { id, type } = req.params
  const nigend = req.session.nigend;
  const { rows } = await db.query(`
    SELECT date
    FROM partages
    WHERE auteur = '${nigend}'
      AND type = '${type}'
      AND id_partage = ${id}
    ORDER BY date DESC`)
  retour(req, res, 200, rows[0]?.date)
})

/*

            FIN DU PARTAGE

*/
