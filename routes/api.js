const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');
const poll_controller = require('../controllers/pollController');
const passport = require('passport');
const poll = require('../models/poll');

router.get('/', (req, res) => {
  res.redirect('/api/polls');
});

// user register/login routes
router.post('/sign-up', user_controller.signup);
router.post('/login', user_controller.login);
router.post('/logout', user_controller.logout);

// user routes

// poll routes
router.post(
  '/polls',
  passport.authenticate('jwt', { session: false }),
  poll_controller.create_poll
);
router.get(
  '/polls',
  passport.authenticate('jwt', { session: false }),
  poll_controller.get_polls
);
router.get(
  '/mypolls',
  passport.authenticate('jwt', { session: false }),
  poll_controller.get_my_polls
);
router.put(
  '/polls/:pollId',
  passport.authenticate('jwt', { session: false }),
  poll_controller.vote
);
router.delete('/polls/:pollId', (req, res) => {
  res.send('Delete Poll');
});

module.exports = router;
