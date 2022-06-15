const Router = require('express-promise-router');
const { retour } = require('../utils/retour');
const config = require('config');
const configOmnibus = require(config.get('omnibus.configFile'));
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const router = new Router()
module.exports = { router }

router.post('/', async (req, res) => {
  const nigend = req.session.nigend;
  if (!['question','anomalie','suggestion'].includes(req.body.type)) {
    retour(req, res, 400, "Type non reconnu.");
  } else if (nigend === undefined) {
    retour(req, res, 403, "Interdit d'envoyer une remarque.");
  } else {
    const { type, titre, corps, page }  = req.body;
    /*
      En développement, on suppose que ça a été bien intégré.
    */
    if (process.env.NODE_ENV === "development") {
      console.log(`${corps.replace(/\n/g, "<br />")}<br /><hr />${page}<br />${JSON.stringify(req.session)}`);
      retour(req, res, 200, {
        url: "URL OMNIBUS",
      });
    }

    /*
      En production
    */
    if (process.env.NODE_ENV === "production") {
      try {
        fetch(`${configOmnibus.api}/projects/${configOmnibus.idProjet}/issues`, {
          method: 'post',
          body: JSON.stringify({
            "title": titre,
            "description": `${corps.replace(/\n/g, "<br />")}<br /><hr />${page}<br />Utilisateur: ${req.session.user} (${req.session.nom} - ${req.session.nigend})<br />Unite: ${req.session.unite} - ${req.session.uniteClair}`,
            "labels": type,
          }),
          headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': configOmnibus.token,
          }
        })
          .then(res => res.json())
          .then((p) => {
            retour(req, res, 200, {
              url: `${configOmnibus.urlProjet}/-/issues/${p.iid}`,
            });
          })
          .catch((e) => {
            retour(req, res, 500, e);
          })
      } catch(e) {
      }
    }
  }
})
