
"use client";

import type { Item } from "../types/item";

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
}

export default function ItemList({
  items,
  onEdit,
  onDelete,
  deletingId,
}: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h3>No items yet</h3>
        <p>Add your first item using the form.</p>
      </div>
    );
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <article className="item-card" key={item.id}>
          <div className="item-details">
            <h3>{item.name}</h3>

            <p>{item.description || "No description provided."}</p>

            <small>
              Created:{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "Unknown"}
            </small>
          </div>

          <div className="item-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => onEdit(item)}
              disabled={deletingId !== null}
            >
              Edit
            </button>

            <button
              type="button"
              className="button-danger"
              onClick={() => onDelete(item.id)}
              disabled={deletingId !== null}
            >
              {deletingId === item.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
