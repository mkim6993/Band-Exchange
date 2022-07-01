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
    likedPosts: [String], // ids of posts
    repostedPosts: [String], //ids of posts
    profilePic: String,
    notifications: {
        collab: Boolean,
        newFans: Boolean,
        postComment: Boolean,
        replies: Boolean,
    },
    blocked: [String],
});

module.exports = mongoose.model("UserInfo", userInfoSchema);
