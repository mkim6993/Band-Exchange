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
        const id = req.body.id;
        // remove all instance of postID in users' likedPosts and repostedPosts
        await UserInfo.updateMany(
            {},
            {
                $pull: { likedPosts: id, repostedPosts: id },
            }
        );
        // decrement numPosts from UserInfo
        await UserInfo.updateOne(
            { username: req.session.username },
            { $inc: { numPosts: -1 } }
        );
        await Post.deleteOne({ _id: id });
        res.redirect("/profile");
    } catch (err) {
        next(err);
    }
});

//post info for editor
router.post("/editor", async (req, res, next) => {
    try {
        const id = req.body.id;
        const post = await Post.findOne({
            _id: ObjectId(id),
        });
        const postJson = JSON.stringify(post);
        res.send(postJson);
    } catch (err) {
        next(err);
    }
});

// save changes from editor
router.post("/saveEdit", async (req, res, next) => {
    try {
        console.log("here");
        const {
            boring,
            editTitle,
            editImage,
            editDes,
            editLink,
            editCollab,
            editPrivacy,
        } = req.body;
        await Post.updateOne(
            { _id: ObjectId(boring) },
            {
                $set: {
                    title: editTitle,
                    description: editDes,
                    url: editLink,
                    otherCollaborators: editCollab,
                    privacy: editPrivacy,
                },
            }
        );
        res.redirect("/profile");
    } catch (err) {
        next(err);
    }
});

// unfollow person
router.post("/unfollow", isLoggedIn, async (req, res, next) => {
    try {
        const { unfollowingUser } = req.body;
        const user = req.session.username;

        await UserInfo.updateOne(
            { username: user },
            {
                $inc: { numFollowing: -1 },
                $pull: { following: unfollowingUser },
            }
        );
        await UserInfo.updateOne(
            { username: unfollowingUser },
            {
                $inc: { numFollowers: -1 },
                $pull: { followers: user },
            }
        );
    } catch (err) {
        next(err);
    }
});

router.post("/follow", isLoggedIn, async (req, res, next) => {
    try {
        const { followingUser } = req.body;
        const user = req.session.username;

        await UserInfo.updateOne(
            { username: user },
            {
                $inc: { numFollowing: 1 },
                $push: { following: followingUser },
            }
        );
        await UserInfo.updateOne(
            { username: followingUser },
            {
                $inc: { numFollowers: 1 },
                $push: { followers: user },
            }
        );
    } catch (err) {
        next(err);
    }
});

// use to get array of followers and following
//
// get list of followers
// router.get("/following", isLoggedIn, async (req, res, next) => {
//     try {
//         var info = await UserInfo.findOne({
//             username: req.session.username,
//         });
//         res.send(info.following);
//     } catch (err) {
//         next(err);
//     }
// });

// //get list of following
// router.get("/followers", isLoggedIn, async (req, res, next) => {
//     try {
//         var info = await UserInfo.findOne({
//             username: req.session.username,
//         });
//         res.send(info.followers);
//     } catch (err) {
//         next(err);
//     }
// });

module.exports = router;
