const config = require('config');
const express = require('express');
const cors = require('cors');
const PORT = config.get('app.port');
const request = require('request');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connecter } = require('./utils/connecter')
const { tracer } = require('./utils/traces')
const { retour } = require('./utils/retour')
const fs = require('fs');

/*
        SESSIONS
*/

let session = require('express-session')
let cookieParser = require('cookie-parser')
let redis = require('redis');
let clientRedis = redis.createClient()
let RedisStore = require('connect-redis')(session);

/*
        FIN SESSIONS
*/


const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const app = express()

app.use(cors({
    origin: true,
    methods:[
      'GET',
      'POST',
      'OPTIONS',
      'PUT',
      'PATCH',
      'DELETE'
    ],
    allowedHeaders: [
      'Origin',
      'Content-Type',
      'Accept',
      'X-Requested-With',
      'withCredentials'
    ],
    credentials: true // enable set cookie
}));


/*
        MOTEUR DE RENDU HTML
*/

const path = require("path");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

/*
        FIN MOTEUR DE RENDU HTML
*/

const SESSIONSECRET = require(config.get('app.secretsession')).secret;
app.use(cookieParser(SESSIONSECRET));
app.use(session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379,
    client: clientRedis,
    ttl: 100
  }),
  secret: SESSIONSECRET,
  resave: false,
  // unset: 'destroy',
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
    domain: config.get('app.domainecookie')
   }
}));


app.use(fileUpload());

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}))

app.use(express.json());


/*
  Pour savoir si l'utilisateur est connecté ou non.
  S'il est connecté, on renvoie des informations.
*/
app.get('/infosconnexion', function (req, res, next) {
  const { nom, nigend, unite } = req.session;
  if (nigend !== undefined) {
    res.send({
      connecte: true,
      nom,
      nigend,
      unite,
      // id: req.sessionID,
     });
  } else {
    res.send({
      connecte: false,
    })
  }
})

/*
  Affiche la page de connexion.
*/
app.get('/connecter', function (req, res) {
  /*
    En développement, on affiche un formulaire
    pour simuler un utilisateur.
    Valider le formulaire crée la session.
    Fermer la fenêtre du formulaire force l'actualisation du store VueJS.
  */
  if (process.env.NODE_ENV === "development") {
    tracer(
      req.session.nigend,
      req.session.unite,
      req.originalUrl,
      req.method,
      req.method === 'GET' ? req.params : req.body,
      200,
      'Page de connexion de développement'
    )
    res.render('connexion-dev');
  }

  /*
    En production, le principe est quasiment le même,
    en passant par le SSO local:
    - Une fenêtre s'ouvre.
    - Si l'utilisateur n'est pas connecté au SSO,
    un formulaire de connexion s'ouvre.
    - Si l'utilisateur est connecté, cette fenêtre se ferme
    et le store VueJS s'actualise.
  */
  if (process.env.NODE_ENV === "production") {
    // si la session existe,
    // on rend la page de connexion qui se ferme toute seule
    // et on trace cet accès
    if (req.session.user) {
      tracer(
        req.session.nigend,
        req.session.unite,
        req.originalUrl,
        req.method,
        req.method === 'GET' ? req.params : req.body,
        200,
        'Connexion en production'
      )
      res.render('connexion-prod');
    } else {
      // il n'y a pas de session
      // donc on redirige vers la page de connexion
      var url_redirect = config.get('app.api') + req.originalUrl;
      var cookie = req.cookies.lemonlocal;
      if (cookie === undefined) {
        // Le cookie lemonlocal n'existe pas.
        // On redirige vers getcookie.pl avec url_redirect
        var base64URL = new Buffer(url_redirect).toString('base64');
        res.redirect('XXX' + '?url=' + base64URL);
        return 0;
      } else {
        // Le cookie lemonlocal a pour valeur req.cookies.lemonlocal
        var url = 'XXX' + '?id=' + req.cookies.lemonlocal + '&host=' + req.get('host').split(':')[0];
        // On va tester l'URL getuser.pl avec l'url
        var cookieString = 'lemonlocal=' + req.cookies.lemonlocal;
        var options = {
            url: url,
            method: 'GET',
            rejectUnauthorized: false,
            headers: {
              'Cookie': cookieString,
              'Accept': '/',
              'Connection': 'keep-alive'
            }
          }
        // on récupère les informations de session et on les stocke
        request(options, function (error, response, body) {
          if (error) {res.redirect('XXX' + '?url=' + base64URL); return 0;}
          if (response.statusCode == 200) {
            var jsonRetour = JSON.parse(body);
            req.session.user = jsonRetour.uid;
            req.session.nigend = jsonRetour.nigend;
            req.session.prenom = jsonRetour.givenName;
            req.session.nomFamille = jsonRetour.cn;
            req.session.nom = jsonRetour.displayname;
            req.session.mailUser = jsonRetour.mail;
            req.session.telUser = jsonRetour.telephoneNumber;
            req.session.mailToken = jsonRetour.mailToken;
            req.session.unite = jsonRetour.codeUnite;
            req.session.responsabilite = jsonRetour.responsabilite;
            req.session.uniteClair = jsonRetour.unite;
            req.session.save();
            let stockRedis = {
              session: "sess:" + req.session.id,
              'user-agent': req.headers["user-agent"],
              date: Date.now(),
            }
            clientRedis.sadd("sessions:" + jsonRetour.uid, JSON.stringify(stockRedis));
            // la session est enregistrée
            connecter(req);
            tracer(
              req.session.nigend,
              req.session.unite,
              req.originalUrl,
              req.method,
              req.method === 'GET' ? req.params : req.body,
              200,
              'Connexion en production'
            )
            res.render('connexion-prod');
          } else {
            var base64URL = new Buffer(url_redirect).toString('base64');
            // Pas de JSON, On redirige donc vers: XXX?url= + base64URL
            res.redirect('XXX' + '?url=' + base64URL);
            return 0;
          }
        })
      }
    }
  }
})

/*
  La route suivante n'est utilisée que pour le développement.
  Ça permet de simuler des données de session.
*/
app.post('/connecter', function (req, res) {
  /*
    En développement, on enregistre ce qui a été envoyé
  */
  console.log(req.body);
  let { nom, nigend, unite, user } = req.body;
  req.session.nom = nom;
  req.session.nigend = nigend;
  req.session.unite = unite;
  req.session.user = user;
  req.session.save();
  let stockRedis = {
    session: "sess:" + req.session.id,
    'user-agent': req.headers["user-agent"],
    date: Date.now(),
  }
  clientRedis.sadd("sessions:" + user, JSON.stringify(stockRedis));
  connecter(req);
  retour(req, res, 200, { id: req.sessionID });
})

/*
  Pour renvoyer à l'utilisateur connecté l'ensemble de ses connexions.
*/
app.get('/sessions', function (req, res) {
  clientRedis.smembers('sessions:'+req.session.user, (error, items) => {
    if (error) {
      retour(req, res, 500, error);
    } else {
      let retourSessions = items
        .map((x) => JSON.parse(x));
      retourSessions.forEach((s, i) => {
        // on enlève les sessions vieilles de plus de 24 heures
        const hier = new Date().getTime() - 24 * 60 * 60 * 1000;
        if (hier > s.date) {
          clientRedis.srem("sessions:" + req.session.user, JSON.stringify(s));
        } else {
          retourSessions[i].masession = retourSessions[i].session.includes(req.sessionID);
        }
      });
      retour(req, res, 200, retourSessions);
    }
  });
})

/*
  Pour détruire une connexion particulière.
*/
app.post('/deconnecter', function (req, res) {
  try {
    // la session concernée est dans le body
    const { connexion } = req.body;
    // on garde en mémoire s'il s'agit de la session active
    const masession = connexion.masession;
    /*
      On supprime l'information de savoir si c'est la session active.
      C'est pour avoir le JSON dans le même format qu'il y a dans la base Redis.
    */
    delete connexion.masession;
    /*
      on supprime au sein de la liste des connexions enregistrée
      la session désirée (donc juste à l'endroit où sont stockés la liste de
      sessions de chaque utilisateur, pas directement dans la liste des sessions)
    */
    clientRedis.srem(["sessions:" + req.session.user, JSON.stringify(connexion)], (err) => {
      if (err) {
        retour(req, res, 500, 'Erreur de destruction de session 1');
      } else {
        /*
          On supprime la session désirée dans la liste des sessions Redis
        */
        clientRedis.del(connexion.session, (e,result) => {
          if (e) {
            retour(req, res, 500, 'Erreur de destruction de session 2');
          } else {
            /*
              S'il s'agit de la session active, on la détruit proprement
            */
            if (masession) {
              const { nom, user, nigend, unite } = req.session;
              const sessionId = req.sessionID;
              req.session.destroy();
              tracer(
                nigend,
                unite,
                req.originalUrl,
                req.method,
                req.method === 'GET' ? req.params : req.body,
                200,
                { nom, user, nigend, unite, sessionId: sessionId }
              )
              res.send('Déconnecté');
            } else {
              // sinon on renvoie juste le fait que la sesion est détruite
              // dans la base Redis
              retour(req, res, 200, 'Session détruite');
            }
          }
        });
      }
    });
  } catch(e) {
    const { nom, user, nigend, unite } = req.session;
    const sessionId = req.sessionID;
    req.session.destroy();
    tracer(
      nigend,
      unite,
      req.originalUrl,
      req.method,
      req.method === 'GET' ? req.params : req.body,
      200,
      { nom, user, nigend, unite, sessionId: sessionId, erreur: e }
    )
    res.send('Déconnecté avec une erreur');
  }
})

/*
        FIN SESSIONS
*/

/*
        ROUTES
*/

let routes = {};
for (const type of ['','outils']) {
  fs
    .readdirSync(`./routes${type.length ? `/${type}` : ''}`, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(name => name.indexOf('.test.') < 0)
    .forEach(file => {
      const nomModule = file.split('.')[0];
      routes[`${type.length ? `${type}/` : ''}${nomModule}`] = require(`./routes${type.length ? `/${type}` : ''}/${nomModule}`).router;
    })
}
for (const route in routes) {
  app.use(`/${route}`, routes[route]);
}

/*
      FIN ROUTES
*/

/*
        APIs
*/

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API du site intranet de la transformation',
    version: '1.0.0',
  },
  tags: [
    {
      name: 'ADI',
      description: "Liste des API des Ateliers de l'Innovation",
    },
  ],
  servers: [
    {
      url: `${config.get('app.api')}`,
      description: `API du serveur de ${config.get('app.serveur')}`,
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./index.js','./routes/*/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*
      FIN APIs
*/

app.use(function (req, res, next) {
  if (req.get('origin') == config.get('app.url')
    || req.originalUrl.indexOf('/favicon.ico') == 0
    || req.originalUrl.indexOf('/fichiers/telechargement/') == 0
    || req.originalUrl.indexOf('/documents/groupe/') == 0
    || req.originalUrl.indexOf('/infosconnexion') == 0
    || req.originalUrl.indexOf('/outils') == 0
    || req.originalUrl.indexOf('/rss') == 0
  ) {
    next()
  }
  else {
    retour(req, res, 500, `Pas dans le CORS: ${req.get('origin')}`)
  }
});


// on renvoie quelque chose par défaut si une route n'est pas bonne
app.get('*', function(req, res){
  retour(req, res, 404, {
    erreur: '404_GET',
    msg: "Qu'est-ce que tu fais là, camarade?"
  })
});
app.post('*', function(req, res){
  retour(req, res, 404, {
    erreur: '404_POST',
    msg: 'Mais tu es passé par où???'
  })
});

// on lance l'application
const server = app.listen(PORT, function() {
  tracer(
    null,
    null,
    null,
    null,
    null,
    null,
    "[APP TRANSFO] LANCÉE SUR LE PORT: " + PORT
  )
})
