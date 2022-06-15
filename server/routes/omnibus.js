/*
  Ce module permet de requêter Omnibus.
*/
const Router = require('express-promise-router')
const { retour } = require('../utils/retour')
const router = new Router()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require('config');
const configOmnibus = require(config.get('omnibus.configFile'));
module.exports = { router }

// Pour récupérer les informations d'un projet
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (process.env.NODE_ENV === "development") {
    retour(req, res, 200, {
      nom: `Nom du projet ${id} en dev`,
      description: `Description du projet ${id} en dev`,
      web_url: `Web URL du projet ${id} en dev`,
      namespace: {
        id: 1,
        name: `Namespace du projet ${id} en dev`,
      },
    });
  } else if (process.env.NODE_ENV === "production") {
    try {
      fetch(`${configOmnibus.api}/projects/${id}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': configOmnibus.token,
        }
      })
        .then(res => res.json())
        .then((p) => {
          retour(req, res, 200, {
            nom: p.name,
            description: p.description,
            web_url: p.web_url,
            namespace: p.namespace,
          });
        })
        .catch((e) => {
          retour(req, res, 500, {
            erreur: "RECHERCHE_PROJET_OMNIBUS_API",
            msg: "Erreur lors de la recherche du projet sur Omnibus.",
            details: e,
          });
        })
    } catch(e) {
    }
  } else {
    retour(req, res, 500, {
      erreur: "RECHERCHE_PROJET_OMNIBUS_PLATEFORME",
      msg: "Erreur lors de la recherche du projet sur Omnibus.",
    });
  }
})

/*
  Fonction qui va rechercher l'ensemble des fichiers STL d'un projet
*/
async function chercherFichiersSTL(projets) {
  if (projets.length === 0) { return projets; }
  /*
    En développement, on renvoie des données formatés
  */
  if (process.env.NODE_ENV === "development") {
    projets.forEach((item, i) => {
      projets[i].fichiers = [
        {"id":"e244a4941dcab6eabbce144ca2761a2919832b30","name":"Autre fichier.stl","type":"blob","path":"Autre fichier.stl","mode":"100644"},
        {"id":"e244a4941dcab6eabbce144ca2761a2919832b30","name":"Flamme_Gie.stl","type":"blob","path":"Flamme_Gie.stl","mode":"100644"},
        {"id":"feee6bfdc6c969c6340009f2aab42ecd0b5d55fc","name":"Foot_piratage","type":"blob","path":"Foot_piratage","mode":"100644"},
        {"id":"e6f759fcb6e90c55dcacc45faa5bea627e6caa3f","name":"README.md","type":"blob","path":"README.md","mode":"100644"}
      ].filter((x) => x.name.toLowerCase().endsWith('.stl'));
    });
    return projets;
  } else {
  /*
    En production
  */
    if (process.env.NODE_ENV === "production") {
      let p = projets.map((x) => {
        return {
          id: x.id_omnibus,
          url: `https://omnibus-pic.gendarmerie.fr/api/v4/projects/${x.id_omnibus}/repository/tree?recursive=true&per_page=100`,
        };
      })

      await Promise.all(p.map(async (projet) =>
        await fetch(projet.url)
          .then(res => res.json())
          .then(t => {
            projet.fichiers = t.filter((x) => x.name.toLowerCase().endsWith('.stl'));
          })
          .catch((e) => {
            projet.fichiers = [];
          })
        )
      )
      .then(() => {
        projets.forEach((item, i) => {
          projets[i].fichiers = p.find((x) => x.id === projets[i].id_omnibus).fichiers;
        });
      })
      return projets;
    }
  }
}

module.exports = {
  router,
  chercherFichiersSTL,
}
