var express = require("express");
var router = express.Router();
const axios = require("axios");

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.render("birds");
});

router.post("/", async (req, res, next) => {
    // res.json(req.body);
    const { country, pageNum } = req.body;
    res.locals.country = country;

    //tab of pages
    if (pageNum === undefined || pageNum === 1) {
        res.locals.pageNum = 0;
        res.locals.beginning = 0;
        res.locals.ending = 30;
    } else {
        res.locals.pageNum = pageNum;
        res.locals.beginning = pageNum * 30 - 30;
        res.locals.ending = pageNum * 30;
    }

    const response = await axios.get(
        "https://xeno-canto.org/api/2/recordings?query=cnt:" + country
    );
    res.locals.birds = response.data;
    res.render("birdsResult");
});

module.exports = router;
