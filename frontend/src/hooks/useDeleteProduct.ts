import { useState } from "react";
import { productService } from "@/services/productService";

export function useDeleteProduct(onDeleted: () => void) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const confirmDelete = (id: number) => setPendingId(id);
  const cancelDelete = () => setPendingId(null);

  const executeDelete = async () => {
    if (pendingId === null) return;
    const id = pendingId;
    setPendingId(null);
    setDeleting(id);
    try {
      await productService.delete(id);
      onDeleted();
    } catch {
      alert("Error al eliminar el producto.");
    } finally {
      setDeleting(null);
    }
  };

  return { deleting, pendingId, confirmDelete, cancelDelete, executeDelete };
}
