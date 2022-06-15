const Router = require('express-promise-router')
const db = require('../db')
const { retour } = require('../utils/retour')
const { requeterLDAP } = require('../utils/ldap')
const router = new Router()
module.exports = { router }

var ldap = require('ldapjs');

router.get('/:mode/:type/:code', async (req, res) => {
  const { mode, type, code } = req.params;
  let champs;
  let criteres = {};
  switch(type) {
    case 'personnels': {
      champs = [
        'nigend',
        'nom',
        'grade',
        'unite',
        'code_unite',
        'login',
      ];
      if (/^\d+$/.test(code)) {
        criteres['nigend'] = code;
      } else {
        criteres['nom'] = `*${code}*`;
      }
      break;
    }
    case 'unites': {
      champs = [
        'nom',
        'unite',
        'code_unite',
      ];
      if (/^\d+$/.test(code)) {
        criteres['code_unite'] = code;
      } else {
        criteres['nom'] = `*${code}*`;
      }
      break;
    }
  }

  const retourLDAP = await requeterLDAP(
    type, criteres, champs
  );
  switch(mode) {
    case 'unique': {
      retour(req, res, 200, retourLDAP.contenu[0]);
      break;
    }
    case 'multiple': {
      retour(req, res, 200, retourLDAP.contenu);
      break;
    }
  }
})
