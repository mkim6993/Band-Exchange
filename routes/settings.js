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
router.get("/", isLoggedIn, function (req, res, next) {
    res.render("settings", { title: "settings" });
});

module.exports = router;
