const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);
app.use('/api', apiRouter);

describe('POST api/sign-up');
