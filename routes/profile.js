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
        var type = req.body.postType;
        const userDetails = await UserInfo.findOne({
            username: req.session.username,
        });
        // if user wants public or private posts
        if (type === "public" || type === "private") {
            const yourPosts = await Post.find({
                owner: req.session.username,
                privacy: req.body.postType,
            }).sort({ date_time: -1 });
            const count = await Post.find({
                owner: req.session.username,
                privacy: req.body.postType,
            }).count();
            res.locals.posts = yourPosts;
            res.locals.count = count;
        } else {
            // if user wants their liked posts
            if (type === "liked") {
                const likedPosts = await UserInfo.findOne({
                    username: req.session.username,
                });
                var obj_id = [];
                for (var i = 0; i < likedPosts.likedPosts.length; i++) {
                    var obj = new ObjectId(likedPosts.likedPosts[i]);
                    obj_id.push(obj);
                }
                const posts = await Post.find({
                    _id: { $in: obj_id },
                }).sort({ date_time: -1 });
                const count = await Post.find({
                    _id: { $in: obj_id },
                }).count();
                res.locals.posts = posts;
                res.locals.count = count;
                // if user wants their reposted posts
            } else {
                const repostedPosts = await UserInfo.findOne({
                    username: req.session.username,
                });
                var obj_id = [];
                for (var i = 0; i < repostedPosts.repostedPosts.length; i++) {
                    var obj = new ObjectId(repostedPosts.repostedPosts[i]);
                    obj_id.push(obj);
                }
                const posts = await Post.find({
                    _id: { $in: obj_id },
                }).sort({ date_time: -1 });
                const count = await Post.find({
                    _id: { $in: obj_id },
                }).count();
                res.locals.posts = posts;
                res.locals.count = count;
            }
        }
        res.locals.userDetails = userDetails;
        res.locals.whichType = req.body.postType;
        res.render("profile", { title: "your posts" });
    } catch (err) {}
});

//post method to like posts
router.post("/like", async (req, res, next) => {
    try {
        var id = req.body.postId;
        // if user likes the post
        if (req.body.option === "l") {
            await Post.updateOne(
                { _id: ObjectId(id) },
                {
                    $inc: { likeCount: 1 },
                    $push: { whoLiked: req.session.username },
                }
            );
            await UserInfo.updateOne(
                { username: req.session.username },
                { $push: { likedPosts: id } }
            );
        } else {
            // if user unlikes the post
            console.log("unliked: remove like");
            await Post.updateOne(
                { _id: ObjectId(id) },
                {
                    $inc: { likeCount: -1 },
                    $pull: { whoLiked: req.session.username },
                }
            );
            console.log("unliked: remove from user liked");
            await UserInfo.updateOne(
                { username: req.session.username },
                { $pull: { likedPosts: id } }
            );
        }
    } catch (err) {
        next(err);
    }
});

// handles repost on the profile page
router.post("/repost", async (req, res, next) => {
    try {
        var id = req.body.postId;
        // if the user reposts the post
        if (req.body.option === "r") {
            await Post.updateOne(
                { _id: ObjectId(id) },
                {
                    $inc: { repostCount: 1 },
                    $push: { whoReposted: req.session.username },
                }
            );
            await UserInfo.updateOne(
                { username: req.session.username },
                { $push: { repostedPosts: id } }
            );
        } else {
            // if the user unreposts the post
            await Post.updateOne(
                { _id: ObjectId(id) },
                {
                    $inc: { repostCount: -1 },
                    $pull: { whoReposted: req.session.username },
                }
            );
            await UserInfo.updateOne(
                { username: req.session.username },
                { $pull: { repostedPosts: id } }
            );
        }
    } catch (err) {
        next(err);
    }
});

// delete post
router.post("/delete", async (req, res, next) => {
    try {
    } catch (err) {
        next(err);
    }
});

module.exports = router;
