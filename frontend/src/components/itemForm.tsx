
"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Item, ItemFormData } from "../types/item";

interface ItemFormProps {
  editingItem: Item | null;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function ItemForm({
  editingItem,
  onSubmit,
  onCancel,
  saving,
}: ItemFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(editingItem?.name ?? "");
    setDescription(editingItem?.description ?? "");
  }, [editingItem]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
    });

    if (!editingItem) {
      setName("");
      setDescription("");
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="item-name">Item name</label>
        <input
          id="item-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter item name"
          required
          maxLength={100}
        />
      </div>

      <div className="form-field">
        <label htmlFor="item-description">Description</label>
        <textarea
          id="item-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter a description (optional)"
          rows={4}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving || !name.trim()}>
          {saving
            ? "Saving..."
            : editingItem
              ? "Update item"
              : "Add item"}
        </button>

        {editingItem && (
          <button
            type="button"
            className="button-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
