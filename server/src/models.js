import mongoose from "mongoose";
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissions: { type: [String], default: "general" },
  stocks: { type: [String], default: [] },
  cryptocurrencies: { type: [String], default: [] }
});

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model("User", UserSchema);

export default User;
