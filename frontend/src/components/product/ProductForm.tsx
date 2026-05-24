"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, Category } from "@/types/product";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { useT } from "@/i18n/LanguageContext";
import Image from "next/image";

interface ProductFormProps {
  onProductSaved: () => void;
  onCancel: () => void;
  editingProduct?: Product | null;
}

export default function ProductForm({ onProductSaved, onCancel, editingProduct }: ProductFormProps) {
  const t = useT();
  const [formData, setFormData] = useState<Product>(() => {
    if (editingProduct) {
      const categoryIri = typeof editingProduct.category === "object"
        ? `/api/categories/${(editingProduct.category as Category).id}`
        : editingProduct.category || "";
      return { ...editingProduct, category: categoryIri };
    }
    return { name: "", description: "", quantity: 0, price: "0.00", category: "" };
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (editingProduct?.imageName) {
      return `http://localhost:8000/images/products/${editingProduct.imageName}`;
    }
    return null;
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else if (editingProduct?.imageName) {
      setPreviewUrl(`http://localhost:8000/images/products/${editingProduct.imageName}`);
    } else {
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const dataToSubmit: Product = { ...formData };
    if (!dataToSubmit.category) delete dataToSubmit.category;
    if (selectedFile) dataToSubmit.imageFile = selectedFile;

    try {
      if (editingProduct?.id) {
        await productService.update(editingProduct.id, dataToSubmit);
      } else {
        await productService.create(dataToSubmit);
      }
      onProductSaved();
    } catch {
      setError(t("Error al guardar el producto. Verifica los datos e inténtalo de nuevo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--border)] shadow-elevated p-6 sm:p-7">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>
            {editingProduct ? t("Editar Producto") : t("Nuevo Producto")}
          </h2>
          <p className="text-xs mt-0.5" style={{color: 'var(--text-muted)'}}>
            {editingProduct ? `${t("Modificando:")} ${editingProduct.name}` : t("Completa los datos del producto")}
          </p>
        </div>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg transition-colors duration-150" style={{color: 'var(--text-muted)'}} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-lg text-sm flex items-center gap-2.5 animate-slideDown" style={{backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #fecaca'}}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{color: 'var(--text-secondary)'}}>{t("Nombre del producto *")}</label>
          <input
            type="text"
            required
            placeholder={t("Nombre del producto *").replace(" *", "")}
            className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all duration-150"
            style={{borderColor: 'var(--border)'}}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{color: 'var(--text-secondary)'}}>{t("Descripción")}</label>
          <textarea
            rows={2}
            placeholder={t("Descripción opcional del producto...")}
            className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all duration-150 resize-none"
            style={{borderColor: 'var(--border)'}}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{color: 'var(--text-secondary)'}}>Cantidad *</label>
          <input
            type="number"
            required
            min="0"
            className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all duration-150 mono"
            style={{borderColor: 'var(--border)'}}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{color: 'var(--text-secondary)'}}>Precio (&euro;) *</label>
          <input
            type="number"
            step="0.01"
            required
            min="0"
            className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all duration-150 mono"
            style={{borderColor: 'var(--border)'}}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{color: 'var(--text-secondary)'}}>Categor&iacute;a</label>
          <select
            className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all duration-150"
            style={{borderColor: 'var(--border)'}}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
            value={typeof formData.category === "string" ? formData.category : ""}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Sin categor&iacute;a</option>
            {Array.isArray(categories) && categories.map((cat) => (
              <option key={cat.id} value={`/api/categories/${cat.id}`}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{color: 'var(--text-secondary)'}}>Imagen</label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="border-2 border-dashed rounded-lg px-4 py-3 text-center transition-all duration-150 hover:bg-[var(--accent-bg)]" style={{borderColor: 'var(--border)'}} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}>
                <svg className="w-5 h-5 mx-auto mb-1" style={{color: 'var(--text-muted)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs" style={{color: 'var(--text-muted)'}}>{selectedFile ? selectedFile.name : "Seleccionar imagen"}</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {previewUrl && (
              <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0" style={{border: '1px solid var(--border)'}}>
                <Image src={previewUrl} alt="Preview" fill className="object-cover" onError={() => setPreviewUrl(null)} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4" style={{borderTop: '1px solid var(--border)'}}>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-150"
          style={{color: 'var(--text-secondary)'}}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium rounded-lg text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-[0.98]"
          style={{backgroundColor: 'var(--navy)'}}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = 'var(--navy-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--navy)'; }}
        >
          {saving && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {editingProduct ? "Guardar Cambios" : "Crear Producto"}
        </button>
      </div>
    </form>
  );
}
