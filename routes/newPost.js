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
    res.render("newPost", { title: "post" });
});

// post new post object to db
router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const { title, image, description, link, collaborators, privacy } =
            req.body;
        const username = req.session.username;
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.toLocaleString("default", { month: "short" }));
        var yyyy = today.getFullYear();
        today = mm + " " + dd + ", " + yyyy;

        var post = new Post({
            owner: username,
            title: title,
            description: description,
            url: link,
            otherCollaborators: collaborators,
            privacy: privacy,
            date: today,
            date_time: Date.now(),
            likeCount: 0,
            repostCount: 0,
            commentCount: 0,
            relevance: {
                popular: false,
                following: false,
                tags: ["jazz", "electronic"],
            },
            whoLiked: [],
            whoReposted: [],
        });
        await Promise.all([
            post.save(),
            UserInfo.updateOne(
                { user: username },
                {
                    $inc: { numPosts: 1 },
                }
            ),
        ]);
        res.redirect("/profile");
    } catch (err) {
        next(err);
    }
});

module.exports = router;
