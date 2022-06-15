const Router = require('express-promise-router')
const db = require('../db')
const { retour } = require('../utils/retour')
const glob = require("glob")
const router = new Router()
module.exports = { router }

router.post('/', async (req, res) => {
  const { chaine, outils } = req.body;
  let rechercheOutils = '';
  let withOutils = [];
  let withFinal = '';
  /*
    Aggrégation des modules de recherche des différents outils.
    Chaque outil peut préciser comment il veut qu'on exposer ses résultats
    lorsqu'un utilisateur effecture une recherche.
    Pour ce faire, il suffit de créer dans le dossier de l'outil un fichier
    `recherche.js` qui exporte une constante `recherche` de type objet avec deux
    propriétés:
    - `with`: tableau d'objets étant les "WITH" de la requête, avec comme
              propriétés `nom` et `contenu`;
    - `select`: qui réalise la requête.

    Pour l'ensemble des requêtes, si on veut utiliser la chaîne entrée par
    l'utilisateur il faut écrire `$1` et si on veut utiliser le NIGEND de
    l'utilisateur connecté il faut utiliser `$2`.
  */
  glob(`routes/outils/+(${Object.keys(outils).filter((x) => outils[x]).join('|')})/recherche.js`, async function (er, files) {
    files.forEach((f, i) => {
      // Gendindus ne permet pas de requêter si on n'est pas connecté
      if (f.includes('/gendindus/') && (req.session.nigend === undefined)) { return; }
      const { recherche } = require(f.replace('routes/','./'));
      if (recherche.with) {
        withOutils = withOutils.concat(recherche.with);
      }
      rechercheOutils += ` UNION ALL ${recherche.select}`;
    });
    let rows;
    if (withOutils.length) {
      withFinal = ` WITH ${withOutils.map((x) => ` ${x.nom} AS (${x.contenu}) `).join(',')} `
    }
    ({ rows } = await db.query(`
      ${withFinal}
        SELECT p.nom as titre, p.id, 'projet' as type, 'projet' as typeclair, '{}'::json as lien
        FROM projets p
        WHERE p.nom ILIKE $1
      ${rechercheOutils}
      ORDER BY titre
      `,
       [
        `%${chaine}%`,
        req.session.nigend,
      ]))
    retour(req, res, 200, rows);
  })
})
