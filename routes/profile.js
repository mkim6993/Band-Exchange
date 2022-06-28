var express = require("express");
const { ObjectId } = require("mongodb");
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

/* GET home page. */
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        // return all user posts marked public
        const yourPosts = await Post.find({
            owner: req.session.username,
            privacy: "public",
        }).sort({ date_time: -1 });
        // return count of user posts marked public
        const count = await Post.find({
            owner: req.session.username,
            privacy: "public",
        }).count();
        //return details about user ie numPosts, followers, following
        const userDetails = await UserInfo.findOne({
            username: req.session.username,
        });
        res.locals.userDetails = userDetails;
        res.locals.posts = yourPosts;
        res.locals.whichType = "public";
        res.locals.count = count;
        res.render("profile", { title: "your posts" });
    } catch (err) {
        next(err);
    }
});

// post method when asking for different type of user's post ie private, liked, reposted
router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const yourPosts = await Post.find({
            owner: req.session.username,
            privacy: req.body.postType,
        }).sort({ date_time: -1 });
        const count = await Post.find({
            owner: req.session.username,
            privacy: req.body.postType,
        }).count();
        const userDetails = await UserInfo.findOne({
            username: req.session.username,
        });
        res.locals.userDetails = userDetails;
        res.locals.posts = yourPosts;
        res.locals.whichType = req.body.postType;
        res.locals.count = count;
        res.render("profile", { title: "your posts" });
    } catch (err) {}
});

//post method to like posts
router.post("/like", async (req, res, next) => {
    try {
        var id = req.body.postId;
        if (req.body.option === "l") {
            await Post.updateOne(
                { _id: ObjectId(id) },
                { $inc: { likeCount: 1 } }
            );
        } else {
            await Post.updateOne(
                { _id: ObjectId(id) },
                { $inc: { likeCount: -1 } }
            );
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
