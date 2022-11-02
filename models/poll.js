const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const AnswerSchema = new Schema({
  answer: {
    type: String,
  },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const PollSchema = mongoose.Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    answers: [AnswerSchema],
    question: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PollSchema.virtual('date').get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

PollSchema.pre('save', function (next) {
  this.answers = this.answers.filter((answer) => answer.answer !== null);

  next();
});

module.exports = mongoose.model('Poll', PollSchema);
