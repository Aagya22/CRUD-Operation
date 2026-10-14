import { Item, ItemFormData } from "@/types/item";

const API_URL = "http://localhost:5000/items";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Something went wrong");
  }

  return response.json() as Promise<T>;
}

// Fetch all items
export async function getItems(): Promise<Item[]> {
  const response = await fetch(API_URL);
  return handleResponse<Item[]>(response);
}

// Create an item
export async function createItem(data: ItemFormData): Promise<Item> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<Item>(response);
}

// Update an item
export async function updateItem(
  id: number,
  data: ItemFormData
): Promise<Item> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<Item>(response);
}

//  Delete an item
export async function deleteItem(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse<{ message: string }>(response);
}
