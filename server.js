const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const { hash, compare } = require("bcrypt");
const { z } = require("zod");
require("dotenv").config();
const { auth, signToken } = require("./auth");
const { UserModel, TodoModel } = require("./db");

const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION;
mongoose
  .connect(DATABASE_CONNECTION)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB:", err));

const app = express();
app.use(express.json());
app.use(morgan("dev"));

const userSchema = {
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().min(3).max(320).email(),
  password: z.string().trim().min(8).max(100),
};

const todoBodySchema = z.object({
  title: z.string().trim().max(50),
  done: z.boolean().default(false),
});

const signupBodySchema = z.object(userSchema);
const loginBodySchema = z.object({
  email: userSchema.email,
  password: userSchema.password,
});

app.get("/todos", auth, async function (req, res) {
  const userId = req.userId;
  const todos = await TodoModel.find({
    userId,
  });

  res.status(200).json({
    status: "success",
    data: todos,
  });
});

app.post("/todo", auth, async function (req, res) {
  const userId = req.userId;
  console.log(userId);
  const parsedBody = todoBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      status: "fail",
      message: parsedBody.error.issues,
    });
    return;
  }

  let newTodo;
  try {
    newTodo = await TodoModel.create({ ...parsedBody.data, userId });
  } catch (err) {
    res.status(200).json({
      status: "fail",
      err,
    });
    return;
  }

  res.status(200).json({
    status: "success",
    newTodo,
  });
});

app.delete("/todo", auth, async function (req, res) {
  const userId = req.userId;
  const todoId = req.body.id;

  const deletedTodo = await TodoModel.findOneAndDelete({
    userId,
    _id: todoId,
  });

  if (!deletedTodo) {
    res.status(400).json({
      status: "fail",
      message: "Todo does not exist",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    data: deletedTodo,
  });
});

app.post("/signup", async function (req, res) {
  const parsedBody = signupBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      status: "fail",
      message: parsedBody.error.issues,
    });
    return;
  }

  const hashedPassword = await hash(parsedBody.data.password, 5);
  let newUser;

  try {
    newUser = await UserModel.create({
      ...parsedBody.data,
      password: hashedPassword,
    });
  } catch (err) {
    if (err.code == 11000) {
      res.status(400).json({
        status: "fail",
        message: "An account with this email already exists",
      });
      return;
    }
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
  const parsedBody = loginBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      status: "fail",
      message: parsedBody.error.issues,
    });
    return;
  }

  const { email, password } = parsedBody.data;

  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(401).json({
      status: "fail",
      message: "User does not exist",
    });
    return;
  }

  const passwordIsCorrect = await compare(password, user.password);

  if (!passwordIsCorrect) {
    res.status(401).json({
      status: "fail",
      message: "Incorrect password",
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
