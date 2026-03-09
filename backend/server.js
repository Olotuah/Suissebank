import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactions.js';
import adminSetupRoutes from "./routes/adminSetupRoutes.js";
import accountRoutes from './routes/account.js';
import userRoutes from "./routes/userRoutes.js";
import authRoutes from './routes/auth.js';
import statementRoutes from "./routes/statementRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import tempAdminRoute from "./routes/tempAdminRoute.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://suissbank.com",
  "https://www.suissbank.com",
  "https://swift-bank-app.vercel.app",
  "https://suissebank.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/transfers", transferRoutes);
app.use("/api/admin", adminSetupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/statements", statementRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/accounts', accountRoutes);
app.use("/api", tempAdminRoute);
app.use("/api/transactions", transactionRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error(err));
