var express = require("express");
var router = express.Router();
const Post = require("../models/ProjectPost");
const UserInfo = require("../models/UserInfo");

const isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
};

// return newPost page
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        res.render("search", { title: "search" });
    } catch (err) {}
});

module.exports = router;
