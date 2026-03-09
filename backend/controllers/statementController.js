import PDFDocument from "pdfkit";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import User from "../models/User.js";

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
      $or: [
        { timestamp: { $gte: fromDate, $lte: toDate } },
        { createdAt: { $gte: fromDate, $lte: toDate } },
      ],
    };

    if (accountName) {
      txFilter.fromAccount = accountName;
    }

    const transactions = await Transaction.find(txFilter).sort({
      timestamp: 1,
      createdAt: 1,
    });

    console.log("Statement preview filter:", txFilter);
    console.log("Transactions found:", transactions.length);

    const allAccounts = await Account.find({ user: userId });
    const currentTotalBalance = allAccounts.reduce(
      (sum, acc) => sum + Number(acc.balance || 0),
      0
    );

    const futureFilter = {
      user: userId,
      $or: [
        { timestamp: { $gt: toDate } },
        { createdAt: { $gt: toDate } },
      ],
    };

    if (accountName) {
      futureFilter.fromAccount = accountName;
    }

    const futureTransactions = await Transaction.find(futureFilter);

    const getSignedAmount = (tx) =>
      tx.type === "Credit" ? Number(tx.amount || 0) : -Number(tx.amount || 0);

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
        timestamp: tx.timestamp || tx.createdAt,
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

export const generateStatementPdf = async (req, res) => {
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
  $or: [
    { timestamp: { $gte: fromDate, $lte: toDate } },
    { createdAt: { $gte: fromDate, $lte: toDate } },
  ],
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
  $or: [
    { timestamp: { $gt: toDate } },
    { createdAt: { $gt: toDate } },
  ],
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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="suissbank-statement-${from}-${to}.pdf"`
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, 110).fill("#0f172a");

    doc.fillColor("#ffffff").fontSize(24).text("SuissBank", 40, 32);
    doc.fontSize(11).fillColor("#cbd5e1").text("Statement of Account", 40, 64);

    doc
      .fontSize(9)
      .text(`Generated: ${formatDate(new Date())}`, 400, 56, { align: "right" });

    doc.moveDown(3);

    doc.fillColor("#0f172a").fontSize(12).text("Account Holder", 40, 130);

    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(`Name: ${user.fullName || "N/A"}`, 40, 150)
      .text(`Email: ${user.email || "N/A"}`, 40, 166)
      .text(`Account Number: ${user.accountNumber || "N/A"}`, 40, 182)
      .text(`Statement Period: ${from} to ${to}`, 40, 198)
      .text(`Account Scope: ${accountName || "All Accounts"}`, 40, 214);

    const summaryTop = 255;
    const boxWidth = 120;
    const gap = 15;

    const summaryItems = [
      { label: "Opening Balance", value: formatCurrency(openingBalance) },
      { label: "Total Credits", value: formatCurrency(totalCredits) },
      { label: "Total Debits", value: formatCurrency(totalDebits) },
      { label: "Closing Balance", value: formatCurrency(closingBalance) },
    ];

    summaryItems.forEach((item, i) => {
      const x = 40 + i * (boxWidth + gap);
      doc.roundedRect(x, summaryTop, boxWidth, 58, 8).fillAndStroke("#e2e8f0", "#cbd5e1");

      doc
        .fillColor("#475569")
        .fontSize(8)
        .text(item.label, x + 10, summaryTop + 10, { width: boxWidth - 20 });

      doc
        .fillColor("#0f172a")
        .fontSize(11)
        .text(item.value, x + 10, summaryTop + 28, { width: boxWidth - 20 });
    });

    let y = 340;

    doc
      .fillColor("#0f172a")
      .fontSize(11)
      .text("Date", 40, y)
      .text("Description", 120, y)
      .text("Account", 300, y)
      .text("Type", 360, y)
      .text("Amount", 410, y)
      .text("Balance", 485, y);

    y += 18;
    doc.moveTo(40, y).lineTo(555, y).strokeColor("#cbd5e1").stroke();

    let runningBalance = openingBalance;

    if (transactions.length === 0) {
      y += 20;
      doc
        .fillColor("#64748b")
        .fontSize(10)
        .text("No transactions found for the selected date range.", 40, y);
    } else {
      for (const tx of transactions) {
        if (y > 740) {
          doc.addPage();
          y = 50;

          doc
            .fillColor("#0f172a")
            .fontSize(11)
            .text("Date", 40, y)
            .text("Description", 120, y)
            .text("Account", 300, y)
            .text("Type", 360, y)
            .text("Amount", 410, y)
            .text("Balance", 485, y);

          y += 18;
          doc.moveTo(40, y).lineTo(555, y).strokeColor("#cbd5e1").stroke();
        }

        runningBalance += getSignedAmount(tx);

        const amountText =
          tx.type === "Credit"
            ? `+${formatCurrency(tx.amount)}`
            : `-${formatCurrency(tx.amount)}`;

        y += 14;

        doc
          .fillColor("#334155")
          .fontSize(8)
          .text(formatDate(tx.timestamp), 40, y, { width: 75 })
          .text(tx.description || "-", 120, y, { width: 170, ellipsis: true })
          .text(tx.fromAccount || "Main Account", 300, y, { width: 55 })
          .text(tx.type, 360, y, { width: 40 })
          .text(amountText, 410, y, { width: 65 })
          .text(formatCurrency(runningBalance), 485, y, { width: 70 });

        y += 12;
        doc.moveTo(40, y).lineTo(555, y).strokeColor("#f1f5f9").stroke();
      }
    }

    const footerY = 780;
    doc
      .fontSize(8)
      .fillColor("#64748b")
      .text(
        "This statement is system-generated by SuissBank and reflects recorded transactions within the selected period.",
        40,
        footerY,
        { width: 515, align: "center" }
      );

    doc.end();
  } catch (err) {
    console.error("generateStatementPdf error:", err);
    return res.status(500).json({ message: "Failed to generate statement PDF." });
  }
};
