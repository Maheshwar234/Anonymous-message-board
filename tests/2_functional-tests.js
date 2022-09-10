var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const board = "testBoard";
const cors = require('cors');
require("dotenv").config();
var express     = require('express');
var app = express();
app.useexpress
app.use(cors());
let threadId;
let thread2Id;
let replyId;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {

      test('Post a new thread to board should redirect to b/{board}', (done) => {
        chai.request(server)
          .post('/api/threads/testboard')
          .send({
            board: board,
            text: 'Test Thread One',
            delete_password: 'jello'})
          .redirects(0)
          .end((err, res) => {
            assert.equal(res.status, 301)

            done();
          })
      });

      test('Post a second new thread to board should redirect to b/{board}', (done) => {
        chai.request(server)
          .post('/api/threads/testboard')
          .send({
            board: board,
            text: 'Test Thread Two',
            delete_password: 'jello'})
          .redirects(0)
          .end((err, res) => {
            assert.equal(res.status, 301)

            done();
          })
      });

    });

    suite('GET', function() {

      test('Fetch threads from board', (done) => {
        chai.request(server)
          .get('/api/threads/testBoard')
          .send()
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body[0].board, "testBoard")
            assert.isArray(res.body[0].replies)
            assert.notProperty(res.body[0], "delete_password");
            assert.notProperty(res.body[0], "reported");
            assert.isBelow(res.body.length, 11);
            threadId = res.body[0]._id;
            thread2Id = res.body[1]._id;

            done();
          }, 9500)
      })

    });

    suite('DELETE', function() {

      test('Cannot delete thread with incorrect password', (done) => {
        chai.request(server)
          .delete('/api/threads/testBoard')
          .send({
            board: board,
            thread_id: threadId,
            delete_password: "wrong"})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, "incorrect password");

            done();
          }, 9500)
      });

      test('Delete thread from board', (done) => {
        chai.request(server)
          .delete('/api/threads/testBoard')
          .send({
            board: board,
            thread_id: threadId,
            delete_password: "jello"})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, "success");

            done();
          }, 9500)
      });

    })

    suite('PUT', function() {

      test('Cannot update reported value to true with incorrect thead id', (done) => {
        chai.request(server)
          .put('/api/threads/testBoard')
          .send({
            board: board,
            thread_id: '100000000000000000000001'})
          .end((err, res) => {
             assert.equal(res.status, 200)
            assert.equal(res.text, 'incorrect Thread ID provided');

            done();
          })
      })

      test('Update reported value to true with thead id', (done) => {
        chai.request(server)
          .put('/api/threads/testBoard')
          .send({
            board: board,
            thread_id: thread2Id})
          .end((err, res) => {
             assert.equal(res.status, 200)
            assert.equal(res.text, 'success');

            done();
          })
      })

    })

  }); //end of thread tests

  suite('API ROUTING FOR /api/replies/:board', function() {

    suite('POST', function() {
      test('Post a new reply to a thread should redirect to b/{board}/{thread_id}', (done) => {
        chai.request(server)
          .post('/api/replies/testBoard')
          .send({
            board: board,
            thread_id: thread2Id,
            text: 'Add a new reply',
            delete_password: 'orange'})
          .redirects(0)
          .end((err, res) => {
            assert.equal(res.status, 301);

            done();
          })
      })

    })

    suite('GET', function() {
      test('Fetch entire thread with all replies excluding the reported and delete_password fields', (done) => {
        chai.request(server)
          .get('/api/replies/testBoard')
          .query({thread_id: thread2Id})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.notProperty(res.body.replies[0], "delete_password");
            assert.notProperty(res.body.replies[0], "reported");

            replyId = res.body.replies[0]._id;

            done();
          })
      })

    })

    suite('PUT', function() {

      test('Cannot update reported value to true with incorrect reply id', (done) => {
        chai.request(server)
          .put('/api/replies/testBoard')
          .send({
            board: board,
            thread_id: thread2Id,
            reply_id: '100000000000000000000001'})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'incorrect Reply ID provided');

            done();
          })
      });

      test('Update reported value to true with reply ID', (done) => {
        chai.request(server)
          .put('/api/replies/testBoard')
          .send({
            board: board,
            thread_id: thread2Id,
            reply_id: replyId})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success');

            done();
          })
      });

    })

    suite('DELETE', function() {
      test('Cannot delete reply with incorrect password', (done) => {
        chai.request(server)
          .delete('/api/replies/testBoard')
          .send({
            board: board,
            thread_id: thread2Id,
            reply_id: replyId,
            delete_password: "bogus"})
            .end((err, res) => {
              assert.equal(res.status, 200)
              assert.equal(res.text, "incorrect password");

              done();
          }, 9500)
      })

      test('Delete a reply from the thread', (done) => {
        chai.request(server)
          .delete('/api/replies/testBoard')
          .send({
            board: board,
            thread_id: thread2Id,
            reply_id: replyId,
            delete_password: "orange"})
          .end( (err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");

            done();
          }, 9500)
      });

    });


  });

});
