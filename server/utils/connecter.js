/*
  Ce module permet de dater la connexion
  Si l'utilisateur n'a jamais été connecté, on garde en mémoire la
  date de la première connexion.
*/
const db = require('../db');
async function connecter(req) {
  let rows;
  ({ rows } = await db.query(`
    UPDATE profil_perso SET
      premiere_connexion = COALESCE(premiere_connexion, now()),
      derniere_connexion = now()
    WHERE nigend = $1`, [
      req.session.nigend
    ]))
}

module.exports = { connecter };
