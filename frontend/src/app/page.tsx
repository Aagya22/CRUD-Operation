
"use client";

import { useCallback, useEffect, useState } from "react";
import ItemForm from "../components/itemForm";
import ItemList from "../components/itemList";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../services/itemAPI";
import type { Item, ItemFormData } from "../types/item";

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    try {
      setError("");
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load items."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function handleSubmit(data: ItemFormData) {
    try {
      setSaving(true);
      setError("");

      if (editingItem) {
        await updateItem(editingItem.id, data);
        setEditingItem(null);
      } else {
        await createItem(data);
      }

      await loadItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteItem(id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );

      if (editingItem?.id === id) {
        setEditingItem(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete item."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page-container">
      <header className="page-header">
        <p className="eyebrow">CRUD APPLICATION</p>
        <h1>Item Manager</h1>
        <p className="subtitle">
          Create, view, update, and delete your items.
        </p>
      </header>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <section className="section">
        <h2>{editingItem ? "Edit item" : "Add a new item"}</h2>

        <ItemForm
          editingItem={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setEditingItem(null)}
          saving={saving}
        />
      </section>

      <section className="section">
        <div className="list-header">
          <h2>Your items</h2>
          <span className="item-count">{items.length} items</span>
        </div>

        {loading ? (
          <p className="status-message">Loading items...</p>
        ) : (
          <ItemList
            items={items}
            onEdit={setEditingItem}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </section>
    </main>
  );
}
