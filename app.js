//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


let app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

///////////// mongoDB setup //////////////

// Establish a mongoDB Client and create a databse in mongoDB
mongoose.connect("mongodb+srv://demon-skd:Grbbs03AS!@deviloper-skd.rvxxu.mongodb.net/blogDB",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

// Creating collection schema
const postSchema = mongoose.Schema({
  title: String,
  content: String
});
const pageSchema = mongoose.Schema({
  title: String,
  content: String
});

// Creating collection model
const Post = mongoose.model("Post", postSchema);
const Page = mongoose.model("Page", pageSchema);

// Creating new documents for the 'posts' collection
const home = new Page({
  title: "Home",
  content: homeStartingContent
});
const about = new Page({
  title: "About",
  content: aboutContent
});
const contact = new Page({
  title: "Contact",
  content: contactContent
});

homePage = home;
aboutPage = about;
contactPage = contact;

app.get("/", function(req, res) {
  Page.findOne({title: "Home"}, function(err, foundPage) {
    if (err) console.log(err);
    else {
      if (!foundPage) {
        Page.insertMany(homePage, function(err) {
          if (err) console.log(err);
          else {
            console.log("Successfully added home content.");
            res.redirect("/");
          }
        })
      } else {
        //Find all posts in the database
        Post.find({}, function(err, posts) {
          if (err) console.log(err);
          else {
            res.render("home", {
              startContent: homeStartingContent,
              allPosts: posts
            });
          }
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  Page.findOne({title: "About"}, function(err, foundPage) {
    if (err) console.log(err);
    else {
      if (!foundPage) {
        Page.insertMany(aboutPage, function(err) {
          if (err) console.log(err);
          else {
            console.log("Successfully added about content.");
            res.redirect("/about");
          }
        })
      } else {
        res.render("about", {
          aboutSectionContent: contactContent
        });
      }
    }
  });
});

app.get("/contact", function(req, res) {
  Page.findOne({title: "Contact"}, function(err, foundPage) {
    if (err) console.log(err);
    else {
      if (!foundPage) {
        Page.insertMany(contactPage, function(err) {
          if (err) console.log(err);
          else {
            console.log("Successfully added contact content.");
            res.redirect("/contact");
          }
        })
      } else {
        res.render("contact", {
          contactSectionContent: contactContent
        });
      }
    }
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
})

app.get("/posts/:postName", function(req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  Post.find({}, function(err, posts) {
    posts.forEach(function(post) {
      const storedTitle = _.lowerCase(post.title);
      if (requestedTitle === storedTitle) {
        res.render("post", {
          requestedPost: post
        });
      } else {
        console.log("Match not found!");
      }
    });
  });
});


app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  Post.findOne({title: req.body.postTitle}, function(err, foundPost) {
    if (err) console.log(err);
    else {
      if (!foundPost) {
        console.log("Post is new!");
        post.save(function(err) {
          if (!err) {
            res.redirect("/");
          } else console.log(err);
        });
      } else {
        console.log("Post already present!");
        const error = new Post({
          title: "Sorry!",
          content: "A post is already presnt in the database with the same TITLE."
        });
        res.render("post", {
          requestedPost: error
        });
      }
    }
  });
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
