import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Pencil, X, ImageIcon, Tag, Lock, Store as StoreIcon, Palette,
  Type, MessageCircle, ChevronRight, CheckCircle, ArrowLeft,
  Truck, ShoppingBag, Search, FolderPlus, Layers, Check, Zap, Crown,
  Package, CheckCircle2, QrCode, Settings, Clock, Smartphone,
  ArrowUpDown, Copy, ExternalLink, Banknote, CreditCard, Building2,
  ShieldCheck, LogOut, Loader2, AlertCircle, Wallet
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { Store, Product, Category, Banner, Order, OrderItem, CartItem, PlanType } from '@/lib/types';
import * as api from '@/lib/store-api';
import AuthScreen from '@/components/AuthScreen';

// ============ CONSTANTS ============

export const AVAILABLE_FONTS = [
  { id: 'Inter', name: 'Inter (Modern & Clean)', family: "'Inter', sans-serif" },
  { id: 'Playfair Display', name: 'Playfair (Elegant & Luxe)', family: "'Playfair Display', serif" },
  { id: 'Poppins', name: 'Poppins (Fresh & Geometric)', family: "'Poppins', sans-serif" },
  { id: 'Raleway', name: 'Raleway (Sophisticated)', family: "'Raleway', sans-serif" },
  { id: 'Nunito', name: 'Nunito (Friendly & Rounded)', family: "'Nunito', sans-serif" }
];

export const PLAN_LIMITS: Record<PlanType, {
  name: string; priceText: string; badge: string;
  maxProducts: number; maxBanners: number;
  offers: boolean; typography: boolean; features: string[];
}> = {
  free: {
    name: 'Starter', priceText: '$0/mo', badge: 'Free',
    maxProducts: 8, maxBanners: 1, offers: false, typography: false,
    features: [
      'Up to 8 active products', 'Unlimited categories & subcategories',
      '1 featured banner', 'Direct WhatsApp orders',
      'Exclusive QR code for customers', 'Multiple payment methods'
    ]
  },
  monthly: {
    name: 'Pro Merchant', priceText: '$29/mo', badge: 'Popular',
    maxProducts: Infinity, maxBanners: 5, offers: true, typography: true,
    features: [
      'UNLIMITED products', 'Offer badges & labels',
      'Up to 5 promotional banners', 'Advanced Google Fonts typography',
      'Digital wallets, cards & payment links', 'Order history dashboard',
      'Priority WhatsApp support'
    ]
  },
  yearly: {
    name: 'Enterprise', priceText: '$249/yr', badge: 'Save 35%',
    maxProducts: Infinity, maxBanners: Infinity, offers: true, typography: true,
    features: [
      'Everything in Pro Merchant', 'Unlimited banners & collections',
      'Exclusive customer-only store mode', 'Custom domain & short link',
      'Zero commission per sale', 'Catalog & gateway consulting'
    ]
  }
};

const DEFAULT_CATEGORIES = [
  { name: 'Fashion', subcategories: ['Shirts', 'Pants', 'Jackets', 'Shoes'] },
  { name: 'Food & Drinks', subcategories: ['Snacks', 'Beverages', 'Desserts', 'Coffee'] },
  { name: 'Home & Decor', subcategories: ['Kitchen', 'Candles', 'Organization'] },
  { name: 'Tech', subcategories: ['Accessories', 'Audio', 'Cases'] },
  { name: 'Beauty', subcategories: ['Skincare', 'Makeup', 'Perfumes'] },
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'
];

const ALL_THEMES = [
  { id: 'proDark', name: 'Pro Dark', color: '#10B981', bg: '#090D16' },
  { id: 'elegante', name: 'Noir Purple', color: '#8B5CF6', bg: '#0B0914' },
  { id: 'goldLuxury', name: 'Gold Luxury', color: '#F59E0B', bg: '#0F1115' },
  { id: 'roseGold', name: 'Rose Gold', color: '#F43F5E', bg: '#FAF5F7' },
  { id: 'artesanal', name: 'Warm Craft', color: '#D96B43', bg: '#FAF6F0' },
  { id: 'moderno', name: 'Clean Slate', color: '#4F46E5', bg: '#F8FAFC' },
  { id: 'cyberNeon', name: 'Cyber Neon', color: '#06B6D4', bg: '#050B14' },
  { id: 'nordicMint', name: 'Nordic Mint', color: '#059669', bg: '#F2F8F6' },
];

interface ThemeDef {
  bg: string; card: string; primary: string; accent: string; accentBg: string;
  badge: string; text: string; subtext: string; nav: string; selectBg: string;
  gradientBg: string; cardRadius: string; cardHover: string; borderSubtle: string;
  sectionBg: string; activeText: string; overlayBg: string; modalBg: string;
  modalInputBg: string; isDark: boolean;
}

const THEMES: Record<string, ThemeDef> = {
  proDark: {
    bg: 'bg-slate-950', card: 'bg-slate-900/90 border-slate-800 text-slate-100 backdrop-blur-md',
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-600 hover:to-teal-700',
    accent: 'text-emerald-400', accentBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    badge: 'bg-slate-800 text-slate-300 border border-slate-700', text: 'text-slate-100',
    subtext: 'text-slate-400', nav: 'bg-slate-900/95 border-slate-800 backdrop-blur-lg',
    selectBg: 'bg-slate-900 text-slate-100 border-slate-800', gradientBg: 'from-slate-950 via-slate-900 to-emerald-950/30',
    cardRadius: 'rounded-3xl', cardHover: 'hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20',
    borderSubtle: 'border-white/10', sectionBg: 'bg-slate-950/40', activeText: 'text-emerald-400',
    overlayBg: 'from-slate-950/80', modalBg: 'bg-slate-900 border-slate-800 text-slate-100',
    modalInputBg: 'bg-slate-950 border-slate-800', isDark: true
  },
  elegante: {
    bg: 'bg-[#0B0914]', card: 'bg-[#151226]/90 border-[#2A2447] text-purple-50 backdrop-blur-md shadow-lg',
    primary: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50 hover:opacity-95',
    accent: 'text-violet-400', accentBg: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    badge: 'bg-[#201B3A] text-violet-200 border border-[#322A59]', text: 'text-purple-50',
    subtext: 'text-purple-300/60', nav: 'bg-[#120F21]/95 border-[#2A2447] backdrop-blur-lg',
    selectBg: 'bg-[#151226] text-purple-100 border-[#2A2447]', gradientBg: 'from-[#0B0914] via-[#141026] to-[#1F153B]',
    cardRadius: 'rounded-2xl', cardHover: 'hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-950/30',
    borderSubtle: 'border-white/10', sectionBg: 'bg-[#0B0914]/40', activeText: 'text-violet-400',
    overlayBg: 'from-[#0B0914]/80', modalBg: 'bg-[#151226] border-[#2A2447] text-purple-50',
    modalInputBg: 'bg-[#0B0914] border-[#2A2447]', isDark: true
  },
  goldLuxury: {
    bg: 'bg-[#0F1115]', card: 'bg-[#181B22] border-[#2A2F3D] text-amber-50 backdrop-blur-md shadow-md',
    primary: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-950/40',
    accent: 'text-amber-400', accentBg: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    badge: 'bg-[#232834] text-amber-200/80 border border-[#343D50]', text: 'text-amber-50',
    subtext: 'text-slate-400', nav: 'bg-[#14171D] border-[#2A2F3D]',
    selectBg: 'bg-[#181B22] text-amber-100 border-[#2A2F3D]', gradientBg: 'from-[#0F1115] via-[#161920] to-[#251F10]/40',
    cardRadius: 'rounded-xl', cardHover: 'hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-950/20',
    borderSubtle: 'border-white/10', sectionBg: 'bg-[#0F1115]/40', activeText: 'text-amber-400',
    overlayBg: 'from-[#0F1115]/80', modalBg: 'bg-[#181B22] border-[#2A2F3D] text-amber-50',
    modalInputBg: 'bg-[#0F1115] border-[#2A2F3D]', isDark: true
  },
  roseGold: {
    bg: 'bg-[#FAF5F7]', card: 'bg-white/90 border-[#F3E2E8] text-[#3D2730] shadow-sm backdrop-blur-md',
    primary: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200',
    accent: 'text-rose-600', accentBg: 'bg-rose-100/70 text-rose-800 border border-rose-200',
    badge: 'bg-[#F7EBF0] text-[#7A5060] border border-[#F3E2E8]', text: 'text-[#3D2730]', subtext: 'text-[#8C6B77]',
    nav: 'bg-white/95 border-[#F3E2E8]', selectBg: 'bg-white text-[#3D2730] border-[#F3E2E8]',
    gradientBg: 'from-[#FAF5F7] via-[#F8EDF1] to-[#F1DEE5]',
    cardRadius: 'rounded-3xl', cardHover: 'hover:border-rose-400/50 hover:shadow-lg hover:shadow-rose-100',
    borderSubtle: 'border-[#F3E2E8]', sectionBg: 'bg-[#FAF5F7]/60', activeText: 'text-rose-600',
    overlayBg: 'from-[#FAF5F7]/80', modalBg: 'bg-white border-[#F3E2E8] text-[#3D2730]',
    modalInputBg: 'bg-[#FAF5F7] border-[#F3E2E8]', isDark: false
  },
  artesanal: {
    bg: 'bg-[#FAF6F0]', card: 'bg-white/95 border-[#E8DFC8] text-[#2D2825] shadow-sm backdrop-blur-md',
    primary: 'bg-gradient-to-r from-[#D96B43] to-[#C2542D] text-white shadow-md shadow-[#D96B43]/20',
    accent: 'text-[#D96B43]', accentBg: 'bg-[#FBEBE4] text-[#C2542D] border border-[#F0D5C8]',
    badge: 'bg-[#F3EDE2] text-[#6E6359] border border-[#E8DFC8]', text: 'text-[#2D2825]', subtext: 'text-[#7C7267]',
    nav: 'bg-white/95 border-[#E8DFC8]', selectBg: 'bg-white text-[#2D2825] border-[#E8DFC8]',
    gradientBg: 'from-[#FAF6F0] via-[#F4ECE1] to-[#EBDDCB]',
    cardRadius: 'rounded-2xl', cardHover: 'hover:border-[#D96B43]/50 hover:shadow-lg hover:shadow-[#D96B43]/10',
    borderSubtle: 'border-[#E8DFC8]', sectionBg: 'bg-[#FAF6F0]/60', activeText: 'text-[#D96B43]',
    overlayBg: 'from-[#FAF6F0]/80', modalBg: 'bg-white border-[#E8DFC8] text-[#2D2825]',
    modalInputBg: 'bg-[#FAF6F0] border-[#E8DFC8]', isDark: false
  },
  moderno: {
    bg: 'bg-gray-50', card: 'bg-white border-gray-100 text-gray-900 shadow-sm',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200',
    accent: 'text-indigo-600', accentBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    badge: 'bg-gray-100 text-gray-600 border border-gray-200', text: 'text-gray-900', subtext: 'text-gray-500',
    nav: 'bg-white/95 border-gray-200', selectBg: 'bg-white text-gray-900 border-gray-200',
    gradientBg: 'from-gray-50 via-slate-50 to-indigo-50/30',
    cardRadius: 'rounded-2xl', cardHover: 'hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-100',
    borderSubtle: 'border-gray-200', sectionBg: 'bg-gray-50', activeText: 'text-indigo-600',
    overlayBg: 'from-gray-50/80', modalBg: 'bg-white border-gray-200 text-gray-900',
    modalInputBg: 'bg-gray-50 border-gray-200', isDark: false
  },
  cyberNeon: {
    bg: 'bg-[#050B14]', card: 'bg-[#0A1628]/90 border-[#142C4E] text-cyan-50 backdrop-blur-md',
    primary: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black shadow-lg shadow-cyan-950/60 hover:opacity-90',
    accent: 'text-cyan-400', accentBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    badge: 'bg-[#0E203A] text-cyan-200 border border-[#183660]', text: 'text-cyan-50',
    subtext: 'text-cyan-200/60', nav: 'bg-[#081220]/95 border-[#142C4E]',
    selectBg: 'bg-[#0A1628] text-cyan-100 border-[#142C4E]', gradientBg: 'from-[#050B14] via-[#08152B] to-[#0A223D]',
    cardRadius: 'rounded-2xl', cardHover: 'hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10',
    borderSubtle: 'border-[#142C4E]', sectionBg: 'bg-[#050B14]/40', activeText: 'text-cyan-400',
    overlayBg: 'from-[#050B14]/80', modalBg: 'bg-[#0A1628] border-[#142C4E] text-cyan-50',
    modalInputBg: 'bg-[#050B14] border-[#142C4E]', isDark: true
  },
  nordicMint: {
    bg: 'bg-[#F2F8F6]', card: 'bg-white/95 border-[#D2E7E2] text-[#1E3832] shadow-sm',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200',
    accent: 'text-emerald-600', accentBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    badge: 'bg-[#E4F2EE] text-[#345B51] border border-[#D2E7E2]', text: 'text-[#1E3832]', subtext: 'text-[#577A72]',
    nav: 'bg-white/95 border-[#D2E7E2]', selectBg: 'bg-white text-[#1E3832] border-[#D2E7E2]',
    gradientBg: 'from-[#F2F8F6] via-[#E7F3F0] to-[#DCECE7]',
    cardRadius: 'rounded-3xl', cardHover: 'hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-100',
    borderSubtle: 'border-[#D2E7E2]', sectionBg: 'bg-[#F2F8F6]/60', activeText: 'text-emerald-600',
    overlayBg: 'from-[#F2F8F6]/80', modalBg: 'bg-white border-[#D2E7E2] text-[#1E3832]',
    modalInputBg: 'bg-[#F2F8F6] border-[#D2E7E2]', isDark: false
  }
};

// ============ HELPERS ============

function dbProductToCart(p: Product): CartItem {
  return {
    id: p.id, name: p.name, description: p.description, price: Number(p.price),
    offer_price: p.offer_price !== null ? Number(p.offer_price) : null,
    is_offer: p.is_offer, category: p.category, subcategory: p.subcategory,
    image: p.image, stock: p.stock, is_featured: p.is_featured, quantity: 1
  };
}

// ============ CATEGORY MANAGER MODAL ============

interface CategoryManagerModalProps {
  isOpen: boolean; onClose: () => void;
  categories: Category[]; storeId: string; theme: ThemeDef;
  onSaved: () => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, storeId, theme, onSaved }) => {
  const [cats, setCats] = useState(categories);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(categories[0]?.id || null);
  const [newSubName, setNewSubName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setCats(categories); }, [categories, isOpen]);
  if (!isOpen) return null;

  const handleAddCat = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = { id: `temp-${Date.now()}`, store_id: storeId, name: newCatName.trim(), subcategories: [], sort_order: cats.length };
    setCats([...cats, newCat]); setNewCatName(''); setSelectedCatId(newCat.id);
  };
  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    setCats(cats.map(c => c.id === id ? { ...c, name: editingName.trim() } : c));
    setEditingId(null);
  };
  const handleDeleteCat = (id: string) => {
    const updated = cats.filter(c => c.id !== id);
    setCats(updated);
    if (selectedCatId === id) setSelectedCatId(updated[0]?.id || null);
  };
  const handleAddSub = () => {
    if (!selectedCatId || !newSubName.trim()) return;
    setCats(cats.map(c => c.id === selectedCatId && !c.subcategories.includes(newSubName.trim())
      ? { ...c, subcategories: [...c.subcategories, newSubName.trim()] } : c));
    setNewSubName('');
  };
  const handleDeleteSub = (subName: string) => {
    if (!selectedCatId) return;
    setCats(cats.map(c => c.id === selectedCatId ? { ...c, subcategories: c.subcategories.filter(s => s !== subName) } : c));
  };
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await api.replaceCategories(storeId, cats.map((c, i) => ({ name: c.name, subcategories: c.subcategories, sort_order: i })));
      onSaved(); onClose();
    } catch { alert('Error saving categories'); }
    setSaving(false);
  };
  const activeCat = cats.find(c => c.id === selectedCatId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`${theme.modalBg} ${theme.cardRadius} p-5 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200`}>
        <div className={`flex justify-between items-center border-b ${theme.borderSubtle} pb-3`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 ${theme.accentBg} ${theme.cardRadius}`}><Layers size={20} /></div>
            <div>
              <h3 className="font-bold text-base">Categories & Sections</h3>
              <p className={`text-xs ${theme.subtext}`}>Organize your catalog for customers</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 ${theme.subtext} hover:opacity-70 ${theme.cardRadius}`}><X size={20} /></button>
        </div>
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider ${theme.subtext}`}>1. Main Categories</label>
          <div className="flex gap-2">
            <input type="text" placeholder="New category..." value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCat())}
              className={`flex-1 ${theme.modalInputBg} ${theme.cardRadius} px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500`} />
            <button onClick={handleAddCat} className={`${theme.primary} px-4 py-2.5 ${theme.cardRadius} text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95`}>
              <Plus size={15} /> Add
            </button>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {cats.map(cat => (
              <div key={cat.id} onClick={() => setSelectedCatId(cat.id)}
                className={`p-2.5 ${theme.cardRadius} border flex items-center justify-between transition-all cursor-pointer ${
                  selectedCatId === cat.id ? `${theme.accentBg} shadow-sm` : `${theme.borderSubtle} hover:opacity-80`}`}>
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2" onClick={e => e.stopPropagation()}>
                    <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)}
                      className={`flex-1 ${theme.modalInputBg} ${theme.cardRadius} px-2.5 py-1 text-xs outline-none`} autoFocus />
                    <button onClick={() => handleSaveEdit(cat.id)} className={`p-1.5 ${theme.primary} ${theme.cardRadius}`}><Check size={13} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-xs truncate">{cat.name}</span>
                    <span className={`text-[10px] ${theme.badge} font-bold px-2 py-0.5 rounded-full`}>{cat.subcategories.length} sub</span>
                  </div>
                )}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {editingId !== cat.id && <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }} className={`p-1.5 ${theme.subtext} hover:opacity-70 ${theme.cardRadius}`}><Pencil size={13} /></button>}
                  <button onClick={() => handleDeleteCat(cat.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-xl"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <hr className={theme.borderSubtle} />
        {activeCat ? (
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider block ${theme.subtext}`}>
              2. Subcategories of <span className={theme.accent}>&ldquo;{activeCat.name}&rdquo;</span>
            </label>
            <div className="flex gap-2">
              <input type="text" placeholder={`Subcategory for ${activeCat.name}...`} value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSub())}
                className={`flex-1 ${theme.modalInputBg} ${theme.cardRadius} px-3 py-2 text-xs outline-none focus:border-emerald-500`} />
              <button onClick={handleAddSub} className={`${theme.badge} px-3 py-2 ${theme.cardRadius} text-xs font-bold flex items-center gap-1`}>
                <Plus size={14} /> Add
              </button>
            </div>
            {activeCat.subcategories.length === 0 ? (
              <p className={`text-xs ${theme.subtext} italic text-center py-4 border border-dashed ${theme.borderSubtle} ${theme.cardRadius}`}>No subcategories yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeCat.subcategories.map((sub, idx) => (
                  <div key={idx} className={`${theme.badge} ${theme.cardRadius} px-2.5 py-1 flex items-center gap-1.5 text-xs font-medium`}>
                    <span>{sub}</span>
                    <button onClick={() => handleDeleteSub(sub)} className="opacity-50 hover:opacity-100 p-0.5"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <p className={`text-xs ${theme.subtext} text-center py-4`}>Select or create a category above.</p>}
        <button onClick={handleSaveAll} disabled={saving}
          className={`w-full ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50`}>
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save & Close'}
        </button>
      </div>
    </div>
  );
};

// ============ QR MODAL ============

interface QRModalProps { isOpen: boolean; onClose: () => void; storeId: string; storeName: string; theme: ThemeDef; }

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, storeId, storeName, theme }) => {
  if (!isOpen) return null;
  const origin = window.location.origin + window.location.pathname;
  const clientUrl = `${origin}?store=${storeId}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`${theme.modalBg} ${theme.cardRadius} p-6 w-full max-w-sm text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95`}>
        <div className={`flex justify-between items-center border-b ${theme.borderSubtle} pb-3`}>
          <h3 className="font-bold text-sm flex items-center gap-2"><QrCode size={18} className={theme.accent} /> Customer QR Code</h3>
          <button onClick={onClose} className={`p-1 ${theme.subtext}`}><X size={18} /></button>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 p-6 ${theme.cardRadius} text-white space-y-3 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 backdrop-blur-md text-emerald-100 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-white/20 mb-2"><ShieldCheck size={12} /> Catalog & Cart Only</span>
            <p className="font-black text-lg text-white drop-shadow-sm">{storeName}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl relative z-10 border border-emerald-100">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(clientUrl)}`} alt="QR" className="w-44 h-44 mx-auto rounded-lg" />
          </div>
          <p className="text-[10px] text-emerald-100 font-medium relative z-10">Customers scan this to view your products and place orders.</p>
        </div>
        <div className="space-y-2">
          <button onClick={() => { navigator.clipboard?.writeText(clientUrl); alert('Link copied!'); }}
            className={`w-full ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2`}>
            <Copy size={14} /> Copy Customer Link
          </button>
          <a href={clientUrl} target="_blank" rel="noopener noreferrer"
            className={`w-full ${theme.badge} py-2.5 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-1.5 block text-center`}>
            <ExternalLink size={14} /> Test Customer View
          </a>
        </div>
      </div>
    </div>
  );
};

// ============ PLANS VIEW ============

interface PlansViewProps {
  currentPlan: PlanType; productCount: number; bannerCount: number; theme: ThemeDef;
  onSelectPlan: (plan: PlanType) => void;
}

const PlansView: React.FC<PlansViewProps> = ({ currentPlan, productCount, bannerCount, theme, onSelectPlan }) => (
  <div className="space-y-5 animate-in fade-in duration-200">
    <div className="text-center space-y-1.5">
      <div className={`inline-flex items-center gap-1.5 ${theme.accentBg} px-3.5 py-1 rounded-full text-xs font-bold`}>
        <Crown size={14} /> Subscription & Plans
      </div>
      <h2 className="text-2xl font-black tracking-tight">Power Your Digital Business</h2>
      <p className={`text-xs ${theme.subtext}`}>Unlock unlimited sales, payment gateways and premium design</p>
    </div>
    <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold flex items-center gap-1.5"><Zap size={15} className={theme.accent} /> Current Plan</span>
        <span className={`font-black uppercase px-2.5 py-1 rounded-xl ${theme.accentBg} text-[10px]`}>{PLAN_LIMITS[currentPlan].name}</span>
      </div>
      <div>
        <div className={`flex justify-between text-[11px] mb-1 font-semibold ${theme.subtext}`}>
          <span>Products added:</span>
          <span>{productCount} / {PLAN_LIMITS[currentPlan].maxProducts === Infinity ? '\u221e' : PLAN_LIMITS[currentPlan].maxProducts}</span>
        </div>
        <div className={`w-full ${theme.sectionBg} h-2 rounded-full overflow-hidden`}>
          <div className={`h-full transition-all ${productCount >= PLAN_LIMITS[currentPlan].maxProducts ? 'bg-amber-500' : theme.accent.replace('text-', 'bg-')}`}
            style={{ width: PLAN_LIMITS[currentPlan].maxProducts === Infinity ? '100%' : `${Math.min(100, (productCount / PLAN_LIMITS[currentPlan].maxProducts) * 100)}%` }} />
        </div>
      </div>
    </div>
    <div className="space-y-4">
      {(Object.keys(PLAN_LIMITS) as PlanType[]).map(planKey => {
        const plan = PLAN_LIMITS[planKey]; const isCurrent = currentPlan === planKey;
        return (
          <div key={planKey} className={`p-5 ${theme.cardRadius} border-2 transition-all relative ${isCurrent ? `${theme.accentBg} shadow-xl` : `${theme.card} hover:opacity-90`}`}>
            {planKey === 'monthly' && <span className="absolute -top-3 right-5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">{plan.badge}</span>}
            <div className="flex justify-between items-start mb-3">
              <div><h3 className="font-bold text-base">{plan.name}</h3><p className={`text-xl font-black ${theme.accent} mt-0.5`}>{plan.priceText}</p></div>
              {isCurrent && <span className={`flex items-center gap-1 text-[10px] font-bold ${theme.accentBg} px-2.5 py-1 rounded-full`}><CheckCircle2 size={12} /> Active</span>}
            </div>
            <ul className="space-y-2 text-xs opacity-90 mb-5">
              {plan.features.map((feat, idx) => <li key={idx} className="flex items-center gap-2"><Check size={14} className={`${theme.accent} shrink-0`} /><span>{feat}</span></li>)}
            </ul>
            <button onClick={() => onSelectPlan(planKey)} disabled={isCurrent}
              className={`w-full py-3 ${theme.cardRadius} text-xs font-bold transition-all ${isCurrent ? `${theme.badge} cursor-default` : `${theme.primary}`}`}>
              {isCurrent ? 'Current Plan' : `Activate ${plan.name}`}
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

// ============ ADMIN PRODUCTS ============

interface AdminProductsProps {
  products: Product[]; store: Store; theme: ThemeDef; categories: Category[];
  onRefresh: () => void; onUpgrade: () => void;
}

type FormState = {
  name: string; price: string; category: string; subcategory: string;
  description: string; image: string; isOffer: boolean; offerPrice: string;
  stock: string; isFeatured: boolean;
};

const EMPTY_FORM: FormState = { name: '', price: '', category: '', subcategory: '', description: '', image: '', isOffer: false, offerPrice: '', stock: '10', isFeatured: false };

const AdminProducts: React.FC<AdminProductsProps> = ({ products, store, theme, categories, onRefresh, onUpgrade }) => {
  const [showModal, setShowModal] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const planLimits = PLAN_LIMITS[store.plan] || PLAN_LIMITS.free;
  const canAddMore = products.length < planLimits.maxProducts;
  const catNames = categories.length > 0 ? categories.map(c => c.name) : DEFAULT_CATEGORIES.map(c => c.name);
  const currentCatObj = categories.find(c => c.name === form.category) || DEFAULT_CATEGORIES.find(c => c.name === form.category);
  const availableSubs = currentCatObj ? currentCatObj.subcategories : [];

  const openAdd = () => {
    if (!canAddMore) { onUpgrade(); return; }
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: catNames[0] || 'General', subcategory: availableSubs[0] || '', image: PRESET_IMAGES[Math.floor(Math.random() * PRESET_IMAGES.length)] });
    setShowModal(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), category: p.category, subcategory: p.subcategory || '', description: p.description, image: p.image, isOffer: p.is_offer, offerPrice: p.offer_price ? String(p.offer_price) : '', stock: String(p.stock), isFeatured: p.is_featured });
    setShowModal(true);
  };
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result as string })); reader.readAsDataURL(file); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const data = {
        name: form.name, price: parseFloat(form.price), category: form.category || catNames[0] || 'General',
        subcategory: form.subcategory || null, description: form.description, image: form.image || PRESET_IMAGES[0],
        is_offer: planLimits.offers ? form.isOffer : false,
        offer_price: (planLimits.offers && form.isOffer && form.offerPrice) ? parseFloat(form.offerPrice) : null,
        stock: parseInt(form.stock) || 10, is_featured: form.isFeatured
      };
      if (editing) await api.updateProduct(editing.id, data);
      else await api.createProduct(store.id, data);
      onRefresh(); setShowModal(false);
    } catch { alert('Error saving product'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await api.deleteProduct(id); onRefresh(); } catch { alert('Error deleting'); }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className={`flex items-center justify-between border-b ${theme.borderSubtle} pb-3`}>
        <div>
          <h2 className="text-lg font-bold">Products</h2>
          <p className={`text-xs ${theme.subtext}`}>Plan <strong className={`uppercase ${theme.accent}`}>{store.plan}</strong> &mdash; {products.length}{planLimits.maxProducts !== Infinity ? `/${planLimits.maxProducts}` : ''} registered</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCatManager(true)} className={`${theme.badge} px-3 py-2 ${theme.cardRadius} flex items-center gap-1.5 text-xs font-bold transition-all`}><FolderPlus size={14} /> Sections</button>
          <button onClick={openAdd} className={`${theme.primary} px-3.5 py-2 ${theme.cardRadius} flex items-center gap-1.5 text-xs font-bold`}><Plus size={15} /> New</button>
        </div>
      </div>
      {!canAddMore && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-amber-200 text-xs">
          <Lock size={16} className="text-amber-400 shrink-0" />
          <p>You've reached your Starter plan limit. <button onClick={onUpgrade} className="font-bold underline text-amber-300">Upgrade your plan</button> for unlimited products.</p>
        </div>
      )}
      <div className="space-y-2.5">
        {products.length === 0 && (
          <div className={`text-center py-14 opacity-50 text-xs space-y-2 ${theme.subtext}`}><Package size={40} className="mx-auto" /><p>No products yet. Add your first one!</p></div>
        )}
        {products.map(p => (
          <div key={p.id} className={`${theme.card} p-3 ${theme.cardRadius} border flex items-center gap-3 shadow-sm ${theme.cardHover} transition-all`}>
            <img src={p.image} alt={p.name} className={`w-14 h-14 ${theme.cardRadius} object-cover shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-xs truncate">{p.name}</h4>
                {p.is_offer && <span className="bg-red-500/20 text-red-400 text-[8px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">SALE</span>}
                {p.is_featured && <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">TOP</span>}
              </div>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                <span className={`text-[9px] font-medium ${theme.accentBg} px-2 py-0.5 rounded-full`}>{p.category}</span>
                {p.subcategory && <span className={`text-[9px] opacity-60 ${theme.sectionBg} px-2 py-0.5 rounded-full`}>{p.subcategory}</span>}
                <span className="text-[9px] opacity-60">Stock: {p.stock}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                {p.is_offer && p.offer_price ? (<><span className="text-red-400 font-bold text-xs block">{store.currency_symbol}{Number(p.offer_price).toFixed(2)}</span><span className="text-[9px] opacity-40 line-through">{store.currency_symbol}{Number(p.price).toFixed(2)}</span></>) : (<span className={`font-bold text-xs ${theme.accent}`}>{store.currency_symbol}{Number(p.price).toFixed(2)}</span>)}
              </div>
              <button onClick={() => openEdit(p)} className={`p-1.5 ${theme.subtext} hover:opacity-70 ${theme.cardRadius}`}><Pencil size={14} /></button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-xl"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${theme.modalBg} ${theme.cardRadius} p-5 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95`}>
            <div className={`flex justify-between items-center border-b ${theme.borderSubtle} pb-3 mb-4`}>
              <h3 className="font-bold text-sm">{editing ? 'Edit Product' : 'Create Product'}</h3>
              <button onClick={() => setShowModal(false)} className={theme.subtext}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name"
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Price *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="29.90"
                    className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Sale Price {!planLimits.offers && <span className="text-amber-400">(Pro)</span>}</label>
                  <input type="number" step="0.01" value={form.offerPrice} onChange={e => setForm({...form, offerPrice: e.target.value, isOffer: e.target.value !== ''})} placeholder="19.90" disabled={!planLimits.offers}
                    className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-red-500 disabled:opacity-40`} />
                </div>
              </div>
              {planLimits.offers && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={form.isOffer} onChange={e => setForm({...form, isOffer: e.target.checked})} className="rounded text-emerald-500 focus:ring-0" />
                  <span className="text-xs font-semibold">Mark as SALE</span>
                </label>
              )}
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Category</label>
                <select value={form.category} onChange={e => { const nc = e.target.value; const fs = (categories.find(c => c.name === nc) || DEFAULT_CATEGORIES.find(c => c.name === nc))?.subcategories[0] || ''; setForm({...form, category: nc, subcategory: fs}); }}
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500 font-medium`}>
                  {catNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Subcategory</label>
                <select value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})}
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`}>
                  <option value="">No subcategory</option>
                  {availableSubs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Details..."
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs resize-none outline-none focus:border-emerald-500`} />
              </div>
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Image</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((imgUrl, i) => (
                    <img key={i} src={imgUrl} alt="" onClick={() => setForm({...form, image: imgUrl})}
                      className={`h-12 w-full object-cover ${theme.cardRadius} cursor-pointer border-2 transition-all ${form.image === imgUrl ? `${theme.accent.replace('text-', 'border-')} scale-105 shadow-md` : `${theme.borderSubtle} opacity-60 hover:opacity-100`}`} />
                  ))}
                </div>
                <label className={`flex items-center justify-center gap-2 ${theme.modalInputBg} border border-dashed ${theme.cardRadius} p-2.5 cursor-pointer hover:opacity-70 transition-opacity`}>
                  <ImageIcon size={16} className={theme.subtext} /><span className={`text-xs ${theme.subtext} font-medium`}>Or upload an image</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 ${theme.badge} py-3 ${theme.cardRadius} text-xs font-bold`}>Cancel</button>
                <button type="submit" disabled={saving} className={`flex-1 ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50`}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}{editing ? 'Save' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <CategoryManagerModal isOpen={showCatManager} onClose={() => setShowCatManager(false)} categories={categories} storeId={store.id} theme={theme} onSaved={onRefresh} />
    </div>
  );
};

// ============ ORDERS VIEW ============

interface OrdersViewProps { orders: Order[]; store: Store; theme: ThemeDef; onRefresh: () => void; }

const OrdersView: React.FC<OrdersViewProps> = ({ orders, store, theme, onRefresh }) => {
  const handleStatus = async (orderId: string, status: Order['status']) => {
    try { await api.updateOrderStatus(orderId, status); onRefresh(); } catch { alert('Error updating'); }
  };
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className={`flex items-center justify-between border-b ${theme.borderSubtle} pb-3`}>
        <div><h2 className="text-lg font-bold">Order History</h2><p className={`text-xs ${theme.subtext}`}>Orders received via WhatsApp</p></div>
        <span className={`${theme.accentBg} font-bold px-3 py-1 rounded-full text-xs`}>{orders.length} orders</span>
      </div>
      {orders.length === 0 ? (
        <div className={`text-center py-16 space-y-3 opacity-50 ${theme.subtext}`}><Clock size={40} className="mx-auto" /><p className="text-xs font-medium">No orders yet.</p></div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
              <div className={`flex justify-between items-start border-b ${theme.borderSubtle} pb-2.5`}>
                <div>
                  <span className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>Order #{order.id.slice(-5)}</span>
                  <h4 className="font-bold text-xs mt-0.5">{order.customer_name}</h4>
                  <p className="text-[10px] opacity-60">{new Date(order.created_at).toLocaleString()} &bull; Payment: <strong className="uppercase">{order.payment_method}</strong></p>
                </div>
                <select value={order.status} onChange={e => handleStatus(order.id, e.target.value as Order['status'])}
                  className={`${theme.selectBg} ${theme.accent} font-bold border text-[10px] rounded-xl px-2.5 py-1 outline-none`}>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="space-y-1 text-xs">
                {order.items.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px] opacity-80">
                    <span>{item.quantity}x {item.name}</span><span>{store.currency_symbol}{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className={`flex justify-between items-center border-t ${theme.borderSubtle} pt-2 text-xs font-bold`}>
                <span className="opacity-70">Total:</span><span className={`${theme.accent} text-sm`}>{store.currency_symbol}{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ ADMIN SETTINGS ============

interface AdminSettingsProps { store: Store; theme: ThemeDef; categories: Category[]; onUpdate: (updates: Partial<Store>) => Promise<void>; onUpgrade: () => void; onOpenQR: () => void; onRefresh: () => void; }

const AdminSettings: React.FC<AdminSettingsProps> = ({ store, theme, categories, onUpdate, onUpgrade, onOpenQR, onRefresh }) => {
  const [showCatModal, setShowCatModal] = useState(false);
  const [bannerInput, setBannerInput] = useState('');
  const planLimits = PLAN_LIMITS[store.plan] || PLAN_LIMITS.free;
  const payments = store.payments || {};
  const update = (partial: Partial<Store>) => onUpdate(partial);

  const handleAddBanner = async () => {
    if (!bannerInput.trim()) return;
    if ((await api.fetchBanners(store.id)).length >= planLimits.maxBanners) { alert(`Your plan allows up to ${planLimits.maxBanners} banner(s).`); return; }
    try { await api.addBanner(store.id, bannerInput.trim()); setBannerInput(''); onRefresh(); } catch { alert('Error adding banner'); }
  };
  const handleDeleteBanner = async (id: string) => { try { await api.deleteBanner(id); onRefresh(); } catch { alert('Error'); } };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className={`flex justify-between items-center border-b ${theme.borderSubtle} pb-3`}>
        <h2 className="text-lg font-bold">Settings</h2>
        <button onClick={onOpenQR} className={`${theme.accentBg} px-3 py-1.5 ${theme.cardRadius} text-xs font-bold flex items-center gap-1.5`}><QrCode size={14} /> QR Link</button>
      </div>
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between">
        <div><span className="text-[10px] uppercase font-bold opacity-80 tracking-wider">Active Plan</span><h3 className="text-base font-black flex items-center gap-1.5 mt-0.5"><Crown size={16} className="text-amber-300" /> {PLAN_LIMITS[store.plan].name}</h3></div>
        <button onClick={onUpgrade} className="bg-white text-slate-900 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-lg hover:bg-slate-100 transition-colors">Change Plan</button>
      </div>
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3.5 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>1. Store Information</p>
        <div>
          <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Store Name</label>
          <input type="text" value={store.name} onChange={e => update({ name: e.target.value })} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} />
        </div>
        <div>
          <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Tagline</label>
          <input type="text" value={store.slogan} onChange={e => update({ slogan: e.target.value })} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>WhatsApp Number</label>
            <input type="text" value={store.whatsapp} onChange={e => update({ whatsapp: e.target.value })} placeholder="+1 555 0123" className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} />
          </div>
          <div>
            <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Currency Symbol</label>
            <input type="text" value={store.currency_symbol} onChange={e => update({ currency_symbol: e.target.value })} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} />
          </div>
        </div>
      </div>
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3.5 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><CreditCard size={14} /> Payment Methods</p>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} space-y-2`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2"><Wallet size={14} className={theme.accent} /> Digital Wallet</label>
            <input type="checkbox" checked={payments.acceptsYape !== false} onChange={e => update({ payments: { ...payments, acceptsYape: e.target.checked } })} className="rounded focus:ring-0" />
          </div>
          <input type="text" placeholder="Wallet number (e.g. +1 555 0123)" value={payments.yapePlinNumber || ''} onChange={e => update({ payments: { ...payments, yapePlinNumber: e.target.value } })} className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none`} />
        </div>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} space-y-2`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2"><CreditCard size={14} className={theme.accent} /> Card / Payment Link</label>
            <input type="checkbox" checked={!!payments.acceptsCard} onChange={e => update({ payments: { ...payments, acceptsCard: e.target.checked } })} className="rounded focus:ring-0" />
          </div>
          <input type="text" placeholder="Stripe, PayPal, MercadoPago link..." value={payments.cardPaymentLink || ''} onChange={e => update({ payments: { ...payments, cardPaymentLink: e.target.value } })} className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none`} />
        </div>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} space-y-2`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2"><Building2 size={14} className={theme.accent} /> Bank Transfer</label>
            <input type="checkbox" checked={payments.acceptsBankTransfer !== false} onChange={e => update({ payments: { ...payments, acceptsBankTransfer: e.target.checked } })} className="rounded focus:ring-0" />
          </div>
          <textarea rows={2} placeholder="Bank name & account number" value={payments.bankAccountDetails || ''} onChange={e => update({ payments: { ...payments, bankAccountDetails: e.target.value } })} className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none resize-none`} />
        </div>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} flex items-center justify-between`}>
          <label className="text-xs font-bold flex items-center gap-2"><Banknote size={14} className={theme.accent} /> Cash on Delivery</label>
          <input type="checkbox" checked={payments.acceptsCash !== false} onChange={e => update({ payments: { ...payments, acceptsCash: e.target.checked } })} className="rounded focus:ring-0" />
        </div>
      </div>
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><Type size={14} /> Typography</p>
        <select value={store.font} onChange={e => update({ font: e.target.value })} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none font-medium`}>
          {AVAILABLE_FONTS.map(f => <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>{f.name}</option>)}
        </select>
      </div>
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><Palette size={14} /> Visual Theme</p>
        <div className="grid grid-cols-2 gap-2.5">
          {ALL_THEMES.map(t => (
            <button key={t.id} onClick={() => update({ theme: t.id })}
              className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center justify-between transition-all ${store.theme === t.id ? `${theme.accentBg} ring-2 ring-emerald-500/30` : `${theme.borderSubtle} hover:opacity-80`}`}>
              <span className="truncate pr-1">{t.name}</span><span className="w-4 h-4 rounded-full border shadow-sm shrink-0" style={{ backgroundColor: t.color }} />
            </button>
          ))}
        </div>
      </div>
      <CategoryManagerModal isOpen={showCatModal} onClose={() => setShowCatModal(false)} categories={categories} storeId={store.id} theme={theme} onSaved={onRefresh} />
    </div>
  );
};

// ============ CART VIEW ============

interface CartViewProps {
  cart: CartItem[]; store: Store; theme: ThemeDef;
  onUpdateQty: (id: string, delta: number) => void; onRemove: (id: string) => void;
  onClear: () => void; onBack: () => void; onOrder: (order: Omit<Order, 'id' | 'store_id' | 'created_at'>) => void;
}

const CartView: React.FC<CartViewProps> = ({ cart, store, theme, onUpdateQty, onRemove, onClear, onBack, onOrder }) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'card' | 'cash' | 'bank'>('yape');

  const subtotal = cart.reduce((sum, item) => {
    const price = (item.is_offer && item.offer_price) ? item.offer_price : item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleSend = () => {
    if (cart.length === 0) return;
    const newOrder: Omit<Order, 'id' | 'store_id' | 'created_at'> = {
      customer_name: customerName || 'WhatsApp Customer', phone: null, delivery_method: deliveryMethod,
      address, payment_method: paymentMethod,
      items: cart.map(i => ({ id: i.id, name: i.name, price: (i.is_offer && i.offer_price) ? i.offer_price : i.price, quantity: i.quantity, image: i.image })),
      total: subtotal, status: 'pending'
    };
    onOrder(newOrder);
    let payText = 'Digital Wallet'; if (paymentMethod === 'card') payText = 'Card'; if (paymentMethod === 'cash') payText = 'Cash'; if (paymentMethod === 'bank') payText = 'Bank Transfer';
    let text = `*NEW ORDER - ${store.name.toUpperCase()}*\n\n`;
    if (customerName) text += `*Customer:* ${customerName}\n`;
    text += `*Delivery:* ${deliveryMethod === 'delivery' ? 'Home delivery' : 'Store pickup'}\n`;
    if (deliveryMethod === 'delivery' && address) text += `*Address:* ${address}\n`;
    text += `*Payment:* ${payText}\n\n*Details:*\n`;
    cart.forEach(item => { const price = (item.is_offer && item.offer_price) ? item.offer_price : item.price; text += `${item.quantity}x ${item.name} (${store.currency_symbol}${(price * item.quantity).toFixed(2)})\n`; });
    text += `\n*TOTAL:* ${store.currency_symbol}${subtotal.toFixed(2)}`;
    const cleanPhone = store.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 animate-in fade-in duration-200">
        <div className={`w-20 h-20 mx-auto ${theme.sectionBg} rounded-full flex items-center justify-center ${theme.subtext} border ${theme.borderSubtle}`}><ShoppingBag size={36} /></div>
        <h3 className="font-bold text-base">Your cart is empty</h3>
        <p className={`text-xs max-w-xs mx-auto ${theme.subtext}`}>Browse the catalog and add your products.</p>
        <button onClick={onBack} className={`${theme.primary} px-5 py-3 ${theme.cardRadius} text-xs font-bold inline-flex items-center gap-2`}><ArrowLeft size={16} /> Browse Products</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className={`flex items-center justify-between border-b ${theme.borderSubtle} pb-3`}>
        <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag size={20} className={theme.accent} /> My Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
        <button onClick={onClear} className="text-xs text-red-400 hover:underline">Clear</button>
      </div>
      <div className="space-y-2">
        {cart.map(item => {
          const price = (item.is_offer && item.offer_price) ? item.offer_price : item.price;
          return (
            <div key={item.id} className={`${theme.card} p-3 ${theme.cardRadius} border flex items-center gap-3 shadow-sm`}>
              <img src={item.image} alt={item.name} className={`w-12 h-12 ${theme.cardRadius} object-cover shrink-0`} />
              <div className="flex-1 min-w-0"><h4 className="font-bold text-xs truncate">{item.name}</h4><p className={`text-xs font-bold ${theme.accent}`}>{store.currency_symbol}{(price * item.quantity).toFixed(2)}</p></div>
              <div className={`flex items-center gap-2 ${theme.sectionBg} p-1.5 rounded-xl border ${theme.borderSubtle}`}>
                <button onClick={() => onUpdateQty(item.id, -1)} className={`w-6 h-6 rounded-lg ${theme.badge} font-bold text-xs flex items-center justify-center`}>-</button>
                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className={`w-6 h-6 rounded-lg ${theme.badge} font-bold text-xs flex items-center justify-center`}>+</button>
              </div>
              <button onClick={() => onRemove(item.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
            </div>
          );
        })}
      </div>
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>1. Delivery Details</p>
        <div>
          <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Name</label>
          <input type="text" placeholder="Your name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} />
        </div>
        <div>
          <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Delivery Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDeliveryMethod('delivery')} className={`p-2.5 ${theme.cardRadius} border text-xs font-bold flex items-center justify-center gap-2 transition-all ${deliveryMethod === 'delivery' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><Truck size={15} /> Delivery</button>
            <button onClick={() => setDeliveryMethod('pickup')} className={`p-2.5 ${theme.cardRadius} border text-xs font-bold flex items-center justify-center gap-2 transition-all ${deliveryMethod === 'pickup' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><StoreIcon size={15} /> Pickup</button>
          </div>
        </div>
        {deliveryMethod === 'delivery' && <div><label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Address</label><input type="text" placeholder="Delivery address" value={address} onChange={e => setAddress(e.target.value)} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-emerald-500`} /></div>}
      </div>
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>2. Payment Method</p>
        <div className="grid grid-cols-2 gap-2">
          {store.payments?.acceptsYape !== false && <button onClick={() => setPaymentMethod('yape')} className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center gap-2 transition-all ${paymentMethod === 'yape' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><Wallet size={15} /> Wallet</button>}
          {store.payments?.acceptsCard && <button onClick={() => setPaymentMethod('card')} className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center gap-2 transition-all ${paymentMethod === 'card' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><CreditCard size={15} /> Card</button>}
          {store.payments?.acceptsBankTransfer !== false && <button onClick={() => setPaymentMethod('bank')} className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center gap-2 transition-all ${paymentMethod === 'bank' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><Building2 size={15} /> Bank</button>}
          {store.payments?.acceptsCash !== false && <button onClick={() => setPaymentMethod('cash')} className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center gap-2 transition-all ${paymentMethod === 'cash' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><Banknote size={15} /> Cash</button>}
        </div>
      </div>
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-xl`}>
        <div className="flex justify-between items-center text-sm font-bold"><span>Total:</span><span className={`text-lg font-black ${theme.accent}`}>{store.currency_symbol}{subtotal.toFixed(2)}</span></div>
        <button onClick={handleSend} className={`w-full ${theme.primary} py-3.5 ${theme.cardRadius} text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95`}><MessageCircle size={18} /> SEND ORDER VIA WHATSAPP</button>
      </div>
    </div>
  );
};

// ============ CATALOG VIEW ============

interface CatalogViewProps { products: Product[]; store: Store; theme: ThemeDef; banners: Banner[]; addToCart: (p: Product) => void; }

const CatalogView: React.FC<CatalogViewProps> = ({ products, store, theme, banners, addToCart }) => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedSub, setSelectedSub] = useState('All');
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'low' | 'high'>('default');

  const catNames = ['All', ...new Set(products.map(p => p.category))];
  const activeCatProducts = products.filter(p => p.category === selectedCat);
  const subs: string[] = selectedCat === 'All' ? [] : ['All', ...new Set(activeCatProducts.map(p => p.subcategory).filter((s): s is string => !!s))];

  let filtered = products.filter(p => {
    const mc = selectedCat === 'All' || p.category === selectedCat;
    const ms = selectedSub === 'All' || p.subcategory === selectedSub;
    const mo = !onlyOffers || p.is_offer;
    const msr = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return mc && ms && mo && msr;
  });
  if (sortBy === 'low') filtered.sort((a, b) => ((a.is_offer && a.offer_price) ? a.offer_price : a.price) - ((b.is_offer && b.offer_price) ? b.offer_price : b.price));
  if (sortBy === 'high') filtered.sort((a, b) => ((b.is_offer && b.offer_price) ? b.offer_price : b.price) - ((a.is_offer && a.offer_price) ? a.offer_price : a.price));

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {banners.length > 0 && (
        <div className={`relative ${theme.cardRadius} overflow-hidden shadow-xl border ${theme.borderSubtle} group`}>
          <img src={banners[0].image_url} alt="Banner" className="w-full h-36 sm:h-44 object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlayBg} via-transparent to-transparent flex items-end p-4`}>
            <div><span className={`${theme.primary} text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm`}>Featured</span><p className="text-white font-bold text-xs mt-1">Order online now!</p></div>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.subtext}`} />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full pl-10 pr-9 py-2.5 ${theme.selectBg} border ${theme.cardRadius} text-xs outline-none focus:border-emerald-500`} />
          {search && <button onClick={() => setSearch('')} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${theme.subtext}`}><X size={14} /></button>}
        </div>
        <button onClick={() => setOnlyOffers(!onlyOffers)} className={`px-3 py-2.5 ${theme.cardRadius} border text-xs font-bold flex items-center gap-1.5 transition-all ${onlyOffers ? 'bg-red-500 text-white border-red-600 shadow-lg' : `${theme.card} ${theme.borderSubtle}`}`}><Tag size={14} /> Sale</button>
        <button onClick={() => setSortBy(prev => prev === 'default' ? 'low' : prev === 'low' ? 'high' : 'default')} className={`p-2.5 ${theme.cardRadius} border text-xs font-bold flex items-center gap-1 ${theme.card} ${theme.borderSubtle}`}><ArrowUpDown size={15} /></button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {catNames.map(cat => <button key={cat} onClick={() => { setSelectedCat(cat); setSelectedSub('All'); }} className={`px-4 py-2 ${theme.cardRadius} text-xs font-bold whitespace-nowrap transition-all ${selectedCat === cat ? theme.primary : theme.badge}`}>{cat}</button>)}
      </div>
      {selectedCat !== 'All' && subs.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 items-center">
          <span className={`text-[10px] ${theme.subtext} font-bold uppercase mr-1`}>Sub:</span>
          {subs.map(sub => <button key={sub} onClick={() => setSelectedSub(sub)} className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap border transition-all ${selectedSub === sub ? theme.accentBg : `${theme.borderSubtle} opacity-60`}`}>{sub}</button>)}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className={`text-center py-14 border border-dashed ${theme.borderSubtle} ${theme.cardRadius} p-6 opacity-60 space-y-2 ${theme.subtext}`}><ShoppingBag size={36} className="mx-auto" /><p className="text-xs font-medium">No products found.</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => (
            <div key={p.id} className={`${theme.card} border ${theme.cardRadius} overflow-hidden shadow-md flex flex-col justify-between ${theme.cardHover} transition-all group`}>
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-36 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                {p.is_offer && <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md"><Tag size={10} /> SALE</span>}
                <span className={`absolute top-2 right-2 ${theme.sectionBg} text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border ${theme.borderSubtle}`}>{p.category}</span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div><h3 className="font-bold text-xs line-clamp-1">{p.name}</h3><p className={`text-[10px] ${theme.subtext} line-clamp-2 mt-0.5`}>{p.description}</p></div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {p.is_offer && p.offer_price ? (<div><span className="text-red-400 font-black text-sm block leading-none">{store.currency_symbol}{Number(p.offer_price).toFixed(2)}</span><span className="text-[10px] opacity-40 line-through">{store.currency_symbol}{Number(p.price).toFixed(2)}</span></div>) : (<span className={`font-black text-sm ${theme.accent}`}>{store.currency_symbol}{Number(p.price).toFixed(2)}</span>)}
                  </div>
                  <button onClick={() => addToCart(p)} className={`${theme.primary} text-[10px] font-bold px-3 py-1.5 ${theme.cardRadius} flex items-center gap-1 active:scale-95 transition-transform shadow-md`}><Plus size={13} /> Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ CLIENT STORE VIEW (Public, no auth) ============

interface ClientStoreViewProps { storeId: string; }

const ClientStoreView: React.FC<ClientStoreViewProps> = ({ storeId }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart'>('catalog');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const s = await api.fetchStoreById(storeId);
      if (!s) { setError('Store not found'); setLoading(false); return; }
      setStore(s);
      const [p, b] = await Promise.all([api.fetchProducts(storeId), api.fetchBanners(storeId)]);
      setProducts(p); setBanners(b);
    } catch { setError('Error loading store'); }
    setLoading(false);
  }, [storeId]);

  useEffect(() => { loadData(); }, [loadData]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, dbProductToCart(product)];
    });
  };
  const handleOrder = async (order: Omit<Order, 'id' | 'store_id' | 'created_at'>) => {
    try { await api.createOrder(storeId, order); setCart([]); setActiveTab('catalog'); } catch { alert('Error placing order'); }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>;
  if (error || !store) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400"><AlertCircle size={40} /><p className="text-sm">{error || 'Store unavailable'}</p></div>;

  const theme = THEMES[store.theme] || THEMES.proDark;
  const fontObj = AVAILABLE_FONTS.find(f => f.id === store.font) || AVAILABLE_FONTS[0];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradientBg} ${theme.text} flex justify-center`} style={{ fontFamily: fontObj.family, colorScheme: theme.isDark ? 'dark' : 'light' }}>
      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-2xl">
        <header className={`sticky top-0 z-40 ${theme.nav} p-3.5 shadow-md flex items-center justify-between border-b`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 ${theme.cardRadius} ${theme.primary} flex items-center justify-center font-black text-lg shadow-md shrink-0`}>{store.name.charAt(0)}</div>
            <div><h1 className="font-black text-sm leading-tight">{store.name}</h1><p className={`text-[10px] ${theme.subtext} truncate max-w-[170px]`}>{store.slogan}</p></div>
          </div>
          <button onClick={() => setActiveTab('cart')} className={`relative p-2 ${theme.sectionBg} ${theme.cardRadius} transition-colors`}>
            <ShoppingBag size={18} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
          </button>
        </header>
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          {activeTab === 'catalog' && <CatalogView products={products} store={store} theme={theme} banners={banners} addToCart={addToCart} />}
          {activeTab === 'cart' && <CartView cart={cart} store={store} theme={theme} onUpdateQty={(id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))} onRemove={id => setCart(prev => prev.filter(c => c.id !== id))} onClear={() => setCart([])} onBack={() => setActiveTab('catalog')} onOrder={handleOrder} />}
        </main>
        <nav className={`fixed bottom-0 left-0 right-0 ${theme.nav} border-t p-2 z-40 backdrop-blur-lg`}>
          <div className="max-w-md mx-auto grid grid-cols-2 gap-1 text-center">
            <button onClick={() => setActiveTab('catalog')} className={`py-2 ${theme.cardRadius} flex flex-col items-center gap-1 transition-all ${activeTab === 'catalog' ? `${theme.activeText} font-bold scale-105` : 'opacity-50'}`}><StoreIcon size={18} /><span className="text-[9px]">Catalog</span></button>
            <button onClick={() => setActiveTab('cart')} className={`py-2 ${theme.cardRadius} flex flex-col items-center gap-1 transition-all relative ${activeTab === 'cart' ? `${theme.activeText} font-bold scale-105` : 'opacity-50'}`}><ShoppingBag size={18} /><span className="text-[9px]">Cart</span>{cart.length > 0 && <span className="absolute top-1 right-3 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}</button>
          </div>
        </nav>
      </div>
    </div>
  );
};

// ============ ADMIN APP (authenticated merchant) ============

const AdminApp: React.FC = () => {
  const { store, signOut, refreshStore } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'products' | 'orders' | 'plans' | 'settings'>('catalog');
  const [showQR, setShowQR] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const refreshAll = useCallback(async () => {
    if (!store) return;
    try {
      const [p, c, b, o] = await Promise.all([api.fetchProducts(store.id), api.fetchCategories(store.id), api.fetchBanners(store.id), api.fetchOrders(store.id)]);
      setProducts(p); setCategories(c); setBanners(b); setOrders(o);
    } catch { }
    setLoadingData(false);
  }, [store]);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  if (!store) return null;

  const theme = THEMES[store.theme] || THEMES.proDark;
  const fontObj = AVAILABLE_FONTS.find(f => f.id === store.font) || AVAILABLE_FONTS[0];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, dbProductToCart(product)];
    });
  };
  const handleUpdateStore = async (updates: Partial<Store>) => {
    try { await api.updateStore(store.id, updates); await refreshStore(); } catch { alert('Error saving'); }
  };
  const handleOrder = async (order: Omit<Order, 'id' | 'store_id' | 'created_at'>) => {
    try { await api.createOrder(store.id, order); setCart([]); setActiveTab('catalog'); refreshAll(); } catch { alert('Error placing order'); }
  };
  const handleSelectPlan = async (plan: PlanType) => {
    try { await api.updatePlan(store.id, plan); await refreshStore(); } catch { alert('Error changing plan'); }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradientBg} ${theme.text} flex justify-center`} style={{ fontFamily: fontObj.family, colorScheme: theme.isDark ? 'dark' : 'light' }}>
      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-2xl">
        <header className={`sticky top-0 z-40 ${theme.nav} p-3.5 shadow-md flex items-center justify-between border-b`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 ${theme.cardRadius} ${theme.primary} flex items-center justify-center font-black text-lg shadow-md shrink-0`}>{store.name.charAt(0)}</div>
            <div><h1 className="font-black text-sm leading-tight">{store.name}</h1><p className={`text-[10px] ${theme.subtext} truncate max-w-[150px]`}>{store.slogan}</p></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowQR(true)} className={`p-2 ${theme.sectionBg} ${theme.cardRadius} transition-colors`} title="QR Code"><QrCode size={16} /></button>
            <button onClick={() => setActiveTab('cart')} className={`relative p-2 ${theme.sectionBg} ${theme.cardRadius} transition-colors`}>
              <ShoppingBag size={18} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
            </button>
            <button onClick={signOut} className={`p-2 ${theme.sectionBg} ${theme.cardRadius} hover:text-red-400 transition-colors`} title="Sign out"><LogOut size={16} /></button>
          </div>
        </header>
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          {loadingData ? <div className="flex items-center justify-center py-20"><Loader2 size={28} className={`animate-spin ${theme.accent}`} /></div> : (
            <>
              {activeTab === 'catalog' && <CatalogView products={products} store={store} theme={theme} banners={banners} addToCart={addToCart} />}
              {activeTab === 'cart' && <CartView cart={cart} store={store} theme={theme} onUpdateQty={(id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))} onRemove={id => setCart(prev => prev.filter(c => c.id !== id))} onClear={() => setCart([])} onBack={() => setActiveTab('catalog')} onOrder={handleOrder} />}
              {activeTab === 'products' && <AdminProducts products={products} store={store} theme={theme} categories={categories} onRefresh={refreshAll} onUpgrade={() => setActiveTab('plans')} />}
              {activeTab === 'orders' && <OrdersView orders={orders} store={store} theme={theme} onRefresh={refreshAll} />}
              {activeTab === 'plans' && <PlansView currentPlan={store.plan} productCount={products.length} bannerCount={banners.length} theme={theme} onSelectPlan={handleSelectPlan} />}
              {activeTab === 'settings' && <AdminSettings store={store} theme={theme} categories={categories} onUpdate={handleUpdateStore} onUpgrade={() => setActiveTab('plans')} onOpenQR={() => setShowQR(true)} onRefresh={refreshAll} />}
            </>
          )}
        </main>
        <nav className={`fixed bottom-0 left-0 right-0 ${theme.nav} border-t p-2 z-40 backdrop-blur-lg`}>
          <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
            <button onClick={() => setActiveTab('catalog')} className={`py-2 ${theme.cardRadius} flex flex-col items-center gap-1 transition-all ${activeTab === 'catalog' ? `${theme.activeText} font-bold scale-105` : 'opacity-50'}`}><StoreIcon size={18} /><span className="text-[9px]">Catalog</span></button>
            <button onClick={() => setActiveTab('cart')} className={`py-2 ${theme.cardRadius} flex flex-col items-center gap-1 transition-all relative ${activeTab === 'cart' ? `${theme.activeText} font-bold scale-105` : 'opacity-50'}`}><ShoppingBag size={18} /><span className="text-[9px]">Cart</span>{cart.length > 0 && <span className="absolute top-1 right-3 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}</button>
            <button onClick={() => setActiveTab('products')} className={`py-2 ${theme.cardRadius} flex flex-col items-center gap-1 transition-all ${activeTab === 'products' ? `${theme.activeText} font-bold scale-105` : 'opacity-50'}`}><Package size={18} /><span className="text-[9px]">Products</span></button>
            <button onClick={() => setActiveTab('orders')} className={`py-2 ${theme.cardRadius} flex flex-col items-center gap-1 transition-all relative ${activeTab === 'orders' ? `${theme.activeText} font-bold scale-105` : 'opacity-50'}`}><Clock size={18} /><span className="text-[9px]">Orders</span>{orders.filter(o => o.status === 'pending').length > 0 && <span className={`absolute top-1 right-3 ${theme.primary} text-slate-950 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center`}>{orders.filter(o => o.status === 'pending').length}</span>}</button>
            <button onClick={() => setActiveTab('settings')} className={`py-2 ${theme.cardRadius} flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? `${theme.activeText} font-bold scale-105` : 'opacity-50'}`}><Settings size={18} /><span className="text-[9px]">Settings</span></button>
          </div>
        </nav>
        <QRModal isOpen={showQR} onClose={() => setShowQR(false)} storeId={store.id} storeName={store.name} theme={theme} />
      </div>
    </div>
  );
};

// ============ ROOT APP ============

export default function App() {
  const { user, store, loading } = useAuth();
  const storeParam = new URLSearchParams(window.location.search).get('store');
  if (storeParam) return <ClientStoreView storeId={storeParam} />;
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>;
  if (!user || !store) return <AuthScreen />;
  return <AdminApp />;
}
