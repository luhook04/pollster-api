const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 20 },
  password: { type: String, required: true },
  profilePicUrl: {
    type: String,
    required: true,
    default: 'alien.svg',
  },
  polls: [{ type: Schema.Types.ObjectId, ref: 'Poll' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

UserSchema.virtual('url').get(function () {
  return '/api/users/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
