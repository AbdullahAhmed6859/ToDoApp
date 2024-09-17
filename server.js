const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const { auth, signToken } = require("./auth");
const { UserModel, ToDoModel } = require("./db");

const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION;
mongoose
  .connect(DATABASE_CONNECTION)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB:", err));

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.get("/todos", auth, async function (req, res) {
  const userId = req.userId;
  const todos = await ToDoModel.find({
    userId,
  });
  res.status(200).json({
    message: "Hello",
  });
});

app.post("/todo", auth, function (req, res) {});
app.delete("todo", auth, function (req, res) {});

app.post("/signup", async function (req, res) {
  const { name, email, password } = req.body;

  if (!(name && email && password)) {
    res.status(400).json({
      status: "fail",
      message: "Email, Password or username is missing",
    });
    return;
  }

  const newUser = await UserModel.create({
    name,
    email,
    password,
  });

  if (!newUser) {
    res.status(403).json({
      status: "fail",
      message: "There seems to be a problem",
    });
    return;
  }

  const token = signToken(newUser);

  res.status(201).json({
    status: "success",
    token,
  });
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "fail",
      message: "Please provide an email and password",
    });
    return;
  }

  const user = await UserModel.findOne({ email, password });

  if (!user) {
    res.status(401).json({
      status: "fail",
      message: "Incorrect email or password",
    });
    return;
  }

  const token = signToken(user);

  res.status(200).json({
    status: "success",
    token,
  });
});

app.listen(3000);
console.log("Listening on port 3000...");
