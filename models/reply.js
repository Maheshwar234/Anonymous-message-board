const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  delete_password: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  created_on: {
    type: Date,
    default: new Date()
  },
  reported: {
    type: Boolean,
    default: false
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Thread' 
  }
})

// replySchema.methods.toJSON = function () {
//   const reply = this
//   const replyObject = reply.toObject()

//   delete replyObject.delete_password
//   delete replyObject.reported

//   return replyObject
// }

const Reply = mongoose.model('Reply', replySchema)

module.exports = Reply
