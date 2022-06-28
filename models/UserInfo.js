"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userInfoSchema = Schema({
    username: String,
    numFollowers: Number,
    numFollowing: Number,
    followers: [String],
    following: [String],
    numPosts: Number,
    description: String,
    likedPosts: [String],
    repostedPosts: [String],
});

module.exports = mongoose.model("UserInfo", userInfoSchema);
