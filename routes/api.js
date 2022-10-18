const express = require('express');
const router = express.Router();

// poll routes
router.get('/', (req, res) => {
  res.redirect('/api/polls');
});

router.get('/polls', (req, res) => {
  res.send('GET POLLS');
});

router.post('/polls', (req, res) => {
  res.send('POST POLLS');
});

router.delete('/polls/:pollId', (req, res) => {
  res.send('Delete Poll');
});

module.exports = router;
