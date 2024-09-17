const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
    trim: true,
    minlength: [3, "A name must be atleast 3 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    trim: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    trim: true,
  },
});

const todoSchema = new Schema(
  {
    userId: {
      type: Schema.ObjectId,
      ref: "users",
      required: [true, "A todo must belong to a user"],
    },
    title: {
      type: String,
      required: [true, "A todo must have a title"],
      maxLength: [50, "A todo can not be more than 50 characters"],
      trim: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const UserModel = mongoose.model("users", userSchema);
const TodoModel = mongoose.model("todos", todoSchema);

module.exports = {
  UserModel,
  TodoModel,
};
