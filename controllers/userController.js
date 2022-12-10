require('dotenv').config();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Poll = require('../models/poll');

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
    .withMessage('Password must be 5 characters long')
    .trim(),
  body('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({
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
          if (err) {
            return next(err);
          }
          res.status(200).json({ user });
        });
      });
    }
  },
];

exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res
        .status(404)
        .json({ message: 'Something went wrong', user: user });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(err);
      }
      const body = { _id: user._id, username: user.username };
      const token = jwt.sign({ user: body }, process.env.SECRET_KEY);
      return res.status(200).json({ body, token });
    });
  })(req, res);
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/api/login');
};

exports.send_friend_request = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user._id == req.user._id) {
      return res.status(404).json({ err: 'No friending yourself' });
    }
    if (user.friendRequests.includes(req.user._id)) {
      return res.status(404).json({ err: 'No sending multiple requests' });
    }
    user.friendRequests.push(req.user._id);
    const savedUser = await user.save();
    return res.status(200).json({ user: savedUser });
  } catch (err) {
    return next(err);
  }
};

exports.decline_friend_request = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const request = req.params.requestId;
    if (user._id != req.user._id && request != req.user._id) {
      return res.status(404).json({
        err: 'You are not authorized to delete this request',
      });
    }
    const updatedFriendReqs = user.friendRequests.filter(
      (item) => item._id != request
    );
    user.friendRequests = updatedFriendReqs;
    const updatedUser = await user.save();
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    return next(err);
  }
};

exports.accept_friend_request = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const request = req.params.requestId;
    const newFriend = await User.findById(request);
    if (user._id != req.user._id) {
      return res
        .status(404)
        .json({ err: 'You are not authorized to accept this request' });
    }
    const updatedFriendReqs = user.friendRequests.filter(
      (item) => item._id != request
    );
    user.friendRequests = updatedFriendReqs;
    user.friends.push(newFriend._id);
    const updatedUser = await user.save();
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    return next(err);
  }
};

exports.delete_friend = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const friend = await User.findById(req.params.friendId);
    if (user._id != req.user._id) {
      return res
        .status(404)
        .json({ err: 'You are not authorized to delete this friend' });
    }
    const updatedFriends = user.friends.filter((item) => {
      item._id != friend._id;
    });
    user.friends = updatedFriends;
    const updatedUser = await user.save();
    return res.status(200).json({ updatedUser });
  } catch (err) {
    return next(err);
  }
};

exports.get_user = async (req, res, next) => {
  try {
    if (req.params.id == req.user._id) {
      const user = await User.findById(req.params.userId)
        .populate('friends', '-password')
        .populate('friendRequests', '-password')
        .populate('polls', { sort: { timestamp: -1 } });
      return res.status(200).json({ user });
    } else {
      const user = await User.findById(req.params.userId).populate('polls', {
        sort: { timestamp: -1 },
      });
      return res.status(200).json({ user });
    }
  } catch (err) {
    return next(err);
  }
};

exports.get_users = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
};

exports.delete_account = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user._id != req.params.userId) {
      return res.status(404).json({
        err: `You don't have authorization to delete this account`,
      });
    }
    const deletePosts = await Poll.deleteMany({ author: req.user._id });
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    const otherUsers = await User.find({ _id: { $ne: req.user._id } });

    for (user of otherUsers) {
      const updatedFriends = user.friends.filter((id) => id !== req.user._id);
      const updatedFriendReqs = user.friendRequests.filter(
        (id) => id !== req.user._id
      );
      user.friends = updatedFriends;
      user.friendRequests = updatedFriendReqs;
      await user.save();
    }
    if (deletedUser) {
      req.logout();
      res.redirect('/');
      return res.status(200).json({
        msg: `User ${req.params.userId} deleted`,
      });
    }
  } catch (err) {
    return next(err);
  }
};
