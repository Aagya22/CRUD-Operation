import { Router } from "express";
import {
  createItemController,
  getAllItemsController,
} from "../controllers/itemController";

const router = Router();

router.post("/items", createItemController);
router.get("/items", getAllItemsController);

export default router;