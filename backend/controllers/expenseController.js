const Group = require("../models/GroupModel.js");
const User = require("../models/UserModel.js");
const Expense = require("../models/ExpenseModel.js");

async function findUserByFlexible(identifier) {
  if (!identifier) return null;
  const id = identifier.toString().trim();
  try { const byId = await User.findById(id); if (byId) return byId; } catch (_) {}
  const byEmail = await User.findOne({ email: id });
  if (byEmail) return byEmail;
  const parts = id.split(/\s+/);
  if (parts.length >= 2) {
    const [firstname, ...rest] = parts; const lastname = rest.join(' ');
    const byName = await User.findOne({ firstname: new RegExp(`^${firstname}$`, 'i'), lastname: new RegExp(`^${lastname}$`, 'i') });
    if (byName) return byName;
  }
  return null;
}

async function findGroupByFlexible(identifier) {
  if (!identifier) return null;
  const id = identifier.toString().trim();
  try { const byId = await Group.findById(id); if (byId) return byId; } catch (_) {}
  const byName = await Group.findOne({ groupName: new RegExp(`^${id}$`, 'i') });
  return byName;
}

const addExpense = async (req, res) => {
  try {
    const { groupId, groupName, paidBy, amount, description, expenseDate } = req.body;

    const group = await findGroupByFlexible(groupId || groupName);
    if (!group) {
      return res.json("Group not found");
    }

    const payer = await findUserByFlexible(paidBy);
    if (!payer) return res.json("Payer not found");

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.json("Invalid amount");
    }

    const newExpense = new Expense({
      groupId: group._id,
      paidBy: payer._id,
      amount: numericAmount,
      description,
      expenseDate: expenseDate || new Date(),
    });

    await newExpense.save();

    // De-duplicate member ids in case of accidental duplicates in existing data
    const memberIds = Array.from(new Set(group.members.map(m => m.userId.toString())));
    const totalmember = memberIds.length;
    if (totalmember === 0) {
      return res.json("No members in this group");
    }

    const splitAmount = numericAmount / totalmember;

    for (let id of memberIds) {
      const user = await User.findById(id);
      if (user) {
        if (user._id.toString() === payer._id.toString()) {
          user.balance = (user.balance || 0) + (numericAmount - splitAmount);
        } else {
          user.balance = (user.balance || 0) - splitAmount;
        }
        await user.save();
      }
    }

    return res.json({
      message: "Expense added and split successfully",
      expense: newExpense,
    });
  } catch (err) {
    console.error(err);
    return res.json("Server error");
  }
};

module.exports = { addExpense };
