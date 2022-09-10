const mongoose = require('mongoose');
const Thread = require('../models/thread');
const Reply = require('../models/reply');

// POST - Create a reply to a thread
const newReply = async (req, res) => {
  const board = req.params.board;
  if (!req.body.hasOwnProperty("board")) {
    req.body = {...req.body, board}
  };

  const threadId = req.body.thread_id;

  const reply = new Reply ({
    ...req.body,
    thread: threadId
  });

  try {
    const newReply = await reply.save();
    await Thread.findByIdAndUpdate(
    threadId,
    {
      $push: { replies: newReply._id },
      $inc: {reply_count: 1},
      $set: {bumped_on: newReply.created_on}
    }, 
    {new: true}
  );
  res.redirect(301, `/b/${board}/${threadId}`)
  } catch (e) {
    res.status(500).send(e);
  }
}

// GET - Fetch all replies to a thread
const getReplies = async (req, res) => {
  const threadId = req.query.thread_id;
  
  const board = req.params.board;
  if (!req.query.hasOwnProperty("board")) {
    req.query = {...req.query, board}
  };
  try {
      // const replies = await Reply.find({ thread: threadId }.populate({
      //   path: "thread",
      //   select: "-delete_password -reported",
      //   options: { sort: { created_on: -1 }}
      //   })
      const thread = await Thread.findById(threadId)
      // .select("-delete_password -reported")
      .populate({ 
        path: "replies",
        select: "-delete_password -reported",
        options: { 
          sort: { "created_on": -1 }
        }
      });
    
    res.status(200).send(thread)
  } catch (e) {
    res.status(400).send(e);
  }
}

// PUT - Report a reply
const reportReply = async (req, res) => {
  const board = req.params.board;
  const { thread_id, reply_id } = req.body;
  if (!req.body.hasOwnProperty("board")) {
    req.body = { ...req.body, board };
  }
  
  const replyExist = await Reply.exists({_id: reply_id});
  if(!replyExist){
    return res.send("incorrect Reply ID provided")
  }

  const threadExist = await Thread.exists({_id: thread_id});
  if(!threadExist){
    return res.send("incorrect Thread ID provided")
  } 

  const match = await Reply.exists({_id: reply_id, thread: thread_id}) 
  if(!match){
    return res.send("incorrect credentials provided")
  }

  try {
    await Reply.findByIdAndUpdate(reply_id, {$set: {reported: true}});

    res.status(200).send("success")
  } catch (e) {
    res.status(400).send(e);
  }
}

// DELETE - Delete a reply
const deleteReply = async (req, res) => {
  const { reply_id, delete_password } = req.body;
  const board = req.params.board;
  if (!req.body.hasOwnProperty("board")) {
    req.body = { ...req.body, board}
  }

  try {
    const data = await Reply.findById(reply_id);
    if(!data) {
      return res.send('incorrect Reply ID provided')
    } else if(data.delete_password !== delete_password) {
      return res.send('incorrect password')
    } else {
      data.text = '[deleted]';
      data.save();
      res.send('success');
    }
  } catch (e) {
    res.status(400).send(e);
  }
}

module.exports = {
  newReply,
  getReplies,
  reportReply,
  deleteReply
}
