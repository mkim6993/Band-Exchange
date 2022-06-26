var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const layouts = require("express-ejs-layouts");
const auth = require("./routes/auth");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

var app = express();

// *********************************************************** //
//  Connecting to the database
// *********************************************************** //
const mongoose = require("mongoose");
const mongodb_URI =
    "mongodb+srv://cs_sj:BrandeisSpr22@cluster0.kgugl.mongodb.net/minsungKim?retryWrites=true&w=majority";

mongoose.connect(mongodb_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("we are connected!!!");
});

var store = new MongoDBStore({
    uri: mongodb_URI,
    collection: "mySessions",
});

// Catch errors
store.on("error", function (error) {
    console.log(error);
});

// *********************************************************** //
//  Loading routes
// *********************************************************** //
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var followingRouter = require("./routes/following");
var newPostRouter = require("./routes/newPost");
var profileRouter = require("./routes/profile");

// *********************************************************** //
//  Express sessions
// *********************************************************** //
app.use(
    require("express-session")({
        secret: "This is a secret",
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        },
        store: store,
        // Boilerplate options, see:
        // * https://www.npmjs.com/package/express-session#resave
        // * https://www.npmjs.com/package/express-session#saveuninitialized
        resave: true,
        saveUninitialized: true,
    })
);

// middleware for login
const isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
};

// *********************************************************** //
// view engine setup
// *********************************************************** //
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(auth);

app.use(layouts);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/following", followingRouter);
app.use("/newPost", newPostRouter);
app.use("/profile", profileRouter);

// *********************************************************** //
// Server error handling
// *********************************************************** //
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
