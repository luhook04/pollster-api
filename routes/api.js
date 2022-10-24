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
router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  user_controller.get_users
);
router.put(
  '/users/:userId/requests',
  passport.authenticate('jwt', { session: false }),
  user_controller.send_friend_request
);
router.delete(
  '/users/:userId/requests/:requestId',
  passport.authenticate('jwt', { session: false }),
  user_controller.decline_friend_request
);

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
  '/polls/:pollId/answers/:answerId',
  passport.authenticate('jwt', { session: false }),
  poll_controller.vote
);
router.delete(
  '/polls/:pollId',
  passport.authenticate('jwt', { session: false }),
  poll_controller.delete_poll
);

module.exports = router;
