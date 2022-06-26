"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = Schema({
    username: String,
    passphrase: String,
    age: String,
    numPosts: Number,
});

module.exports = mongoose.model("userItem", userSchema);
