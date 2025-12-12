//we are using mongoose dependency to have easy understanding in db 
const mongoose = require("mongoose");

/*creating a user schema that will allow them to log in and have their info in a database
it will include name (as a string)
password (as a string)
avatar WIP 
bio WIP
*/
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: 
    {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);