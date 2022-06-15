const Router = require('express-promise-router')
const db = require('../db')
const { retour } = require('../utils/retour')
const router = new Router()
module.exports = { router }

router.post('/', async (req, res) => {
  const { id, type, vote }  = req.body
  const nigend = req.session.nigend;
  let rows;
  ({ rows } = await db.query(`
    SELECT *
    FROM votes
    WHERE votant = $1
      AND type = $2
      AND idvote = $3`,
    [
      nigend,
      type,
      id
    ]))
  if (rows.length > 0) {
    if (rows[0].vote == vote) {
      // on supprime le vote
      ({ rows } = await db.query(`
        DELETE FROM votes
          WHERE idvote = $1
          AND type = $2
          AND votant = $3;`,
        [
          id,
          type,
          nigend
        ]))
      retour(req, res, 200, '')
    } else {
      // on change le vote
      ({ rows } = await db.query(`
        UPDATE votes
          SET vote = $1, date = current_timestamp
          WHERE idvote = $2 AND type = $3 AND votant = $4;`,
        [
          vote,
          id,
          type,
          nigend
        ]))
      retour(req, res, 200, vote)
    }
  } else {
    // on ajoute le vote
    ({ rows } = await db.query(`
      INSERT INTO votes (type, idVote, votant, vote)
        VALUES ($1, $2, $3, $4);`,
      [
        type,
        id,
        nigend,
        vote
      ]))
    retour(req, res, 200, vote)
  }
})

router.get('/verif/:type/:id', async (req, res) => {
  const { id, type } = req.params
  const nigend = req.session.nigend;
  const { rows } = await db.query(`
    SELECT *
    FROM votes
    WHERE votant = $1
      AND type = $2
      AND idvote = $3`, [
        nigend,
        type,
        id
      ])
  retour(req, res, 200, rows)
})

router.get('/:type/:id', async (req, res) => {
  const { id, type } = req.params
  const { rows } = await db.query(`
    SELECT count(*) AS nombre, vote FROM votes
    WHERE idvote = $1 AND type = $2
    GROUP BY vote`, [
      id,
      type
    ])
  retour(req, res, 200, rows)
})
