const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  groupName: String,
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
    },
  ],
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
