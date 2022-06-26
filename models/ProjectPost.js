"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var projectPostSchema = Schema({
    owner: String,
    title: String,
    description: String,
    url: String,
    otherCollaborators: String,
    privacy: String,
    date: Date,
    date_time: Date,
    likeCount: Number,
    repostCount: Number,
    commentCount: Number,
    relevance: {
        popular: Boolean,
        following: Boolean,
        tags: [String],
    },
});

module.exports = mongoose.model("ProjectPost", projectPostSchema);
