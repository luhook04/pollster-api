const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = mongoose.Schema(
  {
    answer: { type: String, required: true },
    votes: { type: Number, default: 0 },
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Answer', AnswerSchema);
