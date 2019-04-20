var express = require("express");
var hbs = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", hbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/", function (req, res) {
    res.redirect("/scrape");
})

app.get("/scrape", function (req, res) {
    axios.get("https://www.bonappetit.com/recipes").then(function (response) {
        var $ = cheerio.load(response.data);

        $("li.cards__li").each(function (i, element) {
            var result = {};

            result.headline = $(element).find(".card-hed").children("a").text();
            result.summary = $(element).find("p.card-copy").text();
            result.url = "https://www.bonappetit.com/" + $(element).find(".card-hed").children("a").attr("href");

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
        res.redirect("/all");
    });
})

app.get("/all", function (req, res) {
    db.Article.find({}, function (err, results) {
        res.render("index", { articles: results });
    })
})

app.get("/article/:id", function (req, res) {
    db.Article.findById({ _id: req.params.id }).populate("comments")
        .then(function (results) {
            console.log(results);
            res.render("artwcomm", { article: results });
        })
})

app.put("/comment/:id", function (req, res) {
    db.Comment.deleteOne({ _id: req.params.id }, function (err) {
        if (err) throw err;
    })
})

app.post("/article/:id", function (req, res) {
    db.Comment.create(req.body).then(function (dbComment) {
        db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { comments: dbComment._id } }, { new: true })
            .then(function (data) {
                res.json(data)
            })
    }).catch(function (err) {
        res.json(err);
    });
})

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
})