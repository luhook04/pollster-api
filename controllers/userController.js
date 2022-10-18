require('dotenv').config();
const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('exress-validator');
const jwt = require('jsonwebtoken');

exports.signup = [
  body('username', 'Username required')
    .trim()
    .custom(async (username) => {
      try {
        const existingUsername = await User.findOne({
          username: username,
        });
        if (existingUsername) {
          throw new Error('Sorry, username already in use');
        }
      } catch (err) {
        throw new Error(err);
      }
    }),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be 5 characters long'),
  body('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        username: req.body.username,
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
        });
        user.save((err, user) => {
          if (err) return next(err);
          res.json({ user });
        });
      });
    }
  },
];
