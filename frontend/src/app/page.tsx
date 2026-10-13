"use client";

import { useEffect, useState } from "react";

type Item = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
};

const API_URL = "http://localhost:5000/items";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load items.");
      setItems(await response.json());
    } catch {
      setMessage("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        editingId === null ? API_URL : `${API_URL}/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not save item.");
      }

      setName("");
      setDescription("");
      setEditingId(null);
      setMessage("Item saved successfully!");
      await loadItems();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  async function deleteItem(id: number) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not delete item.");
      }

      if (editingId === id) {
        setEditingId(null);
        setName("");
        setDescription("");
      }

      setMessage("Item deleted successfully!");
      await loadItems();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete item.");
    }
  }

  function editItem(item: Item) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description ?? "");
    setMessage("");
  }

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "50px auto",
        padding: "0 20px 40px",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      <h1>Item Manager</h1>
      <p style={{ color: "#666" }}>
        Create, view, update, and delete your items.
      </p>

      <section
        style={{
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 12,
          marginTop: 28,
          marginBottom: 32,
        }}
      >
        <h2>{editingId === null ? "Add a new item" : "Edit item"}</h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <label htmlFor="name">Item name</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Gold Ring"
            required
            maxLength={200}
            style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }}
          />

          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write a short description"
            rows={3}
            style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }}
          />

          <button
            type="submit"
            style={{
              padding: 12,
              border: 0,
              borderRadius: 6,
              background: "#3730a3",
              color: "white",
              cursor: "pointer",
            }}
          >
            {editingId === null ? "Add item" : "Save changes"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setDescription("");
                setMessage("");
              }}
              style={{ padding: 10, cursor: "pointer" }}
            >
              Cancel editing
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>Your items ({items.length})</h2>

        {message && <p role="status">{message}</p>}
        {loading && <p>Loading items...</p>}

        {!loading && items.length === 0 && (
          <p>No items yet. Add your first item above.</p>
        )}

        {items.map((item) => (
          <article
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <div>
              <h3>{item.name}</h3>
              <p>{item.description || "No description provided."}</p>
              <small>
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </small>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => editItem(item)} style={{ padding: 8 }}>
                Edit
              </button>
              <button
                onClick={() => void deleteItem(item.id)}
                style={{ padding: 8, color: "#b91c1c" }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}