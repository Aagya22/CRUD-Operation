import { AppDataSource } from "../config/database";
import { Item } from "../models/item";

const itemRepository = () => AppDataSource.getRepository(Item);

// CREATE
export const createItemRepository = async (data: {
  name: string;
  description?: string | null;
}) => {
  const repository = itemRepository();

  const item = repository.create({
    name: data.name,
    description: data.description ?? null,
  });

  return await repository.save(item);
};

// READ ALL
export const getAllItemsRepository = async () => {
  return await itemRepository().find({
    order: { id: "ASC" },
  });
};

// FIND ONE
export const getItemByIdRepository = async (id: number) => {
  return await itemRepository().findOneBy({ id });
};

// UPDATE
export const updateItemRepository = async (
  id: number,
  data: Partial<Pick<Item, "name" | "description">>
) => {
  const repository = itemRepository();
  const item = await repository.findOneBy({ id });

  if (!item) {
    return null;
  }

  repository.merge(item, data);

  return await repository.save(item);
};

// DELETE
export const deleteItemRepository = async (id: number) => {
  const repository = itemRepository();
  const item = await repository.findOneBy({ id });

  if (!item) {
    return false;
  }

  await repository.remove(item);

  return true;
};