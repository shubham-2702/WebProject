// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
//const date=require(__dirname+"/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("Public"));
mongoose.connect("mongodb+srv://shubham-2427:shubham2702@cluster0.js6gc.mongodb.net/todoListDB");
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Get Up Early and Fresh YourSelf "
});
const item2 = new Item({
  name: "Have some Bread and Tea "
});
const item3 = new Item({
  name: "Let's Get Start your Work (Coding Or Web Development)"
});

const defaultArray = [item1, item2, item3];

const ListSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", ListSchema);

app.get("/", function(req, res) {
  // const day=date.getDate();
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultArray, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Sucessfully inserted Default items to database");
          }
        });
        res.redirect("/");
      }
      res.render("list", {
        listTitle: "Today",
        newListItem: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultArray
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Display the list present
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items
        });
      }
    }
  });


  //list.save();
});

app.post("/", function(req, res) {
  const itemName = req.body.Item;
  const listName = req.body.button;
  const item = new Item({
    name: itemName
  });
  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

  // if(req.body.button==="WorkList")
  // {
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  //
  // }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;
  //  console.log(checkedItemId);
  if(listName==="Today")
  {
    Item.deleteOne({
      _id: checkedItemId
    }, function(err) {
      if (!err) {
        console.log("Sucessfully deleted the checked item !!");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items :{_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }

});

// app.get("/about", function(req, res) {
//   res.render("about");
// });
//
// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "WorkList",
//     newListItem: workItems
//   });
// });
app.post("/work", function(req, res) {
  console.log(req.body);
  const item = req.body.Item;
  workItems.push(item);
  res.redirect("/work");
});
app.listen(process.env.PORT||3000, function() {
  console.log("Running on port 3000");
});
