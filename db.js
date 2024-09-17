const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
    trim: true,
    minlength: [3, "A name must be atleast 3 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
  },
});

userSchema.methods.isPasswordCorrect = async (
  candidatePassword,
  userPassword
) => await bcrypt.compare(candidatePassword, userPassword);

const todoSchema = new Schema({
  userId: Schema.ObjectId,
  title: {
    type: String,
    required: [true, "A todo must have a title"],
  },
  done: {
    type: Boolean,
    default: false,
  },
});

const UserModel = mongoose.model("users", userSchema);
const ToDoModel = mongoose.model("todos", todoSchema);

module.exports = {
  UserModel,
  ToDoModel,
};
