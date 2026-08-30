import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  PackageX,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { useApiGet, useApiDelete } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import type { Product, PaginatedData } from '../../types';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/useDebounce';
import { ConfirmModal } from '../../components/ConfirmModal';
import { DetailModal, type DetailField } from '../../components/DetailModal';

interface Props {
  onOpenAddPage: () => void;
}

export const ManageProductsPage: React.FC<Props> = ({ onOpenAddPage }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [viewTarget, setViewTarget] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const queryKey = ['products', page, debouncedSearch, category];
  const url = `${API_ROUTES.PRODUCTS}?page=${page}&pageSize=15&search=${encodeURIComponent(
    debouncedSearch
  )}&category=${encodeURIComponent(category)}`;

  const { data: resData, isLoading } = useApiGet<{ success: boolean; data: PaginatedData<Product> }>(
    queryKey,
    url
  );

  const deleteMutation = useApiDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteTarget(null);
    },
    onError: () => {
      alert('Failed to delete product');
    },
  });

  const productsData = resData?.data;
  const products = productsData?.data || [];
  const totalPages = productsData?.totalPages || 1;
  const totalCount = productsData?.totalCount || 0;

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(API_ROUTES.PRODUCT_BY_ID(deleteTarget.id));
  };

  const hasActiveFilters = search.trim() !== '' || category !== 'All';

  const getProductFields = (prod: Product): DetailField[] => [
    { label: 'Product Title', value: prod.title },
    { label: 'Category', value: prod.category },
    { label: 'Offer Price', value: `₹${prod.price}` },
    { label: 'Original MRP', value: `₹${prod.originalPrice}` },
    { label: 'Stock Units', value: prod.inStock ? `${prod.stockQuantity || prod.stockCount || 100} Available` : 'Out of Stock' },
    { label: 'Badge Tag', value: prod.badge || prod.badgeText || 'Herbal' },
    { label: 'Dosage / Directions', value: prod.dosage || '1-2 spoonfuls daily after meals' },
    { label: 'Key Ingredients', value: Array.isArray(prod.ingredients) ? prod.ingredients.join(', ') : 'Ayurvedic Extracts' },
    { label: 'Description', value: prod.fullDescription || prod.shortDescription },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Manage Products Store</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
              {totalCount} Items
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live Ayurvedic products catalog, stock status, and pricing synced with MongoDB.
          </p>
        </div>

        <button
          onClick={onOpenAddPage}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product title or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
            <option value="All">All Categories</option>
            <option value="Hair Care">Hair Care</option>
            <option value="Skin Care">Skin Care</option>
            <option value="Health Malts & Tonics">Health Malts & Tonics</option>
            <option value="Digestive Care">Digestive Care</option>
            <option value="Immunity Boosters">Immunity Boosters</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition whitespace-nowrap">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Data Table */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 font-bold text-xs">
          Loading products table...
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-white">No Products Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or category filter.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-3.5 py-3">Product Title</th>
                  <th className="px-3.5 py-3">Category</th>
                  <th className="px-3.5 py-3">Size / Vol</th>
                  <th className="px-3.5 py-3">Offer & MRP</th>
                  <th className="px-3.5 py-3">Stock Status</th>
                  <th className="px-3.5 py-3">Badge</th>
                  <th className="px-3.5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">
                          🌿
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 dark:text-white text-xs leading-snug truncate max-w-[170px]">{prod.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">{prod.subtitle || prod.shortDescription}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold truncate max-w-[120px]">
                        {prod.category}
                      </span>
                    </td>

                    <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      {prod.size || '200ml'}
                    </td>

                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-slate-900 dark:text-white font-black text-xs">₹{prod.price}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-slate-500 line-through">₹{prod.originalPrice}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-1 font-bold text-[11px]">
                        {prod.inStock ? (
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <PackageX className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className={prod.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                          {prod.inStock ? `${prod.stockQuantity || prod.stockCount || 100} in stock` : 'Out of Stock'}
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold border border-slate-300 dark:border-slate-700 uppercase">
                        {prod.badge || prod.badgeText || 'Herbal'}
                      </span>
                    </td>

                    <td className="px-3.5 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => setViewTarget(prod)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition"
                        title="View Product Details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(prod)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 transition"
                        title="Delete Product">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-xs text-slate-400 font-semibold">
            Showing Page <span className="text-white font-extrabold">{page}</span> of{' '}
            <span className="text-white font-extrabold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white px-3 py-1 bg-slate-800 rounded-xl">
              {page}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Store Product"
        message={`Are you sure you want to permanently delete ${deleteTarget?.title}? This action cannot be undone.`}
        confirmText="Delete Product"
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* View Product Details Modal */}
      <DetailModal
        isOpen={Boolean(viewTarget)}
        title={viewTarget?.title || 'Product Specifications'}
        subtitle={viewTarget?.category}
        fields={viewTarget ? getProductFields(viewTarget) : []}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
};
