import { Router } from "express";
import {
  createItemController,
  getAllItemsController,
  updateItemController,
  deleteItemController,
} from "../controllers/itemController";

const router = Router();

router.post("/items", createItemController);
router.get("/items", getAllItemsController);
router.put("/items/:id", updateItemController);
router.delete("/items/:id", deleteItemController);
export default router;