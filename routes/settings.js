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
        const userInfo = await UserInfo.findOne({
            username: req.session.username,
        });
        res.locals.userInfo = userInfo;
        res.render("settings", { title: "settings" });
    } catch (err) {}
});

// modify user settings in db
router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const {
            settingDescription,
            showRequests,
            showComments,
            showPostComments,
            showReplies,
        } = req.body;
        const notifications = {
            collab: Boolean,
            newFans: Boolean,
            postComment: Boolean,
            replies: Boolean,
        };
        if (showRequests === undefined) {
            notifications.collab = false;
        } else {
            notifications.collab = true;
        }
        if (showComments === undefined) {
            notifications.newFans = false;
        } else {
            notifications.newFans = true;
        }
        if (showPostComments === undefined) {
            notifications.postComment = false;
        } else {
            notifications.postComment = true;
        }
        if (showReplies === undefined) {
            notifications.replies = false;
        } else {
            notifications.replies = true;
        }
        await UserInfo.updateOne(
            { username: req.session.username },
            {
                $set: {
                    description: settingDescription,
                    notifications: notifications,
                },
            }
        );
        res.redirect("/profile");
    } catch (err) {}
});

module.exports = router;
