/*
  Ce module permet de requêter le LDAP.

  Pour ne pas avoir à se prendre la tête avec les noms techniques des clés,
  un petit "dictionnaire bilingue" est mis en place, pour pouvoir requêter
  avec un vocabulaire compréhensible.
*/
const asyncRedis = require("async-redis");
let clientRedis = asyncRedis.createClient(6379)
const Ldap = require('ldap-async').default;
let ldap;
if (process.env.NODE_ENV === "production") {
  const config = require('config');
  const configLDAP = require(config.get('LDAP.configFile'));
  ldap = new Ldap({
    url: configLDAP.url,
    secure: true,
    poolSize: 5,
    bindDN: `cn=${configLDAP.compte},dmdName=applications,dc=gendarmerie,dc=defense,dc=gouv,dc=fr`,
    bindCredentials: configLDAP.mdp,
    timeout: 30000
  });
}

// classe pour passer d'une alterner entre champ qu'on veut et nom de la clé LDAP
class ObjetBidirectionnel {
  constructor(map) {
    this.map = map;
    this.reverseMap = {};
    for(const key in map) {
      const value = map[key];
      this.reverseMap[value] = key;
    }
  }
  get(key) { return this.map[key]; }
  revGet(key) { return this.reverseMap[key]; }
  clesAcceptees() { return Object.keys(this.map); }
}
const traduction = new ObjetBidirectionnel({
  'nigend': 'employeeNumber',
  'nom': 'cn',
  'nom_de_famille': 'sn',
  'prenom': 'given_name',
  'grade': 'title',
  'grade_complet': 'rank',
  'unite': 'ou',
  'code_unite': 'codeUnite',
  'login': 'uid',
  'type_unite': 'businessCategory',
  'telephone_portable': 'mobile',
  'telephone_fixe': 'telephoneNumber',
  'courriel': 'mail',
  'adresse': 'postalAddress',
  'code_postal': 'postalCode',
  'poste': 'poste',
  'unite_complet': 'ouDisplayName', // uniquement pour les unités
});

/*
  Fonction qui passe effectivement l'appel au LDAP.
  - type: 'unites', 'personnels' ou 'mixte', selon ce que l'on cherche
  - criteres: objet de l'ensemble des critères, avec comme clé pour chacun
    le nom "compréhensible" (cf. introduction);
  - champs: le tableau des champs que l'on veut retourner, avec les noms
    "compréhensibles".
*/
async function requeterLDAP(type, criteres, champs) {
  // on vérifie que tous les champs demandés sont conformes
  if (!champs.every((x) => traduction.clesAcceptees().includes(x))) {
    return false;
  } else {
    const cle = JSON.stringify({type,criteres,champs});
    // on regarde dans le cache
    let reponse = await clientRedis.get(cle);
    if (reponse) {
      return {
        ok: true,
        contenu: JSON.parse(reponse),
      }
    } else {
      /*
        En développement, on renvoie des données construites
      */
      if (process.env.NODE_ENV === "development") {
        const reponseSimulee = Array.from({ length: 5 }, () => {
          let retour = { type: type.slice(0, -1) };
          champs.forEach((cle) => {
            retour[cle] = `${cle}_${Math.floor(100*Math.random(100))}`;
          });
          return retour;
        });
        console.log("[API]");
        await clientRedis.setex(cle, 3600 * 12, JSON.stringify(reponseSimulee));
        console.log('[ENREGISTRE]');
        return {
          ok: true,
          contenu: reponseSimulee,
        };
      }

      /*
        En production on recherche les données dans le LDAP
      */
      if (process.env.NODE_ENV === "production") {
        try {
          let filter = [];
          switch(type) {
            case 'personnels': {
              filter.push('(objectClass=person)');
              break;
            }
            case 'unites': {
              filter.push('(objectClass=organizationalUnit)');
              filter.push('(!(codeUnite=0))');
              break;
            }
          }
          for (const cle in criteres) {
            filter.push(`(${traduction.get(cle)}=${criteres[cle]})`);
          }
          const retourLDAP = await ldap.search('dc=gendarmerie,dc=defense,dc=gouv,dc=fr', {
            scope: 'sub',
            filter: `(&${filter.join('')})`,
            attributes: champs.map((x) => traduction.get(x)).concat(['objectClass']),
          });
          retourLDAP.forEach((l, i) => {
            if (l.login?.endsWith('.interieur.gouv.fr')) {
              // on supprime les non gendarmes
              delete retourLDAP[i];
            } else {
              if (l.objectClass.includes('person')) {
                retourLDAP[i].type = 'personnel';
              }
              if (l.objectClass.includes('organizationalUnit')) {
                retourLDAP[i].type = 'unite';
              }
              Object.keys(retourLDAP[i]).forEach((cle, j) => {
                if (traduction.revGet(cle) !== undefined) {
                  retourLDAP[i][traduction.revGet(cle)] = retourLDAP[i][cle];
                }
                if (cle !== 'type') {
                  delete retourLDAP[i][cle];
                }
              });
            }
          });
          await clientRedis.setex(cle, 3600 * 12, JSON.stringify(retourLDAP));
          return {
            ok: true,
            contenu: retourLDAP,
          };
        } catch(e) {
          return {
            ok: false,
            erreur: e,
          };
        }
      }
    }
  }
}

module.exports = { requeterLDAP };
