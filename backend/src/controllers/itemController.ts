import { Request, Response } from "express";
import { createItem, getAllItems } from "../services/itemService";


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