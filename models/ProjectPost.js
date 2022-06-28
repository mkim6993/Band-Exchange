"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var projectPostSchema = Schema({
    owner: String,
    title: String,
    description: String,
    url: String, // url to project
    otherCollaborators: String,
    privacy: String,
    date: String, // formatted date
    date_time: Date, // technical date for organizing
    likeCount: Number,
    repostCount: Number,
    commentCount: Number,
    relevance: {
        popular: Boolean,
        following: Boolean,
        tags: [String],
    },
    whoLiked: [String], // ids of people who liked the post
    whoReposted: [String], // ids of people who reposted
});

module.exports = mongoose.model("ProjectPost", projectPostSchema);
