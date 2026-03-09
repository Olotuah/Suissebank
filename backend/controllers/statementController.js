import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import User from "../models/User.js";

const getSignedAmount = (tx) => {
  return tx.type === "Credit" ? Number(tx.amount || 0) : -Number(tx.amount || 0);
};

export const previewStatement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to, accountName } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "from and to dates are required." });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "Invalid date range." });
    }

    toDate.setHours(23, 59, 59, 999);

    const user = await User.findById(userId).select("fullName email accountNumber");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const txFilter = {
      user: userId,
      timestamp: { $gte: fromDate, $lte: toDate },
    };

    if (accountName) {
      txFilter.fromAccount = accountName;
    }

    const transactions = await Transaction.find(txFilter).sort({ timestamp: 1, createdAt: 1 });

    const allAccounts = await Account.find({ user: userId });
    const currentTotalBalance = allAccounts.reduce(
      (sum, acc) => sum + Number(acc.balance || 0),
      0
    );

    const futureFilter = {
      user: userId,
      timestamp: { $gt: toDate },
    };

    if (accountName) {
      futureFilter.fromAccount = accountName;
    }

    const futureTransactions = await Transaction.find(futureFilter);

    const netAfterEnd = futureTransactions.reduce(
      (sum, tx) => sum + getSignedAmount(tx),
      0
    );

    const closingBalance = currentTotalBalance - netAfterEnd;

    const netWithinPeriod = transactions.reduce(
      (sum, tx) => sum + getSignedAmount(tx),
      0
    );

    const openingBalance = closingBalance - netWithinPeriod;

    const totalCredits = transactions
      .filter((tx) => tx.type === "Credit")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const totalDebits = transactions
      .filter((tx) => tx.type === "Debit")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    let runningBalance = openingBalance;

    const rows = transactions.map((tx) => {
      runningBalance += getSignedAmount(tx);
      return {
        _id: tx._id,
        timestamp: tx.timestamp,
        description: tx.description,
        fromAccount: tx.fromAccount || "Main Account",
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        runningBalance,
      };
    });

    return res.json({
      user,
      from,
      to,
      accountScope: accountName || "All Accounts",
      openingBalance,
      totalCredits,
      totalDebits,
      closingBalance,
      transactions: rows,
    });
  } catch (err) {
    console.error("previewStatement error:", err);
    return res.status(500).json({ message: "Failed to load statement preview." });
  }
};
