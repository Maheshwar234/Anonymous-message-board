'use strict';

var expect = require('chai').expect;
const db = require('../db/mongoose');
const ThreadController = require('../controllers/ThreadController');
const ReplyController = require('../controllers/ReplyController');


module.exports = function (app) {

  app.route('/api/threads/:board')
    .post(ThreadController.newThread)
    .get(ThreadController.getThreads)
    .put(ThreadController.reportThread)
    .delete(ThreadController.deleteThread);

  app.route('/api/replies/:board')
    .post(ReplyController.newReply)
    .get(ReplyController.getReplies)
    .put(ReplyController.reportReply)
    .delete(ReplyController.deleteReply);

};
