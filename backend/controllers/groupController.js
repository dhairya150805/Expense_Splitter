const Group = require("../models/GroupModel.js");
const User = require("../models/UserModel.js");

function normalize(str) {
  return (str || "").toString().trim().toLowerCase();
}

async function findUserByFlexible(identifier) {
  // Try by ObjectId, email, or full name (firstname lastname)
  if (!identifier) return null;
  const id = identifier.toString().trim();
  // Try by _id
  try {
    const byId = await User.findById(id);
    if (byId) return byId;
  } catch (_) {}
  // Email
  const byEmail = await User.findOne({ email: id });
  if (byEmail) return byEmail;
  // Full name
  const parts = id.split(/\s+/);
  if (parts.length >= 2) {
    const [firstname, ...rest] = parts;
    const lastname = rest.join(' ');
    const byName = await User.findOne({
      firstname: new RegExp(`^${firstname}$`, 'i'),
      lastname: new RegExp(`^${lastname}$`, 'i'),
    });
    if (byName) return byName;
  }
  return null;
}

async function findGroupByFlexible(identifier) {
  if (!identifier) return null;
  const id = identifier.toString().trim();
  // Try by _id
  try {
    const byId = await Group.findById(id);
    if (byId) return byId;
  } catch (_) {}
  // By name (case-insensitive)
  const byName = await Group.findOne({ groupName: new RegExp(`^${id}$`, 'i') });
  return byName;
}

const createGroup = async (req, res) => {
  try {
    const { groupName, userId } = req.body;

    const user = await findUserByFlexible(userId);

    if (!user) {
      return res.json({ message: "No user found" });
    }

    const members = [
      {
        userId: user._id,
        name: `${user.firstname} ${user.lastname}`,
      },
    ];

    const newGroup = new Group({
      groupName,
      members,
    });

    await newGroup.save();

    return res.json(newGroup);
  } catch (err) {
    console.error(err);
    return res.json("Server error");
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId, groupName, user, userId } = req.body; // accept multiple identifiers

    const group = await findGroupByFlexible(groupId || groupName);
    if (!group) return res.json("Group not found");

    const targetUser = await findUserByFlexible(user || userId);
    if (!targetUser) return res.json("User not found");

    // Prevent duplicate membership
    const already = group.members.some(m => m.userId.toString() === targetUser._id.toString());
    if (already) return res.json(group);

    const updatedGroup = await Group.findOneAndUpdate(
      { _id: group._id },
      { $push: { members: { userId: targetUser._id, name: `${targetUser.firstname} ${targetUser.lastname}` } } },
      { new: true }
    );

    return res.json(updatedGroup);
  } catch (err) {
    console.error(err);
    return res.json("Server error");
  }
};

// Build pairwise debts: for each expense, split among members; members (except payer) owe payer split amount
const groupSummary = async (req, res) => {
  try {
    const { idOrName } = req.params;
    const group = await findGroupByFlexible(idOrName);
    if (!group) return res.json({ message: 'Group not found' });

    const Expense = require('../models/ExpenseModel.js');
    const expenses = await Expense.find({ groupId: group._id });

    // Map pair debts: debts[debtorId][creditorId] = amount
    const debts = new Map();
    // Ensure unique members for fair splitting
    const members = Array.from(new Set(group.members.map(m => m.userId.toString())));

    for (const exp of expenses) {
      const payerId = exp.paidBy.toString();
      const split = (Number(exp.amount) || 0) / (members.length || 1);
      for (const m of members) {
        if (m === payerId) continue;
        const debtor = m;
        const creditor = payerId;
        if (!debts.has(debtor)) debts.set(debtor, new Map());
        const inner = debts.get(debtor);
        inner.set(creditor, (inner.get(creditor) || 0) + split);
      }
    }

    // Net debts between pairs cleanly
    const memberSet = new Set(members);
    const memberArr = Array.from(memberSet);
    const filtered = [];
    for (let i = 0; i < memberArr.length; i++) {
      for (let j = i + 1; j < memberArr.length; j++) {
        const a = memberArr[i];
        const b = memberArr[j];
        const aToB = debts.get(a)?.get(b) || 0;
        const bToA = debts.get(b)?.get(a) || 0;
        const diff = +(aToB - bToA).toFixed(2);
        if (diff > 0.009) filtered.push({ debtor: a, creditor: b, amount: diff });
        else if (diff < -0.009) filtered.push({ debtor: b, creditor: a, amount: +(-diff).toFixed(2) });
      }
    }

    // Attach names
    const users = await User.find({ _id: { $in: members } });
    const nameMap = new Map(users.map(u => [u._id.toString(), `${u.firstname} ${u.lastname}`]));

    const result = filtered
      .filter(e => e.amount > 0.009)
      .map(e => ({
        debtorId: e.debtor,
        debtorName: nameMap.get(e.debtor) || e.debtor,
        creditorId: e.creditor,
        creditorName: nameMap.get(e.creditor) || e.creditor,
        amount: e.amount,
      }));

    return res.json({ groupId: group._id, groupName: group.groupName, summary: result });
  } catch (err) {
    console.error(err);
    return res.json('Server error');
  }
};

// List groups; optional filter by member userId (query ?member=...)
const listGroups = async (req, res) => {
  try {
    const { member } = req.query;
    if (member) {
      const user = await findUserByFlexible(member);
      if (!user) return res.json([]);
      const groups = await Group.find({ 'members.userId': user._id });
      return res.json(groups);
    }
    const groups = await Group.find({});
    return res.json(groups);
  } catch (err) {
    console.error(err);
    return res.json('Server error');
  }
};

// Get group details by id or name
const getGroupDetails = async (req, res) => {
  try {
    const { idOrName } = req.params;
    const group = await findGroupByFlexible(idOrName);
    if (!group) return res.json({ message: 'Group not found' });
    return res.json(group);
  } catch (err) {
    console.error(err);
    return res.json('Server error');
  }
};

module.exports = { createGroup, addMember, groupSummary, listGroups, getGroupDetails };
