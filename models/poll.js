const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

PollSchema.pre('save', function (next) {
  this.answers = this.answers.filter((answer) => answer.answer !== null);

  next();
});

module.exports = mongoose.model('Poll', PollSchema);
