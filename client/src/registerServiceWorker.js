/* eslint-disable no-console */

import { register } from 'register-service-worker';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n'
        + 'For more details, visit https://goo.gl/AFskqB',
      );
    },
    registered() {
      console.log('Le service worker a été enregistré.');
    },
    cached() {
      console.log('Le contenu a été mis en cache pour une utilisation hors ligne.');
    },
    updatefound() {
      console.log('Du nouveau contenu est en cours de téléchargement.');
    },
    updated(registration) {
      console.log('Du nouveau contenu est disponible, merci d\'actualiser.');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    },
    offline() {
      console.log('Pas de connexion internet trouvée. L\'application tourne en mode hors ligne.');
    },
    error(error) {
      console.error('Erreur durant l\'enregistrement du service worker:', error);
    },
  });
}
