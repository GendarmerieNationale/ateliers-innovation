/*
  Ce module permet de gérer le retour.
  Il trace l'action puis renvoie la réponse.
*/
const { tracer } = require('./traces');
const sharp = require('sharp');

async function retour(req, res, code, reponse, typeRetour = 'send') {
  if (
    !req.originalUrl.startsWith('/fichiers/telechargement')
    && !req.originalUrl.startsWith('/rss')
    && !req.originalUrl.endsWith('/miniature')
  ) {
    tracer(
      req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      req.session.nigend,
      req.session.unite,
      req.originalUrl,
      req.method,
      req.method === 'GET' ? req.params : req.body,
      code,
      reponse
    );
  }
  res.status(code)
  switch(typeRetour) {
    case 'send': {
      res.send(reponse);
      break;
    }
    case 'download': {
      const { chemin, nom } = reponse;
      res.download(chemin, nom);
      break;
    }
    case 'miniature': {
      const { chemin, nom } = reponse;
      sharp(chemin)
        .withMetadata()
        .resize(200)
        .png()
        // .jpeg({ mozjpeg: true })
        // .ensureAlpha(0)
        .toBuffer()
        .then( data => {
          res.end(Buffer.from(data, 'base64'));
        })
      break;
    }
    case 'xml': {
      res.set('Content-Type', 'text/xml');
      res.send(reponse);
    }
  }
}

module.exports = { retour };
