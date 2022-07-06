"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userInfoSchema = Schema({
    username: String,
    numFollowers: Number,
    numFollowing: Number,
    followers: [String], // usernames of followers
    following: [String], // usernames of following
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
