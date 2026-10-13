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

export const updateItem = async (
  id: number,
  data: Partial<Item>
) => {
  const repository = itemRepository();

  const item = await repository.findOneBy({ id });

  if (!item) {
    return null;
  }

  repository.merge(item, data);

  return await repository.save(item);
};

export const deleteItem = async (id: number) => {
  const repository = itemRepository();

  const item = await repository.findOneBy({ id });

  if (!item) {
    return false;
  }

  await repository.remove(item);

  return true;
};
