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

        res.send("Scrape done");
    });
})

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
})