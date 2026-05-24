"use client";

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback, useRef } from "react";
import { Product, Category } from "@/types/product";
import { productService } from "@/services/productService";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { useStockAdjust } from "@/hooks/useStockAdjust";
import { useT } from "@/i18n/LanguageContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import Image from "next/image";

export interface ProductListHandle {
  refresh: () => void;
  getFilteredProducts: () => Product[];
}

interface ProductListProps {
  onEdit: (product: Product) => void;
  searchTerm: string;
  filterCategory: string;
  onDataLoaded?: (products: Product[]) => void;
}

const ProductList = forwardRef<ProductListHandle, ProductListProps>(({ onEdit, searchTerm, filterCategory, onDataLoaded }, ref) => {
  const t = useT();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const onDataLoadedRef = useRef(onDataLoaded);
  onDataLoadedRef.current = onDataLoaded;

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productService.getAll()
      .then(data => {
        setProducts(data);
        setLoading(false);
        onDataLoadedRef.current?.(data);
      })
      .catch(() => setLoading(false));
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchProducts,
    getFilteredProducts: () => filteredProducts
  }));

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const { deleting, pendingId, confirmDelete, cancelDelete, executeDelete } = useDeleteProduct(fetchProducts);
  const { adjusting, handleAdjust } = useStockAdjust(fetchProducts);

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const productCategoryIri = typeof product.category === "object"
      ? `/api/categories/${(product.category as Category).id}`
      : product.category;
    const matchesCategory = !filterCategory || productCategoryIri === filterCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const content = loading ? (
    <div className="p-6 space-y-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-4 animate-fadeIn" style={{animationDelay: `${i * 60}ms`}}>
          <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/5" />
            <div className="skeleton h-3 w-2/5" />
          </div>
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-20" />
          <div className="skeleton w-16 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  ) : !filteredProducts.length ? (
    <div className="text-center py-16 px-6 animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'var(--bg)'}}>
        <svg className="w-7 h-7" style={{color: 'var(--text-muted)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
        <p className="text-sm font-medium" style={{color: 'var(--text-muted)'}}>
          {products.length === 0 ? t("No hay productos registrados") : t("Ningún producto coincide con la búsqueda")}
        </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full" style={{borderCollapse: 'separate', borderSpacing: 0}}>
        <thead>
          <tr style={{backgroundColor: 'var(--bg)'}}>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider sticky top-0" style={{color: 'var(--text-muted)', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'}}>{t("Producto")}</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell sticky top-0" style={{color: 'var(--text-muted)', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'}}>{t("Categoría")}</th>
            <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider sticky top-0" style={{color: 'var(--text-muted)', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'}}>Stock</th>
            <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell sticky top-0" style={{color: 'var(--text-muted)', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'}}>{t("Precio")}</th>
            <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell sticky top-0" style={{color: 'var(--text-muted)', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'}}>{t("Subtotal")}</th>
            <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider sticky top-0" style={{color: 'var(--text-muted)', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)'}}></th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, idx) => (
            <tr key={product.id}
              className="transition-colors duration-150"
              style={{borderBottom: '1px solid var(--border)'}}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent-bg)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
            >
              <td className="px-4 sm:px-6 py-3.5">
                <div className="flex items-center gap-3">
                  {product.imageName && !imgErrors.has(product.imageName) ? (
                    <div className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0" style={{backgroundColor: 'var(--bg)', border: '1px solid var(--border)'}}>
                      <Image src={`http://localhost:8000/images/products/${product.imageName}`} alt={product.name} fill className="object-cover" onError={() => setImgErrors(prev => new Set(prev).add(product.imageName!))} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{backgroundColor: 'var(--bg)', border: '1px solid var(--border)'}}>
                      <svg className="w-4 h-4" style={{color: 'var(--text-muted)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold" style={{color: 'var(--text-primary)'}}>{product.name}</p>
                    {product.description && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{color: 'var(--text-muted)'}}>{product.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" style={{backgroundColor: 'var(--bg)', color: 'var(--text-secondary)'}}>
                  {typeof product.category === "object" ? (product.category as Category).name : t("Sin categoría")}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3.5 text-right">
                <div className="flex items-center justify-end gap-0.5">
                  <button
                    onClick={() => product.id && handleAdjust(product.id, -1, product.quantity)}
                    disabled={adjusting === product.id || product.quantity <= 0}
                    className="p-1.5 rounded-md transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    style={{color: 'var(--text-muted)'}}
                    onMouseEnter={e => { if (!(adjusting === product.id || product.quantity <= 0)) { e.currentTarget.style.backgroundColor = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    title={t("Vender 1 unidad")}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="mono text-sm font-bold min-w-[2ch] text-center tabular-nums" style={{color: product.quantity <= 5 ? 'var(--accent)' : 'var(--text-primary)'}}>
                    {adjusting === product.id ? (
                      <svg className="w-3.5 h-3.5 inline animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      product.quantity
                    )}
                  </span>
                  {product.quantity <= 5 && product.quantity > 0 && (
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold" style={{backgroundColor: 'var(--accent-bg)', color: 'var(--accent)'}}>{t("BAJO")}</span>
                  )}
                  <button
                    onClick={() => product.id && handleAdjust(product.id, 1, product.quantity)}
                    disabled={adjusting === product.id}
                    className="p-1.5 rounded-md transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    style={{color: 'var(--text-muted)'}}
                    onMouseEnter={e => { if (!(adjusting === product.id)) { e.currentTarget.style.backgroundColor = 'var(--success-bg)'; e.currentTarget.style.color = 'var(--success)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    title={t("Añadir 1 unidad")}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3.5 text-right text-sm font-mono tabular-nums hidden sm:table-cell" style={{color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums'}}>
                <span className="font-medium">{parseFloat(product.price).toFixed(2)}</span>
                <span style={{color: 'var(--text-muted)'}}>&nbsp;&euro;</span>
              </td>
              <td className="px-4 sm:px-6 py-3.5 text-right text-sm font-mono tabular-nums hidden sm:table-cell" style={{color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums'}}>
                <span className="font-medium">{(parseFloat(product.price) * product.quantity).toFixed(2)}</span>
                <span style={{color: 'var(--text-muted)'}}>&nbsp;&euro;</span>
              </td>
              <td className="px-4 sm:px-6 py-3.5 text-right">
                <div className="flex items-center justify-end gap-0.5">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 rounded-md transition-all duration-150 active:scale-90"
                    style={{color: 'var(--text-muted)'}}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    title={t("Editar")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => product.id && confirmDelete(product.id)}
                    disabled={deleting === product.id}
                    className="p-1.5 rounded-md transition-all duration-150 disabled:opacity-50 active:scale-90"
                    style={{color: 'var(--text-muted)'}}
                    onMouseEnter={e => { if (!(deleting === product.id)) { e.currentTarget.style.backgroundColor = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    title={t("Eliminar")}
                  >
                    {deleting === product.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {content}
      <ConfirmDialog
        open={pendingId !== null}
        title={t("Eliminar producto")}
        message={t("Esta acción no se puede deshacer.")}
        confirmLabel={t("Eliminar")}
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        loading={deleting !== null}
      />
    </>
  );
});

ProductList.displayName = "ProductList";
export default ProductList;
