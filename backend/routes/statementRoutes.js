import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  previewStatement,
  generateStatementPdf,
} from "../controllers/statementController.js";

const router = express.Router();

router.get("/preview", authMiddleware, previewStatement);
router.get("/pdf", authMiddleware, generateStatementPdf);

export default router;
