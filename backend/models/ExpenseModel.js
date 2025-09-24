const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group"},
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    amount: Number,                                        
    description: String,                   
    expenseDate: Date
  }
);

const Expense = mongoose.model("Expense", ExpenseSchema);
module.exports = Expense;
