/*
  Ce module permet de gérer les traces de l'application.
  Les traces comportent les éléments suivants:
  * timestamp
  * NIGEND
  * code unite
  * URL
  * méthode
  * contenu envoyé
  * statut de la réponse
  * contenu retourné

  La trace est sous la forme d'un tableau au format JSON.stringify
*/
function tracer(ip, nigend, unite, url, methode, contenu, statutReponse, reponse) {
  const trace = [
    Date.now(),
    ip,
    nigend,
    unite,
    url,
    methode,
    contenu,
    statutReponse,
    reponse,
  ]
  console.log(JSON.stringify(trace));
}

module.exports = { tracer };
