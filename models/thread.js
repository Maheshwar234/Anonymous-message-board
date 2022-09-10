const mongoose = require('mongoose');
const Reply = require('./reply');

const threadSchema = new mongoose.Schema({
  board: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true
  },
  delete_password: {
    type: String,
    required: true,
    trim: true
  },
  created_on: {
    type: Date,
    default: new Date()
  },
  bumped_on: {
    type: Date,
    default: new Date()
  },
  reported: {
    type: Boolean,
    default: false
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply'
  }],
  reply_count: {
    type: Number,
    default: 0
  }
})

// Remove 'delete_password' and 'reported' in client response
threadSchema.methods.toJSON = function () {
  const thread = this
  const threadObject = thread.toObject()

  delete threadObject.delete_password
  delete threadObject.reported

  return threadObject
}

// Delete all associated replies when thread is begin deleted
threadSchema.pre("remove", async function(next) {
  const thread = this;
  await Reply.deleteMany({
    thread: thread._id
  });
  next();
});


const Thread = mongoose.model('Thread', threadSchema)

module.exports = Thread
