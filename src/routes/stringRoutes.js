import express from "express";
import * as stringController from "../controllers/stringController.js";
const router = express.Router();

router.get("/", stringController.fetchStrings);
router.get(
  "/filter-by-natural-language",
  stringController.fetchStringsByNaturalLang
);
router.get("/:value", stringController.fetchStringByValue);
router.post("/", stringController.createString);
router.delete("/:value", stringController.deleteString);

export default router;
