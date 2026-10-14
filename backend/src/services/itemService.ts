import {
  createItemRepository,
  getAllItemsRepository,
  updateItemRepository,
  deleteItemRepository,
} from "../repositories/itemRepository";

// CREATE
export const createItem = async (data: {
  name: string;
  description?: string | null;
}) => {
  return await createItemRepository(data);
};

// READ ALL
export const getAllItems = async () => {
  return await getAllItemsRepository();
};

// UPDATE
export const updateItem = async (
  id: number,
  data: {
    name?: string;
    description?: string | null;
  }
) => {
  return await updateItemRepository(id, data);
};

// DELETE
export const deleteItem = async (id: number) => {
  return await deleteItemRepository(id);
};