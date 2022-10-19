const { body, validationResult } = require('express-validator');
const Poll = require('../models/poll');

exports.create_poll = [
  body('question')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Question is required for poll'),
  body('option1')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Must provide two options'),
  body('option2')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Must provide two options'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), data: req.body });
    }
    const poll = new Poll({
      author: req.user,
      question: req.body.question,
      answers: [{ answer: req.body.option1 }, { answer: req.body.option2 }],
    });
    poll.save((err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ poll });
    });
  },
];
