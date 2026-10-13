import { Request, Response } from "express";
import { createItem, deleteItem, getAllItems, updateItem } from "../services/itemService";


export const createItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const item = await createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create item" });
  }
};

export const getAllItemsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const items = await getAllItems();
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

export const updateItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const item = await updateItem(id, req.body);

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update item" });
  }
};

export const deleteItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteItem(id);

    if (!deleted) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete item" });
  }
};
