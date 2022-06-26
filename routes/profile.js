var express = require("express");
var router = express.Router();
const post = require("../models/ProjectPost");

const isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
};

/* GET home page. */
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        const yourPosts = await post
            .find({
                owner: req.session.username,
                privacy: "public",
            })
            .sort({ date_time: -1 });
        res.locals.posts = yourPosts;
        res.render("profile", { title: "your posts" });
    } catch (err) {}
});

module.exports = router;
