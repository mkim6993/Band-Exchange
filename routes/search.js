var express = require("express");
var router = express.Router();
const Posts = require("../models/ProjectPost");
const UserInfo = require("../models/UserInfo");

const isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
};

// return newPost page
router.post("/", async (req, res, next) => {
    try {
        const search = req.body.searchBar;
        if (search !== "") {
            const posts = await Posts.find({
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ],
            });
            res.locals.posts = posts;
            res.locals.lastSearch = search;
            res.locals.name = req.session.username;
        } else {
            res.locals.posts = {};
            res.locals.lastSearch = "";
            res.locals.name = req.session.username;
        }
        res.render("search", { title: "search" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
