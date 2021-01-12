const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-kexin:test123@cluster0.cp3cv.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);

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
        listTitle: "Today",
        listItems: foundItems,
      });
    }
  });
});

app.post("/", (req, res) => {
  let listName = req.body.list;
  let newItem = new Item({ name: req.body.newItem });
  if (listName === "Today") {
    newItem.save();
    console.log("redirect");
    res.redirect("/");
  } else {
    console.log(listName);
    List.findOne({ name: listName }, function (err, foundList) {
      if (!err) {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }
    });
  }
});

app.post("/delete", (req, res) => {
  let deletedItemId = req.body.checkbox;
  let listName = req.body.listName;
  console.log(deletedItemId);
  if (listName == "Today") {
    Item.findByIdAndRemove(deletedItemId, function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: deletedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", (req, res) => {
  const customerListName = _.capitalize(req.params.customListName);
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

app.listen(process.env.PORT || 3000, function () {
  console.log("Server running on http://localhost:3000/...");
});
