var express = require("express");
const { ObjectId } = require("mongodb");
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

// get other user's profile page
router.get("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const username = req.params["username"];
        // return all user posts marked public
        const usersPosts = await Posts.find({
            owner: username,
            privacy: "public",
        }).sort({ date_time: -1 });
        // return count of user posts marked public
        const count = await Posts.find({
            owner: username,
            privacy: "public",
        }).count();
        //return details about user ie numPosts, followers, following
        const userDetails = await UserInfo.findOne({
            username: username,
        });
        res.locals.userDetails = userDetails;
        res.locals.posts = usersPosts;
        res.locals.whichType = "public";
        res.locals.count = count;
        res.locals.otherUsername = username;
        res.locals.username = req.session.username;
        res.render("otherUser", { title: username });
    } catch (err) {}
});

// post method when asking for different type of user's post ie private, liked, reposted
router.post("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const username = req.params["username"];
        var type = req.body.postType;
        const userDetails = await UserInfo.findOne({
            username: username,
        });
        // search users public, liked, or reposted posts
        if (type === "public") {
            const usersPosts = await Posts.find({
                owner: username,
                privacy: req.body.postType,
            }).sort({ date_time: -1 });
            const count = await Posts.find({
                owner: username,
                privacy: req.body.postType,
            }).count();
            res.locals.posts = usersPosts;
            res.locals.count = count;
        } else {
            // if user wants their liked posts
            if (type === "liked") {
                const likedPosts = await UserInfo.findOne({
                    username: username,
                });
                var obj_id = [];
                for (var i = 0; i < likedPosts.likedPosts.length; i++) {
                    var obj = new ObjectId(likedPosts.likedPosts[i]);
                    obj_id.push(obj);
                }
                const posts = await Posts.find({
                    _id: { $in: obj_id },
                }).sort({ date_time: -1 });
                const count = await Posts.find({
                    _id: { $in: obj_id },
                }).count();
                res.locals.posts = posts;
                res.locals.count = count;
                // if user wants their reposted posts
            } else {
                const repostedPosts = await UserInfo.findOne({
                    username: username,
                });
                var obj_id = [];
                for (var i = 0; i < repostedPosts.repostedPosts.length; i++) {
                    var obj = new ObjectId(repostedPosts.repostedPosts[i]);
                    obj_id.push(obj);
                }
                const posts = await Posts.find({
                    _id: { $in: obj_id },
                }).sort({ date_time: -1 });
                const count = await Posts.find({
                    _id: { $in: obj_id },
                }).count();
                res.locals.posts = posts;
                res.locals.count = count;
            }
        }
        res.locals.userDetails = userDetails;
        res.locals.whichType = req.body.postType;
        res.locals.otherUsername = username;
        res.locals.username = req.session.username;
        res.render("otherUser", { title: username });
    } catch (err) {}
});

// follow
router.post("/:username/follow", isLoggedIn, async (req, res, next) => {
    try {
        const otherUser = req.params["username"];
        const user = req.session.username;
        await UserInfo.updateOne(
            { username: otherUser },
            {
                $push: { followers: user },
                $inc: { numFollowers: 1 },
            }
        );
        await UserInfo.updateOne(
            { username: user },
            {
                $push: { following: otherUser },
                $inc: { numFollowing: 1 },
            }
        );
    } catch (err) {}
});

// unfollow
router.post("/:username/unfollow", isLoggedIn, async (req, res, next) => {
    try {
        const otherUser = req.params["username"];
        const user = req.session.username;
        await UserInfo.updateOne(
            { username: otherUser },
            {
                $pull: { followers: user },
                $inc: { numFollowers: -1 },
            }
        );
        await UserInfo.updateOne(
            { username: user },
            {
                $pull: { following: otherUser },
                $inc: { numFollowing: -1 },
            }
        );
    } catch (err) {}
});

module.exports = router;
