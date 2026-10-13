
import { Request, Response } from "express";
import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
} from "../services/itemService";

// Validate item ID
const getValidId = (value: string): number | null => {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : null;
};
const isObject = (body: unknown): body is Record<string, unknown> => {
  return (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body)
  );
};

// CREATE
export const createItemController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isObject(req.body)) {
      res.status(400).json({ message: "Request body must be a JSON object" });
      return;
    }

    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        message: "Name is required and cannot be empty",
      });
      return;
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        message: "Description must be a string or null",
      });
      return;
    }

    const item = await createItem({
      name: name.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : description,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Create item error:", error);
    res.status(500).json({ message: "Failed to create item" });
  }
};

// READ ALL
export const getAllItemsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const items = await getAllItems();
    res.status(200).json(items);
  } catch (error) {
    console.error("Fetch items error:", error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

// UPDATE
export const updateItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = getValidId(String(req.params.id));

    if (id === null) {
      res.status(400).json({
        message: "ID must be a positive integer",
      });
      return;
    }

    if (!isObject(req.body)) {
      res.status(400).json({
        message: "Request body must be a JSON object",
      });
      return;
    }

    const { name, description } = req.body;
    const data: { name?: string; description?: string | null } = {};

    if (name === undefined && description === undefined) {
      res.status(400).json({
        message: "Provide at least one field to update",
      });
      return;
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({
          message: "Name must be a non-empty string",
        });
        return;
      }

      data.name = name.trim();
    }

    if (description !== undefined) {
      if (
        description !== null &&
        typeof description !== "string"
      ) {
        res.status(400).json({
          message: "Description must be a string or null",
        });
        return;
      }

      data.description =
        typeof description === "string"
          ? description.trim()
          : null;
    }

    const item = await updateItem(id, data);

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ message: "Failed to update item" });
  }
};

// DELETE
export const deleteItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = getValidId(String(req.params.id));

    if (id === null) {
      res.status(400).json({
        message: "ID must be a positive integer",
      });
      return;
    }

    const deleted = await deleteItem(id);

    if (!deleted) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
};
