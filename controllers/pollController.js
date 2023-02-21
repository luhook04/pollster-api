const { body, validationResult } = require('express-validator');
const Poll = require('../models/poll');
const User = require('../models/user');

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
  body('option3').trim().optional(),
  body('option4').trim().optional(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), data: req.body });
    }
    try {
      const poll = new Poll({
        author: req.user._id,
        question: req.body.question,
        answers: [
          { answer: req.body.option1 },
          { answer: req.body.option2 },
          { answer: req.body.option3 || null },
          { answer: req.body.option4 || null },
        ],
      });
      const savedPoll = await poll.save();
      const user = await User.findById(req.user._id);
      user.polls.push(savedPoll._id);
      const updatedUser = await user.save();
      if (savedPoll) {
        return res.status(200).json({ poll: savedPoll, user: updatedUser });
      }
    } catch {
      return next(err);
    }
  },
];

exports.get_polls = async (req, res, next) => {
  try {
    const loggedUser = await User.findById(req.user._id);
    const polls = await Poll.find({
      author: [req.user._id, ...loggedUser.friends],
    })
      .select('-id')
      .populate('author', '-password');
    polls.sort((a, b) => b.timestamp - a.timestamp);

    return res.status(200).json({ polls });
  } catch (err) {
    next(err);
  }
};

exports.vote = async (req, res, next) => {
  try {
    let poll = await Poll.findById(req.params.pollId).populate(
      'author',
      '-password'
    );
    if (!poll) {
      return res.status(404).json({ err: 'Post not found' });
    }

    poll.answers.map((answer) => {
      if (answer.votes.includes(req.user._id)) {
        return res.status(404).json({ message: "Can't vote twice" });
      }
    });

    // if (poll.answers.id(req.params.answerId).votes.includes(req.user._id)) {
    //   return res.status(404).send({ message: "Can't vote twice" });
    // }

    if (poll.author._id == req.user._id) {
      return res.status(404).send({ message: "Can't vote on your own poll" });
    }
    let newVote = req.user._id;
    let answer = await poll.answers.id(req.params.answerId);
    answer.votes.push(newVote);
    poll = await poll.save();
    return res.status(200).json({ poll, answer, newVote });
  } catch (err) {
    next(err);
  }
};

exports.delete_poll = async (req, res, next) => {
  try {
    const selectedPoll = await Poll.findById(req.params.pollId);
    const author = await User.findById(req.user._id);
    author.polls.pull(selectedPoll._id);

    await author.save();

    if (!selectedPoll) {
      return res.status(404).json({ err: 'Poll not found' });
    }
    if (selectedPoll.author != req.user._id) {
      return res
        .status(401)
        .json({ message: 'You may only delete your own polls' });
    }
    const deletedPost = await Poll.findByIdAndDelete(req.params.pollId);
    if (deletedPost) {
      return res.status(200).json({
        msg: `Poll ${req.params.pollId} deleted`,
        author,
      });
    }
  } catch (err) {
    next(err);
  }
};
