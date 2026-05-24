import { useState } from "react";
import { productService } from "@/services/productService";

export function useStockAdjust(onAdjusted: () => void) {
  const [adjusting, setAdjusting] = useState<number | null>(null);

  const handleAdjust = async (id: number, delta: number, currentQty: number) => {
    const newQty = currentQty + delta;
    if (newQty < 0) return;
    setAdjusting(id);
    try {
      await productService.adjustStock(id, newQty);
      onAdjusted();
    } catch {
      alert("Error al ajustar el stock.");
    } finally {
      setAdjusting(null);
    }
  };

  return { adjusting, handleAdjust };
}
