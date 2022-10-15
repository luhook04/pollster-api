const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = mongoose.Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    question: { type: String, required: true },
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    timestamp: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Poll', PollSchema);
