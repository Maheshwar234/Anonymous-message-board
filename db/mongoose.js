const mongoose = require('mongoose')
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind("console", "connection error"));
db.once("open", () =>
  console.log("Connection successfully established to database!")
);

module.exports = db;
