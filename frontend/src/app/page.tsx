"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ProductList, { ProductListHandle } from "@/components/product/ProductList";
import ProductForm from "@/components/product/ProductForm";
import { Product, Category } from "@/types/product";
import { categoryService } from "@/services/categoryService";
import { useT, useLang } from "@/i18n/LanguageContext";
import Image from "next/image";

export default function Home() {
  const t = useT();
  const { lang, setLang } = useLang();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0 });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const listRef = useRef<ProductListHandle>(null);

  const loadCategories = useCallback(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const calculateStats = useCallback((products: Product[]) => {
    if (!Array.isArray(products)) return;
    const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
    const lowStock = products.filter(p => p.quantity <= 5).length;
    setStats({ totalItems, lowStock });
  }, []);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const handleProductSaved = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    listRef.current?.refresh();
    showToast(t("Producto guardado correctamente"), "success");
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      await categoryService.create({ name: newCategoryName });
      setNewCategoryName("");
      setShowCategoryInput(false);
      loadCategories();
      showToast(t("Categoría creada"), "success");
    } catch {
      showToast(t("Error al crear la categoría"), "error");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg)'}}>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-elevated text-white text-sm font-medium animate-slideDown ${
          toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {toast.type === "success"
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
            {toast.message}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-[10vh] px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => { setIsFormOpen(false); setEditingProduct(null); }} />
          <div className="relative z-50 w-full max-w-2xl animate-scaleIn">
            <ProductForm
              key={editingProduct?.id || "new"}
              onProductSaved={handleProductSaved}
              onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }}
              editingProduct={editingProduct}
            />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30" style={{backgroundColor: 'var(--navy)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="StockFlow" width={32} height={32} className="shrink-0 rounded-md" />
              <span className="text-base font-bold text-white tracking-tight">StockFlow</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setLang(lang === "es" ? "en" : "es")}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-150 text-white/50 hover:text-white hover:bg-white/10"
                title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
              >
                {lang === "es" ? "EN" : "ES"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{t("Panel de Inventario")}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{t("Resumen y control de productos")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor: 'var(--success-bg)'}}>
                <svg className="w-5 h-5" style={{color: 'var(--success)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{t("Unidades en Stock")}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 mono">{stats.totalItems.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                stats.lowStock > 0 ? "" : ""
              }`} style={{backgroundColor: stats.lowStock > 0 ? 'var(--accent-bg)' : 'var(--bg)'}}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  style={{color: stats.lowStock > 0 ? 'var(--accent)' : 'var(--text-muted)'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{t("Stock Bajo")}</p>
                <p className="text-2xl font-bold mt-0.5 mono" style={{color: stats.lowStock > 0 ? 'var(--accent)' : 'var(--text-primary)'}}>
                  {stats.lowStock}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm">
          <div className="p-4 sm:p-5 border-b border-[var(--border)]">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{color: 'var(--text-muted)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t("Buscar producto...")}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm outline-none transition-all duration-150"
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = `0 0 0 3px var(--accent-bg)`; }}
                  onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm outline-none transition-all duration-150 cursor-pointer text-slate-700"
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = `0 0 0 3px var(--accent-bg)`; }}
                  onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">{t("Todas las categorías")}</option>
                  {Array.isArray(categories) && categories.map((cat) => (
                    <option key={cat.id} value={`/api/categories/${cat.id}`}>{cat.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCategoryInput(!showCategoryInput)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-white flex items-center gap-1.5 whitespace-nowrap active:scale-[0.97]"
                  style={{backgroundColor: 'var(--accent)'}}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b45309'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {t("Categoría")}
                </button>
              </div>

              <button
                onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-white flex items-center gap-2 whitespace-nowrap active:scale-[0.97]"
                style={{backgroundColor: 'var(--navy)'}}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--navy-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--navy)'; }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t("Producto")}
              </button>
            </div>

            {showCategoryInput && (
              <form onSubmit={handleCreateCategory} className="flex gap-2 mt-4 pt-4 animate-slideDown" style={{borderTop: '1px solid var(--border)'}}>
                <input
                  type="text"
                  placeholder={t("Nombre de la nueva categoría...")}
                  className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm outline-none transition-all duration-150"
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = `0 0 0 3px var(--accent-bg)`; }}
                  onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-white disabled:opacity-50 active:scale-[0.97]"
                  style={{backgroundColor: 'var(--accent)'}}
                  onMouseEnter={e => { if (!creatingCategory) e.currentTarget.style.backgroundColor = '#b45309'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
                >
                  {creatingCategory ? "..." : t("Crear")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCategoryInput(false); setNewCategoryName(""); }}
                  className="px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-lg"
                  style={{color: 'var(--text-secondary)'}}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {t("Cancelar")}
                </button>
              </form>
            )}
          </div>

          <ProductList
            ref={listRef}
            onEdit={handleEdit}
            searchTerm={searchTerm}
            filterCategory={filterCategory}
            onDataLoaded={calculateStats}
          />
        </div>
      </main>
    </div>
  );
}
