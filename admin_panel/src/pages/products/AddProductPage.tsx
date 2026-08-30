import React, { useState } from 'react';
import { ArrowLeft, Plus, ShoppingBag } from 'lucide-react';
import { useApiPost } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import type { Product } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export const AddProductPage: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Hair Care',
    price: '',
    originalPrice: '',
    stockCount: '',
    shortDescription: '',
    fullDescription: '',
    badgeText: '',
    dosage: '',
    ingredientsStr: '',
  });

  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createProductMutation = useApiPost<{ success: boolean; data: Product }, Partial<Product>>(
    API_ROUTES.PRODUCTS,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        onSuccess();
      },
      onError: (err: any) => {
        setError(err?.message || 'Failed to add product');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Product title is required');
      return;
    }

    setError('');
    const priceNum = formData.price ? Number(formData.price) : 0;
    const origPriceNum = formData.originalPrice ? Number(formData.originalPrice) : priceNum;
    const stockNum = formData.stockCount ? Number(formData.stockCount) : 100;

    createProductMutation.mutate({
      title: formData.title,
      category: formData.category,
      price: priceNum,
      originalPrice: origPriceNum,
      stockCount: stockNum,
      inStock: stockNum > 0,
      shortDescription: formData.shortDescription || formData.title,
      fullDescription: formData.fullDescription || `${formData.title} is an authentic Ayurvedic formulation.`,
      badgeText: formData.badgeText || 'Herbal',
      dosage: formData.dosage || '1 spoonful daily',
      ingredients: formData.ingredientsStr ? formData.ingredientsStr.split(',').map((s) => s.trim()) : ['Ayurvedic Extract'],
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Add New Product Formulation</h2>
            <p className="text-xs text-slate-400 mt-0.5">Create a new Ayurvedic store product synced directly with MongoDB</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition">
            Back to Products List
          </button>
        </div>
      </div>

      {/* Main Full-Width Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Product Specs, Pricing & Inventory</h3>
            <p className="text-xs text-slate-400">All fields save directly to MongoDB Atlas Product collection</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amrutam Kuntal Care Herbal Hair Malt"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
                <option value="Hair Care">Hair Care</option>
                <option value="Skin Care">Skin Care</option>
                <option value="Health Malts & Tonics">Health Malts & Tonics</option>
                <option value="Digestive Care">Digestive Care</option>
                <option value="Immunity Boosters">Immunity Boosters</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Offer Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 499"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Original MRP (₹)</label>
              <input
                type="number"
                placeholder="e.g. 699"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Initial Stock Units</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Badge Text</label>
              <input
                type="text"
                placeholder="e.g. Pure Herbal"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Ingredients (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Bhringraj, Amla, Sesame Oil"
              value={formData.ingredientsStr}
              onChange={(e) => setFormData({ ...formData, ingredientsStr: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Short Description & Key Benefits</label>
            <textarea
              rows={4}
              placeholder="Enter product key benefits and formula details..."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProductMutation.isPending}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition">
              <Plus className="w-4 h-4" />
              <span>{createProductMutation.isPending ? 'Saving Product...' : 'Save & Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
