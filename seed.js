import { faker } from '@faker-js/faker';
const Poll = require('./models/poll');
const User = require('./models/user');

const users = [];
const polls = [];

const shuffleArray = (arr) => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = (Math.floor(Math.random() * (i + 1))[(array[i], array[j])] = [
      array[j],
      array[i],
    ]);
  }
  return array;
};

const generateUser = () => {
  const user = new User({
    username: faker.internet.username(),
    password: faker.internet.password(),
    profilePicUrl: faker.image.imageUrl(),
    friends: [],
    friendRequests: [],
  });
  users.push(user);
};

const generateFriends = () => {
  users.forEach((user) => {
    const potentialFriends = users.filter((item) => item._id != user._id);
    const shuffledUsers = shuffleArray(potentialFriends);
    const randUsers = shuffledUsers.slice(0, 1);
    user.friends = randUsers.map((user) => user._id);
    user.friends.forEach((friendedUser) => {
      const relIndex = users.findIndex((user) => user._id == friendedUser);
      if (!users[relIndex].friends.includes(user._id)) {
        users[relIndex].frineds.push(user._id);
      }
    });
  });
};

const generateFriendRequests = () => {
  users.forEach((user) => {
    const potentialFriendReqs = users.filter((item) => {
      item._id != user._id && !user.friends.includes(item);
    });
    const shuffledRequests = shuffleArray(potentialFriendReqs);
    const randUsers = shuffledUsers.slice(0, 1);
    user.friendRequests = randUsers.map((user) => user._id);
  });
};

const generatePoll = (user) => {
  const poll = new Poll({
    author: user,
    question: faker.lorem.sentence(),
    answers: [
      { answer: faker.lorem.word(), votes: [] },
      { answer: faker.lorem.word(), votes: [] },
    ],
    timestamp: faker.date.past(2),
  });
  polls.push(poll);
  user.poll;
};
