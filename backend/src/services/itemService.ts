import { AppDataSource } from "../config/database";
import { Item } from "../models/item";

const itemRepository = () => AppDataSource.getRepository(Item);

export const createItem = async (data: Partial<Item>) => {
  const item = itemRepository().create(data);
  return await itemRepository().save(item);
};

export const getAllItems = async () => {
  return await itemRepository().find();
};