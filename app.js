const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const getDate = require(__dirname + "/date.js");
console.log(getDate);
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

// Mongoose Schemas
const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemSchema);
const listSchema = { name: String, items: [itemSchema] };
const List = mongoose.model("List", listSchema);

const item1 = new Item({ name: "Welcome to your To-Do list!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });
const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  let day = getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully insert default items into the database!");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: day,
        listItems: foundItems,
      });
    }
  });
});

app.post("/", (req, res) => {
  let newItem = new Item({ name: req.body.newItem });
  newItem.save();
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  let deletedItemId = req.body.checkbox;
  console.log(deletedItemId);
  Item.findByIdAndRemove(deletedItemId, function (err) {
    if (!err) {
      console.log("Successfully deleted!");
      res.redirect("/");
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customerListName = req.params.customListName;
  List.findOne({ name: customerListName }, function (err, foundList) {
    if (err) {
      console.log(err);
    } else if (!foundList) {
      const list = new List({ name: customerListName, items: defaultItems });
      list.save();
      res.redirect("/" + customerListName);
    } else {
      res.render("list", {
        listTitle: customerListName,
        listItems: foundList.items,
      });
    }
  });
});

app.post("/work", (req, res) => {
  let newWorkItem = req.body.newItem;
  workItems.push(newWorkItem);
  res.redirect("/work");
});

app.listen(3000, function () {
  console.log("Server running on http://localhost:3000/...");
});
