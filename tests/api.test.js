require('../config/passport');
const app = require('./app');
const request = require('supertest');
const seedDB = require('../seed');
const User = require('../models/user');
let id;
let token;
let dummy;

import {
  initializeMongoServer,
  disconnectMongoServer,
} from '../config/mongoConfigTesting';

beforeAll(async () => {
  await initializeMongoServer();
  await seedDB();
  const user = await request(app).post('/api/sign-up').type('form').send({
    username: 'jojo',
    password: 'basketball',
    'confirm-password': 'basketball',
  });

  const res = await request(app)
    .post('/api/login')
    .type('form')
    .send({ username: 'jojo', password: 'basketball' });
  token = res.body.token;
  id = res.body.body._id;
});

afterAll(async () => {
  await disconnectMongoServer();
});

describe('POST /sign-up', () => {
  it('should throw 404 error and not add the user', async () => {
    const res = await request(app).post('/api/sign-up').type('form').send({
      username: 'jojo',
      password: 'bas',
      'confirm-password': 'bas',
    });
    expect(res.statusCode).toBe(404);
    const users = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer ' + token);
    expect(users.body.users.length).toBe(31);
  });

  it('should add the user to the database', async () => {
    const res = await request(app)
      .post('/api/sign-up')
      .type('form')
      .send({
        username: 'joja',
        password: 'basketball',
        'confirm-password': 'basketball',
      })
      .expect('Content-Type', /json/);
    expect(res.statusCode).toBe(200);
    const users = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer ' + token);
    expect(users.body.users.length).toBe(32);
  });
});

describe('POST /login', () => {
  it('should not log in the user', async () => {
    const res = await request(app)
      .post('/api/login')
      .type('form')
      .send({ username: 'joj', password: 'basketball' });
    expect(res.statusCode).toBe(404);
  });
  it('should log in the user', async () => {
    const user = await request(app).post('/api/sign-up').type('form').send({
      username: 'jojo',
      password: 'basketball',
      'confirm-password': 'basketball',
    });
    const res = await request(app)
      .post('/api/login')
      .type('form')
      .send({ username: 'jojo', password: 'basketball' });
    expect(res.statusCode).toBe(200);
    expect(res.body.body.username).toBe('jojo');
    expect(res.body.token).toBeDefined();
  });
});

describe('GET /users/:userId', () => {
  it('should get the above user', async () => {
    const res = await request(app)
      .get(`/api/users/${id}`)
      .set('Authorization', 'Bearer ' + token);

    expect(res.body.user.username).toBe('jojo');
  });

  it('should not not return the user if no authorization', async () => {
    const res = await request(app).get(`/api/users/${id}`);
    expect(res.statusCode).toBe(401);
  });
});

describe('PUT /users/:userId/requests', () => {
  it('send a friend request to the user from the correct user', async () => {
    dummy = await User.findOne({ username: 'testuser1' });

    const res = await request(app)
      .put(`/api/users/${dummy._id}/requests`)
      .set('Authorization', 'Bearer ' + token);

    expect(res.body.user.friendRequests).toContain(id);
  });

  it('does not send another friend request from the same user', async () => {
    const res = await request(app)
      .put(`/api/users/${dummy._id}/requests`)
      .set('Authorization', 'Bearer ' + token);
    expect(res.body.err).toMatch(/multiple/);
  });
});

describe('DELETE /users/:userId/requests/:requestId', () => {
  it('declines the friend request', async () => {
    const res = await request(app)
      .delete(`/api/users/${dummy._id}/requests/${id}`)
      .set('Authorization', 'Bearer ' + token);
    expect(res.body.user.friendRequests).not.toContain(id);
  });
});
