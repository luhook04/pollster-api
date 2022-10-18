const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/api/polls');
});

// user routes
router.post('/sign-up', user_controller);
router.post('/login', user_controller);
router.post('/logout', user_controller);

// poll routes
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
