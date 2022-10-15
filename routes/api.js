const express = require('express');
const router = express.Router();

router.get('/api', (req, res, next) => {
  res.redirect('/api/polls');
});

// poll routes
router.get('/polls', (req, res) => {
  res.send('GET POLLS');
});

module.exports = router;
