const mongoose = require('mongoose');
const Thread = require('../models/thread');

// POST - Create new thread
const newThread = async (req, res) => {
  const board = req.params.board;

  if(!req.body.hasOwnProperty("board") || req.body.board === '') {
    req.body = { ...req.body, board: board}
  }

  try {
    await new Thread(req.body).save();
    res.redirect(301, `/b/${board}`);
  } catch(e) {
    res.status(400).send(e)
  }

};

// GET - Fetch all threads in a board
const getThreads = async (req, res) => {
  const board = req.params.board;
  if (!req.body.hasOwnProperty("board")) {
    req.body = {...req.body, board}
  };
  
  try {
    const threads = await Thread.find({board})
      // .select("-delete_password -reported")
      .populate({ 
        path: "replies",
        select: "-delete_password -reported",
        options: { 
          sort: { "created_on": -1 }
        }
      })
      .sort({ bumped_on: -1 })
      .limit(10)
      .slice("replies", 3);
    
    res.status(200).send(threads);
  } catch (e) {
    res.status(400).send(e);
  }
}

// PUT - Report a thread
const reportThread = async (req, res) => {
  const board = req.params.board;
  const threadId = req.body.thread_id;
  if (!req.body.hasOwnProperty("board")) {
    req.body = { ...req.body, board };
  }

  const threadExist = await Thread.exists({_id: threadId});
  if(!threadExist){
    return res.send("incorrect Thread ID provided")
  } 
  
  try {
    await Thread.findByIdAndUpdate(threadId, {reported: true});

    res.status(200).send("success")
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
}

// DELETE - Delete a thread
const deleteThread = async (req, res) => {
  const { thread_id, delete_password } = req.body;
  const board = req.params.board;
  if (!req.body.hasOwnProperty("board")) {
    req.body = { ...req.body, board}
  }

  try {
    const data = await Thread.findById(thread_id);
    if(!data) {
      return res.send('incorrect Thread ID provided')
    } else if(data.delete_password !== delete_password) {
      return res.send('incorrect password')
    } else {
      data.remove();
      res.send('success');
    }
  } catch (e) {
    res.status(400).send(e);
  }
}

module.exports = {
  newThread,
  getThreads,
  reportThread,
  deleteThread
}
