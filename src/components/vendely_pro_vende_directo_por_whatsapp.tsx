import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Pencil, X, ImageIcon, Tag, Lock, Store, Palette,
  Globe, Type, MessageCircle, ChevronRight, CheckCircle, ArrowLeft, 
  Truck, ShoppingBag, Search, FolderPlus, Layers, Check, Zap, Crown, 
  Share2, Package, CheckCircle2, Edit3, QrCode, Settings,
  Clock, Smartphone, ArrowUpDown, Copy, ExternalLink,
  Eye, RefreshCw, Sparkles, Filter, CreditCard, Banknote, Building2,
  ShieldCheck, LockKeyhole, UserCheck, ToggleLeft, ToggleRight
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  isOffer?: boolean;
  category: string;
  subcategory?: string;
  image: string;
  stock?: number;
  isFeatured?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  subcategories: string[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
}

export type PlanType = 'free' | 'monthly' | 'yearly';

export interface PaymentConfig {
  yapePlinNumber?: string;
  yapePlinHolder?: string;
  bankAccountDetails?: string;
  cardPaymentLink?: string;
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  acceptsYape?: boolean;
  acceptsBankTransfer?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  phone?: string;
  deliveryMethod: 'delivery' | 'pickup';
  address?: string;
  paymentMethod: 'yape' | 'card' | 'cash' | 'bank';
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered';
}

export interface StoreConfig {
  storeId: string;
  name: string;
  rubro: string;
  slogan: string;
  whatsapp: string;
  logo: string;
  currencySymbol: string;
  country: string;
  theme: string;
  font: string;
  plan: PlanType;
  banners: Banner[];
  categories: CategoryItem[];
  payments: PaymentConfig;
  adminPin?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export const AVAILABLE_FONTS = [
  { id: 'Inter', name: 'Inter (Moderna & Limpia)', family: "'Inter', sans-serif" },
  { id: 'Playfair Display', name: 'Playfair (Elegante & Luxe)', family: "'Playfair Display', serif" },
  { id: 'Poppins', name: 'Poppins (Fresco & Geométrico)', family: "'Poppins', sans-serif" },
  { id: 'Raleway', name: 'Raleway (Sofisticado)', family: "'Raleway', sans-serif" },
  { id: 'Nunito', name: 'Nunito (Amigable & Redondeado)', family: "'Nunito', sans-serif" }
];

export const PLAN_LIMITS: Record<PlanType, {
  name: string;
  priceText: string;
  badge: string;
  maxProducts: number;
  maxBanners: number;
  offers: boolean;
  typography: boolean;
  features: string[];
}> = {
  free: {
    name: 'Plan Starter',
    priceText: 'S/ 0 / mes',
    badge: 'Gratis',
    maxProducts: 8,
    maxBanners: 1,
    offers: false,
    typography: false,
    features: [
      'Hasta 8 productos activos',
      'Categorías y subcategorías ilimitadas',
      '1 Banner destacado',
      'Pedidos directos a WhatsApp',
      'Código QR exclusivo para clientes',
      'Múltiples métodos de pago Perú'
    ]
  },
  monthly: {
    name: 'Plan Emprendedor Pro',
    priceText: 'S/ 29 / mes',
    badge: 'Popular',
    maxProducts: Infinity,
    maxBanners: 5,
    offers: true,
    typography: true,
    features: [
      'Productos ILIMITADOS',
      'Badges y Etiquetas de Oferta 🔥',
      'Hasta 5 Banners promocionales',
      'Tipografías avanzadas de Google Fonts',
      'Yape, Plin, Tarjetas e IziPay/Culqi',
      'Registro histórico de pedidos',
      'Soporte prioritario por WhatsApp'
    ]
  },
  yearly: {
    name: 'Plan Enterprise Play',
    priceText: 'S/ 249 / año',
    badge: 'Ahorra 35%',
    maxProducts: Infinity,
    maxBanners: Infinity,
    offers: true,
    typography: true,
    features: [
      'Todo lo del Plan Emprendedor',
      'Banners y Colecciones ilimitadas',
      'Modo Tienda Exclusivo para Clientes',
      'Dominio y Enlace corto personalizado',
      'Sin comisión por venta',
      'Asesoría en catálogo y pasarelas'
    ]
  }
};

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Ropa & Moda', subcategories: ['Polos', 'Pantalones', 'Casacas', 'Zapatillas'] },
  { id: 'cat-2', name: 'Alimentos & Dulces', subcategories: ['Snacks', 'Bebidas', 'Postres', 'Café'] },
  { id: 'cat-3', name: 'Hogar & Deco', subcategories: ['Cocina', 'Velas', 'Organización'] },
  { id: 'cat-4', name: 'Tecnología', subcategories: ['Accesorios', 'Audífonos', 'Fundas'] },
  { id: 'cat-5', name: 'Belleza', subcategories: ['Skincare', 'Maquillaje', 'Perfumes'] },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Café Orgánico Gourmet 250g',
    description: 'Café de origen seleccionado a mano. Notas dulces de caramelo, cacao y almendras.',
    price: 32.00,
    offerPrice: 26.50,
    isOffer: true,
    category: 'Alimentos & Dulces',
    subcategory: 'Café',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
    stock: 15,
    isFeatured: true
  },
  {
    id: 'prod-2',
    name: 'Taza Botánica Cerámica Handcrafted',
    description: 'Taza moldeada y pintada en torno artesanal con esmalte mate atóxico 350ml.',
    price: 42.00,
    offerPrice: 35.00,
    isOffer: true,
    category: 'Hogar & Deco',
    subcategory: 'Cocina',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    stock: 8,
    isFeatured: true
  },
  {
    id: 'prod-3',
    name: 'Audífonos SoundAir Pro Inalámbricos',
    description: 'Cancelación activa de ruido, audio Hi-Fi con estuche de carga rápida de 28 horas.',
    price: 139.00,
    offerPrice: 99.00,
    isOffer: true,
    category: 'Tecnología',
    subcategory: 'Audífonos',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    stock: 20,
    isFeatured: true
  },
  {
    id: 'prod-4',
    name: 'Polo Heavy Cotton Oversize Pro',
    description: 'Algodón peruano 100% reactivo. Costura reforzada y corte streetwear relajado.',
    price: 65.00,
    offerPrice: 52.00,
    isOffer: false,
    category: 'Ropa & Moda',
    subcategory: 'Polos',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    stock: 12
  }
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'
];

const THEMES: Record<string, any> = {
  proDark: {
    bg: 'bg-slate-950',
    card: 'bg-slate-900/90 border-slate-800 text-slate-100 backdrop-blur-md',
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-600 hover:to-teal-700',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    badge: 'bg-slate-800 text-slate-300 border border-slate-700',
    text: 'text-slate-100',
    subtext: 'text-slate-400',
    nav: 'bg-slate-900/95 border-slate-800 backdrop-blur-lg',
    selectBg: 'bg-slate-900 text-slate-100 border-slate-800',
    gradientBg: 'from-slate-950 via-slate-900 to-emerald-950/30'
  },
  elegante: {
    bg: 'bg-[#0B0914]',
    card: 'bg-[#151226]/90 border-[#2A2447] text-purple-50 backdrop-blur-md shadow-lg',
    primary: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50 hover:opacity-95',
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    badge: 'bg-[#201B3A] text-violet-200 border border-[#322A59]',
    text: 'text-purple-50',
    subtext: 'text-purple-300/60',
    nav: 'bg-[#120F21]/95 border-[#2A2447] backdrop-blur-lg',
    selectBg: 'bg-[#151226] text-purple-100 border-[#2A2447]',
    gradientBg: 'from-[#0B0914] via-[#141026] to-[#1F153B]'
  },
  goldLuxury: {
    bg: 'bg-[#0F1115]',
    card: 'bg-[#181B22] border-[#2A2F3D] text-amber-50 backdrop-blur-md shadow-md',
    primary: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-950/40',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    badge: 'bg-[#232834] text-amber-200/80 border border-[#343D50]',
    text: 'text-amber-50',
    subtext: 'text-slate-400',
    nav: 'bg-[#14171D] border-[#2A2F3D]',
    selectBg: 'bg-[#181B22] text-amber-100 border-[#2A2F3D]',
    gradientBg: 'from-[#0F1115] via-[#161920] to-[#251F10]/40'
  },
  roseGold: {
    bg: 'bg-[#FAF5F7]',
    card: 'bg-white/90 border-[#F3E2E8] text-[#3D2730] shadow-sm backdrop-blur-md',
    primary: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200',
    accent: 'text-rose-600',
    accentBg: 'bg-rose-100/70 text-rose-800 border border-rose-200',
    badge: 'bg-[#F7EBF0] text-[#7A5060]',
    text: 'text-[#3D2730]',
    subtext: 'text-[#8C6B77]',
    nav: 'bg-white/95 border-[#F3E2E8]',
    selectBg: 'bg-white text-[#3D2730] border-[#F3E2E8]',
    gradientBg: 'from-[#FAF5F7] via-[#F8EDF1] to-[#F1DEE5]'
  },
  artesanal: {
    bg: 'bg-[#FAF6F0]',
    card: 'bg-white/90 border-[#E8DFC8] text-[#2D2825] shadow-xs backdrop-blur-md',
    primary: 'bg-gradient-to-r from-[#D96B43] to-[#C2542D] text-white shadow-md shadow-[#D96B43]/20',
    accent: 'text-[#D96B43]',
    accentBg: 'bg-[#FBEBE4] text-[#C2542D]',
    badge: 'bg-[#F3EDE2] text-[#6E6359]',
    text: 'text-[#2D2825]',
    subtext: 'text-[#7C7267]',
    nav: 'bg-white/95 border-[#E8DFC8]',
    selectBg: 'bg-white text-[#2D2825] border-[#E8DFC8]',
    gradientBg: 'from-[#FAF6F0] via-[#F4ECE1] to-[#EBDDCB]'
  },
  moderno: {
    bg: 'bg-gray-50',
    card: 'bg-white border-gray-100 text-gray-900 shadow-sm',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200',
    accent: 'text-indigo-600',
    accentBg: 'bg-indigo-50 text-indigo-700',
    badge: 'bg-gray-100 text-gray-600',
    text: 'text-gray-900',
    subtext: 'text-gray-500',
    nav: 'bg-white/95 border-gray-200',
    selectBg: 'bg-white text-gray-900 border-gray-200',
    gradientBg: 'from-gray-50 via-slate-50 to-indigo-50/30'
  },
  cyberNeon: {
    bg: 'bg-[#050B14]',
    card: 'bg-[#0A1628]/90 border-[#142C4E] text-cyan-50 backdrop-blur-md',
    primary: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black shadow-lg shadow-cyan-950/60 hover:opacity-90',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    badge: 'bg-[#0E203A] text-cyan-200 border border-[#183660]',
    text: 'text-cyan-50',
    subtext: 'text-cyan-200/60',
    nav: 'bg-[#081220]/95 border-[#142C4E]',
    selectBg: 'bg-[#0A1628] text-cyan-100 border-[#142C4E]',
    gradientBg: 'from-[#050B14] via-[#08152B] to-[#0A223D]'
  },
  nordicMint: {
    bg: 'bg-[#F2F8F6]',
    card: 'bg-white/95 border-[#D2E7E2] text-[#1E3832] shadow-sm',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    badge: 'bg-[#E4F2EE] text-[#345B51]',
    text: 'text-[#1E3832]',
    subtext: 'text-[#577A72]',
    nav: 'bg-white/95 border-[#D2E7E2]',
    selectBg: 'bg-white text-[#1E3832] border-[#D2E7E2]',
    gradientBg: 'from-[#F2F8F6] via-[#E7F3F0] to-[#DCECE7]'
  }
};

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onSaveCategories: (cats: CategoryItem[]) => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen, onClose, categories, onSaveCategories
}) => {
  const [cats, setCats] = useState<CategoryItem[]>(categories);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  
  const [selectedCatForSub, setSelectedCatForSub] = useState<string | null>(categories[0]?.id || null);
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    setCats(categories);
    if (categories.length > 0 && !selectedCatForSub) {
      setSelectedCatForSub(categories[0].id);
    }
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      subcategories: [],
    };
    const updated = [...cats, newCat];
    setCats(updated);
    onSaveCategories(updated);
    setNewCatName('');
    setSelectedCatForSub(newCat.id);
  };

  const handleSaveEditCat = (id: string) => {
    if (!editingCatName.trim()) return;
    const updated = cats.map(c => c.id === id ? { ...c, name: editingCatName.trim() } : c);
    setCats(updated);
    onSaveCategories(updated);
    setEditingCatId(null);
  };

  const handleDeleteCat = (id: string) => {
    const updated = cats.filter(c => c.id !== id);
    setCats(updated);
    onSaveCategories(updated);
    if (selectedCatForSub === id) {
      setSelectedCatForSub(updated[0]?.id || null);
    }
  };

  const handleAddSubcategory = () => {
    if (!selectedCatForSub || !newSubName.trim()) return;
    const updated = cats.map(c => {
      if (c.id === selectedCatForSub) {
        if (c.subcategories.includes(newSubName.trim())) return c;
        return { ...c, subcategories: [...c.subcategories, newSubName.trim()] };
      }
      return c;
    });
    setCats(updated);
    onSaveCategories(updated);
    setNewSubName('');
  };

  const handleDeleteSub = (subName: string) => {
    if (!selectedCatForSub) return;
    const updated = cats.map(c => {
      if (c.id === selectedCatForSub) {
        return { ...c, subcategories: c.subcategories.filter(s => s !== subName) };
      }
      return c;
    });
    setCats(updated);
    onSaveCategories(updated);
  };

  const activeCategory = cats.find(c => c.id === selectedCatForSub);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Gestor de Categorías & Secciones</h3>
              <p className="text-xs text-slate-500">Organiza tu catálogo para tus clientes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Categorías Principales */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            1. Categorías Principales
          </label>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nueva categoría (ej. Calzado, Cosmética)..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
            />
            <button 
              onClick={handleAddCategory}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-200 transition-all active:scale-95"
            >
              <Plus size={15} /> Añadir
            </button>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {cats.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => setSelectedCatForSub(cat.id)}
                className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  selectedCatForSub === cat.id 
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-500/30' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                {editingCatId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2" onClick={e => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editingCatName} 
                      onChange={e => setEditingCatName(e.target.value)}
                      className="flex-1 bg-white border border-emerald-500 rounded-xl px-2.5 py-1 text-xs outline-none text-slate-800"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSaveEditCat(cat.id)} 
                      className="p-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                    >
                      <Check size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-800 truncate">{cat.name}</span>
                    <span className="text-[10px] bg-slate-200/80 font-bold text-slate-600 px-2 py-0.5 rounded-full">
                      {cat.subcategories.length} sub
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {editingCatId !== cat.id && (
                    <button 
                      onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }} 
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteCat(cat.id)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Subcategorías */}
        {activeCategory ? (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              2. Subcategorías de <span className="text-emerald-600">"{activeCategory.name}"</span>
            </label>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={`Subcategoría para ${activeCategory.name}...`}
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubcategory())}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs outline-none focus:border-emerald-500 text-slate-800"
              />
              <button 
                onClick={handleAddSubcategory}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>

            {activeCategory.subcategories.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded-2xl">
                Sin subcategorías aún. Agrega una para filtrar mejor tus productos.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeCategory.subcategories.map((sub, idx) => (
                  <div key={idx} className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <span>{sub}</span>
                    <button onClick={() => handleDeleteSub(sub)} className="text-slate-400 hover:text-red-500 p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">Selecciona o crea una categoría arriba.</p>
        )}

        <button 
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl text-xs font-bold mt-2 shadow-lg transition-all"
        >
          Guardar Cambios y Cerrar
        </button>
      </div>
    </div>
  );
};

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, storeName }) => {
  if (!isOpen) return null;

  // Generate clean client-only URL (appends mode=client)
  const origin = window.location.origin + window.location.pathname;
  const clientUrl = `${origin}?mode=client`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <QrCode size={18} className="text-emerald-600" /> Código QR para Clientes
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 p-6 rounded-3xl text-white space-y-3 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 backdrop-blur-md text-emerald-100 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-white/20 mb-2">
              <ShieldCheck size={12} /> Solo Catálogo & Carrito
            </span>
            <p className="font-black text-lg text-white drop-shadow-sm">{storeName}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl relative z-10 border border-emerald-100">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(clientUrl)}`} 
              alt="Código QR de la Tienda"
              className="w-44 h-44 mx-auto rounded-lg"
            />
          </div>
          <p className="text-[10px] text-emerald-100 font-medium relative z-10">
            Tus clientes escanearán esto para ver **únicamente** tus productos y hacer pedidos. No verán tu panel de administración.
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => {
              document.execCommand('copy');
              navigator.clipboard?.writeText(clientUrl);
              alert('¡Enlace exclusivo para clientes copiado al portapapeles!');
            }}
            className="w-full bg-slate-900 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            <Copy size={14} /> Copiar Enlace para Clientes
          </button>
          <a
            href={clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors block text-center"
          >
            <ExternalLink size={14} /> Probar Vista de Cliente
          </a>
        </div>
      </div>
    </div>
  );
};

interface PlansViewProps {
  currentPlan: PlanType;
  productCount: number;
  bannerCount: number;
  theme: any;
  onSelectPlan: (plan: PlanType) => void;
}

const PlansView: React.FC<PlansViewProps> = ({
  currentPlan, productCount, bannerCount, theme, onSelectPlan
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
          <Crown size={14} className="text-amber-400" /> Suscripción & Planes Pro
        </div>
        <h2 className="text-2xl font-black tracking-tight">Potencia tu Negocio Digital</h2>
        <p className={`text-xs ${theme.subtext}`}>Desbloquea ventas ilimitadas, pasarelas de pago y diseño premium</p>
      </div>

      {/* Estado del Plan */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-md`}>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold flex items-center gap-1.5">
            <Zap size={15} className="text-emerald-500" /> Plan Actual
          </span>
          <span className="font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
            {PLAN_LIMITS[currentPlan].name}
          </span>
        </div>
        
        {/* Límite Productos */}
        <div>
          <div className="flex justify-between text-[11px] mb-1 font-semibold opacity-80">
            <span>Productos ingresados:</span>
            <span>
              {productCount} / {PLAN_LIMITS[currentPlan].maxProducts === Infinity ? '∞ Ilimitados' : PLAN_LIMITS[currentPlan].maxProducts}
            </span>
          </div>
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                productCount >= PLAN_LIMITS[currentPlan].maxProducts ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{
                width: PLAN_LIMITS[currentPlan].maxProducts === Infinity 
                  ? '100%' 
                  : `${Math.min(100, (productCount / PLAN_LIMITS[currentPlan].maxProducts) * 100)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Lista de Planes */}
      <div className="space-y-4">
        {(Object.keys(PLAN_LIMITS) as PlanType[]).map((planKey) => {
          const plan = PLAN_LIMITS[planKey];
          const isCurrent = currentPlan === planKey;

          return (
            <div 
              key={planKey}
              className={`p-5 rounded-3xl border-2 transition-all relative ${
                isCurrent 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-xl ring-1 ring-emerald-500/40' 
                  : `${theme.card} border-slate-800/80 hover:border-slate-700`
              }`}
            >
              {planKey === 'monthly' && (
                <span className="absolute -top-3 right-5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  🔥 {plan.badge}
                </span>
              )}

              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-base">{plan.name}</h3>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{plan.priceText}</p>
                </div>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={12} /> Plan Activo
                  </span>
                )}
              </div>

              <ul className="space-y-2 text-xs opacity-90 mb-5">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan(planKey)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-800/60 text-slate-400 cursor-default'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-emerald-950/50'
                }`}
              >
                {isCurrent ? 'Plan Actual Activado' : `Activar ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface AdminProductsProps {
  products: Product[];
  storeConfig: StoreConfig;
  theme: any;
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStoreConfig: (config: StoreConfig) => void;
  onUpgrade: () => void;
}

type FormState = {
  name: string; 
  price: string; 
  category: string; 
  customCategory: string;
  isCustomCategory: boolean;
  subcategory: string; 
  customSubcategory: string;
  isCustomSubcategory: boolean;
  description: string; 
  image: string; 
  isOffer: boolean; 
  offerPrice: string;
  stock: string;
  isFeatured: boolean;
};

const EMPTY_FORM: FormState = {
  name: '', 
  price: '', 
  category: '', 
  customCategory: '',
  isCustomCategory: false,
  subcategory: '', 
  customSubcategory: '',
  isCustomSubcategory: false,
  description: '',
  image: '', 
  isOffer: false, 
  offerPrice: '',
  stock: '10',
  isFeatured: false
};

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products, storeConfig, theme, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateStoreConfig, onUpgrade
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const planLimits = PLAN_LIMITS[storeConfig.plan] || PLAN_LIMITS.free;
  const canAddMore = products.length < planLimits.maxProducts;
  const categoriesList: CategoryItem[] = storeConfig.categories || DEFAULT_CATEGORIES;

  const currentCategoryObj = categoriesList.find(c => c.name === form.category);
  const availableSubcategories = currentCategoryObj ? currentCategoryObj.subcategories : [];

  const openAdd = () => {
    if (!canAddMore) { onUpgrade(); return; }
    setEditingProduct(null);
    const initialCat = categoriesList[0]?.name || 'General';
    setForm({
      ...EMPTY_FORM,
      category: initialCat,
      subcategory: categoriesList[0]?.subcategories[0] || '',
      image: PRESET_IMAGES[Math.floor(Math.random() * PRESET_IMAGES.length)]
    });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    const catExists = categoriesList.some(c => c.name === p.category);
    
    setForm({
      name: p.name, 
      price: String(p.price), 
      category: catExists ? p.category : '',
      customCategory: !catExists ? p.category : '',
      isCustomCategory: !catExists,
      subcategory: p.subcategory || '', 
      customSubcategory: '',
      isCustomSubcategory: false,
      description: p.description,
      image: p.image, 
      isOffer: p.isOffer || false,
      offerPrice: p.offerPrice ? String(p.offerPrice) : '',
      stock: String(p.stock || 10),
      isFeatured: p.isFeatured || false
    });
    setShowModal(true);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const finalCategory = form.isCustomCategory 
      ? (form.customCategory.trim() || 'General')
      : (form.category || categoriesList[0]?.name || 'General');

    const finalSubcategory = form.isCustomSubcategory 
      ? form.customSubcategory.trim()
      : form.subcategory;

    const data = {
      name: form.name,
      price: parseFloat(form.price),
      category: finalCategory,
      subcategory: finalSubcategory || undefined,
      description: form.description,
      image: form.image || PRESET_IMAGES[0],
      isOffer: planLimits.offers ? form.isOffer : false,
      offerPrice: (planLimits.offers && form.isOffer && form.offerPrice) ? parseFloat(form.offerPrice) : undefined,
      stock: parseInt(form.stock) || 10,
      isFeatured: form.isFeatured
    };

    if (editingProduct) {
      onUpdateProduct({ ...data, id: editingProduct.id });
    } else {
      onAddProduct(data);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-lg font-bold">Gestión de Productos</h2>
          <p className={`text-xs ${theme.subtext}`}>
            Plan <strong className="uppercase text-emerald-400">{storeConfig.plan}</strong> — {products.length}
            {planLimits.maxProducts !== Infinity ? `/${planLimits.maxProducts}` : ''} registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCatManager(true)}
            className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-bold border border-slate-700 transition-colors"
          >
            <FolderPlus size={14} /> Secciones
          </button>
          <button onClick={openAdd}
            className={`${theme.primary} px-3.5 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-bold shadow-md`}>
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      {!canAddMore && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-amber-200 text-xs">
          <Lock size={16} className="text-amber-400 shrink-0" />
          <p>
            Alcanzaste el límite de tu plan Starter (8 productos).{' '}
            <button onClick={onUpgrade} className="font-bold underline text-amber-300">Actualiza tu plan</button> para vender ilimitado.
          </p>
        </div>
      )}

      {/* Lista de productos */}
      <div className="space-y-2.5">
        {products.length === 0 && (
          <div className="text-center py-14 opacity-50 text-xs space-y-2">
            <Package size={40} className="mx-auto text-slate-400" />
            <p>Aún no tienes productos cargados. ¡Añade tu primero!</p>
          </div>
        )}
        {products.map(p => (
          <div key={p.id} className={`${theme.card} p-3 rounded-2xl border flex items-center gap-3 shadow-sm hover:border-emerald-500/40 transition-colors`}>
            <img src={p.image} alt={p.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-black/10" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-xs truncate">{p.name}</h4>
                {p.isOffer && <span className="bg-red-500/20 text-red-400 text-[8px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">OFERTA</span>}
                {p.isFeatured && <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">TOP</span>}
              </div>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">{p.category}</span>
                {p.subcategory && <span className="text-[9px] opacity-60 bg-white/5 px-2 py-0.5 rounded-full">{p.subcategory}</span>}
                <span className="text-[9px] opacity-60">Stock: {p.stock || 10}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                {p.isOffer && p.offerPrice ? (
                  <><span className="text-red-400 font-bold text-xs block">{storeConfig.currencySymbol}{p.offerPrice.toFixed(2)}</span>
                  <span className="text-[9px] opacity-40 line-through">{storeConfig.currencySymbol}{p.price.toFixed(2)}</span></>
                ) : (
                  <span className={`font-bold text-xs ${theme.accent}`}>{storeConfig.currencySymbol}{p.price.toFixed(2)}</span>
                )}
              </div>
              <button onClick={() => openEdit(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"><Pencil size={14} /></button>
              <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Agregar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-5 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-100">{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Nombre del Producto *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Ej. Taza Artesanal Cerámica"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs outline-none focus:border-emerald-500 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Precio Normal *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    placeholder="29.90" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs outline-none focus:border-emerald-500 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Precio Oferta {!planLimits.offers && <span className="text-amber-400">(Pro)</span>}
                  </label>
                  <input type="number" step="0.01" value={form.offerPrice}
                    onChange={e => setForm({...form, offerPrice: e.target.value, isOffer: e.target.value !== ''})}
                    placeholder="19.90" disabled={!planLimits.offers}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs outline-none focus:border-red-500 disabled:opacity-40 text-white" />
                </div>
              </div>

              {planLimits.offers && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={form.isOffer} onChange={e => setForm({...form, isOffer: e.target.checked})} className="rounded text-emerald-500 focus:ring-0" />
                  <span className="text-xs font-semibold text-slate-300">Marcar producto como OFERTA 🔥</span>
                </label>
              )}

              {/* Selección Categoría */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Categoría Principal</label>
                <select 
                  value={form.category} 
                  onChange={e => {
                    const newCat = e.target.value;
                    const firstSub = categoriesList.find(c => c.name === newCat)?.subcategories[0] || '';
                    setForm({ ...form, category: newCat, subcategory: firstSub });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs outline-none focus:border-emerald-500 text-slate-100 font-medium"
                >
                  {categoriesList.map(c => <option key={c.id} value={c.name} className="bg-slate-900 text-slate-100">{c.name}</option>)}
                </select>
              </div>

              {/* Subcategoría */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Subcategoría (Opcional)</label>
                <select 
                  value={form.subcategory} 
                  onChange={e => setForm({...form, subcategory: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs outline-none focus:border-emerald-500 text-slate-100"
                >
                  <option value="" className="bg-slate-900 text-slate-100">Sin subcategoría</option>
                  {availableSubcategories.map(s => <option key={s} value={s} className="bg-slate-900 text-slate-100">{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Descripción</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Detalles, dimensiones, sabores..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs resize-none outline-none focus:border-emerald-500 text-white" />
              </div>

              {/* Imágenes preset */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Imagen del Producto</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((imgUrl, i) => (
                    <img 
                      key={i} 
                      src={imgUrl} 
                      alt="" 
                      onClick={() => setForm({ ...form, image: imgUrl })}
                      className={`h-12 w-full object-cover rounded-xl cursor-pointer border-2 transition-all ${
                        form.image === imgUrl ? 'border-emerald-500 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <label className="flex items-center justify-center gap-2 bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-2.5 cursor-pointer hover:border-slate-700 transition-colors">
                  <ImageIcon size={16} className="text-slate-400" />
                  <span className="text-xs text-slate-400 font-medium">O sube una imagen propia</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-2xl text-xs font-bold">Cancelar</button>
                <button type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-2xl text-xs font-bold shadow-lg">
                  {editingProduct ? 'Guardar Cambios' : 'Publicar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CategoryManagerModal 
        isOpen={showCatManager}
        onClose={() => setShowCatManager(false)}
        categories={categoriesList}
        onSaveCategories={cats => onUpdateStoreConfig({ ...storeConfig, categories: cats })}
      />
    </div>
  );
};

interface OrdersViewProps {
  orders: Order[];
  storeConfig: StoreConfig;
  theme: any;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, storeConfig, theme, onUpdateOrderStatus }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-lg font-bold">Historial de Pedidos</h2>
          <p className={`text-xs ${theme.subtext}`}>Pedidos recibidos de tus clientes vía WhatsApp</p>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full text-xs border border-emerald-500/30">
          {orders.length} pedidos
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3 opacity-50">
          <Clock size={40} className="mx-auto text-slate-400" />
          <p className="text-xs font-medium">Aún no has registrado pedidos. Aparecerán cuando tus clientes hagan compras.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-md`}>
              <div className="flex justify-between items-start border-b border-white/10 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Pedido #{order.id.slice(-5)}
                  </span>
                  <h4 className="font-bold text-xs mt-0.5">{order.customerName}</h4>
                  <p className="text-[10px] opacity-60">{order.createdAt} • Pago: <strong className="uppercase">{order.paymentMethod}</strong></p>
                </div>
                
                <select 
                  value={order.status}
                  onChange={e => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                  className={`${theme.selectBg} text-emerald-400 font-bold border text-[10px] rounded-xl px-2.5 py-1 outline-none`}
                >
                  <option value="pending" className={theme.selectBg}>⏳ Pendiente</option>
                  <option value="preparing" className={theme.selectBg}>🍳 En Preparación</option>
                  <option value="shipped" className={theme.selectBg}>🚚 Enviado</option>
                  <option value="delivered" className={theme.selectBg}>✅ Entregado</option>
                </select>
              </div>

              <div className="space-y-1 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] opacity-80">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{storeConfig.currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-2 text-xs font-bold">
                <span className="opacity-70">Total del Pedido:</span>
                <span className="text-emerald-400 text-sm">{storeConfig.currencySymbol}{order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface AdminSettingsProps {
  storeConfig: StoreConfig;
  theme: any;
  onUpdate: (config: StoreConfig) => void;
  onUpgrade: () => void;
  onOpenQR: () => void;
}

const ALL_THEMES = [
  { id: 'proDark',     name: 'Pro Dark Velvet', color: '#10B981', bg: '#090D16' },
  { id: 'elegante',    name: 'Elegante Noir',   color: '#8B5CF6', bg: '#0B0914' },
  { id: 'goldLuxury',  name: 'Gold Luxury',     color: '#F59E0B', bg: '#0F1115' },
  { id: 'roseGold',    name: 'Rose Gold & Blush', color: '#F43F5E', bg: '#FAF5F7' },
  { id: 'artesanal',   name: 'Warm Craft',      color: '#D96B43', bg: '#FAF6F0' },
  { id: 'moderno',     name: 'Clean Slate',     color: '#4F46E5', bg: '#F8FAFC' },
  { id: 'cyberNeon',   name: 'Cyber Neon Glow', color: '#06B6D4', bg: '#050B14' },
  { id: 'nordicMint',  name: 'Nordic Fresh Mint', color: '#059669', bg: '#F2F8F6' },
];

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  storeConfig, theme, onUpdate, onUpgrade, onOpenQR
}) => {
  const [showCatModal, setShowCatModal] = useState(false);
  const [bannerInput, setBannerInput] = useState('');
  const categoriesList = storeConfig.categories || DEFAULT_CATEGORIES;
  const planLimits = PLAN_LIMITS[storeConfig.plan] || PLAN_LIMITS.free;

  const update = (partial: Partial<StoreConfig>) => onUpdate({ ...storeConfig, ...partial });

  const handleAddBanner = () => {
    if (!bannerInput.trim()) return;
    if ((storeConfig.banners?.length || 0) >= planLimits.maxBanners) {
      alert(`Tu plan te permite hasta ${planLimits.maxBanners} banner(s). ¡Pásate a Pro!`);
      return;
    }
    const newBanner: Banner = { id: `b-${Date.now()}`, imageUrl: bannerInput.trim() };
    update({ banners: [...(storeConfig.banners || []), newBanner] });
    setBannerInput('');
  };

  const handleDeleteBanner = (id: string) => {
    update({ banners: (storeConfig.banners || []).filter(b => b.id !== id) });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <h2 className="text-lg font-bold">Ajustes & Configuración</h2>
        <button 
          onClick={onOpenQR}
          className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <QrCode size={14} /> Enlace QR Cliente
        </button>
      </div>

      {/* Banner Suscripción */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold opacity-80 tracking-wider">Plan Activo</span>
          <h3 className="text-base font-black flex items-center gap-1.5 mt-0.5">
            <Crown size={16} className="text-amber-300" /> {PLAN_LIMITS[storeConfig.plan].name}
          </h3>
        </div>
        <button 
          onClick={onUpgrade}
          className="bg-white text-slate-900 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-lg hover:bg-slate-100 transition-colors"
        >
          Cambiar Plan
        </button>
      </div>

      {/* Datos Principales */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3.5 shadow-md`}>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">1. Información de la Tienda</p>
        
        <div>
          <label className="block text-[10px] font-semibold opacity-70 mb-1">Nombre Comercial</label>
          <input type="text" value={storeConfig.name} onChange={e => update({ name: e.target.value })}
            className={`w-full ${theme.selectBg} border rounded-2xl p-3 text-xs outline-none focus:border-emerald-500`} />
        </div>

        <div>
          <label className="block text-[10px] font-semibold opacity-70 mb-1">Eslogan Promocional</label>
          <input type="text" value={storeConfig.slogan} onChange={e => update({ slogan: e.target.value })}
            className={`w-full ${theme.selectBg} border rounded-2xl p-3 text-xs outline-none focus:border-emerald-500`} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold opacity-70 mb-1">WhatsApp Pedidos</label>
            <input type="text" value={storeConfig.whatsapp} onChange={e => update({ whatsapp: e.target.value })}
              className={`w-full ${theme.selectBg} border rounded-2xl p-3 text-xs outline-none focus:border-emerald-500`} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold opacity-70 mb-1">Moneda</label>
            <input type="text" value={storeConfig.currencySymbol} onChange={e => update({ currencySymbol: e.target.value })}
              className={`w-full ${theme.selectBg} border rounded-2xl p-3 text-xs outline-none focus:border-emerald-500`} />
          </div>
        </div>
      </div>

      {/* Métodos de Pago Perú */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3.5 shadow-md`}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} /> Métodos de Pago Perú
          </p>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Perú & Global
          </span>
        </div>

        {/* Yape / Plin */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Yape / Plin
            </label>
            <input 
              type="checkbox" 
              checked={storeConfig.payments?.acceptsYape !== false}
              onChange={e => update({ payments: { ...storeConfig.payments, acceptsYape: e.target.checked } })}
              className="rounded text-purple-600 focus:ring-0"
            />
          </div>
          <input 
            type="text" 
            placeholder="Ej. 999 123 456 (Titular: Juan Pérez)"
            value={storeConfig.payments?.yapePlinNumber || ''} 
            onChange={e => update({ payments: { ...storeConfig.payments, yapePlinNumber: e.target.value } })}
            className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none`} 
          />
        </div>

        {/* Tarjeta de Crédito/Débito (IziPay / Culqi / Niubiz) */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2">
              <CreditCard size={14} className="text-blue-400" /> Tarjetas / Link de Pago (IziPay, Niubiz, Culqi)
            </label>
            <input 
              type="checkbox" 
              checked={!!storeConfig.payments?.acceptsCard}
              onChange={e => update({ payments: { ...storeConfig.payments, acceptsCard: e.target.checked } })}
              className="rounded text-blue-600 focus:ring-0"
            />
          </div>
          <input 
            type="text" 
            placeholder="Enlace o Link de Cobro de IziPay, MercadoPago o Culqi..."
            value={storeConfig.payments?.cardPaymentLink || ''} 
            onChange={e => update({ payments: { ...storeConfig.payments, cardPaymentLink: e.target.value } })}
            className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none`} 
          />
        </div>

        {/* Transferencia Bancaria */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2">
              <Building2 size={14} className="text-emerald-400" /> Transferencia Bancaria (BCP, BBVA, Interbank)
            </label>
            <input 
              type="checkbox" 
              checked={storeConfig.payments?.acceptsBankTransfer !== false}
              onChange={e => update({ payments: { ...storeConfig.payments, acceptsBankTransfer: e.target.checked } })}
              className="rounded text-emerald-600 focus:ring-0"
            />
          </div>
          <textarea 
            rows={2}
            placeholder="Ej. BCP Soles: 193-12345678-0-12 (CCI: 0021930012345678012)"
            value={storeConfig.payments?.bankAccountDetails || ''} 
            onChange={e => update({ payments: { ...storeConfig.payments, bankAccountDetails: e.target.value } })}
            className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none resize-none`} 
          />
        </div>

        {/* Pago en Efectivo */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
          <label className="text-xs font-bold flex items-center gap-2">
            <Banknote size={14} className="text-amber-400" /> Pago en Efectivo (Contraentrega)
          </label>
          <input 
            type="checkbox" 
            checked={storeConfig.payments?.acceptsCash !== false}
            onChange={e => update({ payments: { ...storeConfig.payments, acceptsCash: e.target.checked } })}
            className="rounded text-amber-500 focus:ring-0"
          />
        </div>
      </div>

      {/* Tipografía */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-md`}>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Type size={14} /> Tipografía de la App
        </p>

        <select 
          value={storeConfig.font || 'Inter'}
          onChange={e => update({ font: e.target.value })}
          className={`w-full ${theme.selectBg} border rounded-2xl p-3 text-xs outline-none font-medium`}
        >
          {AVAILABLE_FONTS.map(f => (
            <option key={f.id} value={f.id} style={{ fontFamily: f.family }} className={theme.selectBg}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Banners */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-md`}>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={14} /> Banners Promocionales ({(storeConfig.banners || []).length}/{planLimits.maxBanners === Infinity ? '∞' : planLimits.maxBanners})
        </p>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="URL de imagen del banner..."
            value={bannerInput}
            onChange={e => setBannerInput(e.target.value)}
            className={`flex-1 ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none`}
          />
          <button 
            onClick={handleAddBanner}
            className={`${theme.primary} px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0`}
          >
            Agregar
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {(storeConfig.banners || []).map(banner => (
            <div key={banner.id} className="relative rounded-2xl overflow-hidden border border-white/10 group">
              <img src={banner.imageUrl} alt="" className="w-full h-24 object-cover" />
              <button 
                onClick={() => handleDeleteBanner(banner.id)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-xl shadow-md"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Temas */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-md`}>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={14}/> Tema Visual Exclusivo
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {ALL_THEMES.map(t => {
            const isActive = storeConfig.theme === t.id;
            return (
              <button key={t.id}
                onClick={() => update({ theme: t.id })}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                  isActive ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30' : 'border-white/10 hover:bg-white/5'
                }`}>
                <span className="truncate pr-1">{t.name}</span>
                <span className="w-4 h-4 rounded-full border shadow-sm shrink-0" style={{ backgroundColor: t.color }} />
              </button>
            );
          })}
        </div>
      </div>

      <CategoryManagerModal 
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        categories={categoriesList}
        onSaveCategories={cats => update({ categories: cats })}
      />
    </div>
  );
};

interface CartViewProps {
  cart: CartItem[];
  storeConfig: StoreConfig;
  theme: any;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onBackToCatalog: () => void;
  onOrderCreated: (order: Order) => void;
}

const CartView: React.FC<CartViewProps> = ({
  cart, storeConfig, theme, onUpdateQuantity, onRemoveItem, onClearCart, onBackToCatalog, onOrderCreated
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'card' | 'cash' | 'bank'>('yape');

  const subtotal = cart.reduce((sum, item) => {
    const price = (item.isOffer && item.offerPrice) ? item.offerPrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      customerName: customerName || 'Cliente WhatsApp',
      deliveryMethod,
      address,
      paymentMethod,
      items: cart.map(i => ({ id: i.id, name: i.name, price: (i.isOffer && i.offerPrice) ? i.offerPrice : i.price, quantity: i.quantity, image: i.image })),
      total: subtotal,
      status: 'pending'
    };

    onOrderCreated(newOrder);

    let payText = 'Yape / Plin';
    if (paymentMethod === 'card') payText = 'Tarjeta de Débito/Crédito';
    if (paymentMethod === 'cash') payText = 'Efectivo Contraentrega';
    if (paymentMethod === 'bank') payText = 'Transferencia Bancaria';

    let text = `*🛍️ NUEVO PEDIDO - ${storeConfig.name.toUpperCase()}*\n\n`;
    if (customerName) text += `👤 *Cliente:* ${customerName}\n`;
    text += `🚚 *Modalidad:* ${deliveryMethod === 'delivery' ? 'Envío a domicilio' : 'Recojo en tienda'}\n`;
    if (deliveryMethod === 'delivery' && address) text += `📍 *Dirección:* ${address}\n`;
    text += `💳 *Método de Pago:* ${payText}\n`;
    text += `\n*Detalle del pedido:*\n`;

    cart.forEach(item => {
      const price = (item.isOffer && item.offerPrice) ? item.offerPrice : item.price;
      text += `• ${item.quantity}x ${item.name} (${storeConfig.currencySymbol}${(price * item.quantity).toFixed(2)})\n`;
    });

    text += `\n💰 *TOTAL:* ${storeConfig.currencySymbol}${subtotal.toFixed(2)}`;

    const encodedText = encodeURIComponent(text);
    const cleanPhone = storeConfig.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 animate-in fade-in duration-200">
        <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 border border-slate-700/50">
          <ShoppingBag size={36} />
        </div>
        <h3 className="font-bold text-base">Tu carrito está vacío</h3>
        <p className={`text-xs max-w-xs mx-auto ${theme.subtext}`}>Explora el catálogo y agrega tus productos preferidos en 1 solo clic.</p>
        <button 
          onClick={onBackToCatalog}
          className={`${theme.primary} px-5 py-3 rounded-2xl text-xs font-bold shadow-lg inline-flex items-center gap-2`}
        >
          <ArrowLeft size={16} /> Ver Productos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShoppingBag size={20} className="text-emerald-400" /> Mi Carrito ({cart.reduce((s, i) => s + i.quantity, 0)})
        </h2>
        <button onClick={onClearCart} className="text-xs text-red-400 hover:underline">Vaciar</button>
      </div>

      {/* Ítems del carrito */}
      <div className="space-y-2">
        {cart.map(item => {
          const itemPrice = (item.isOffer && item.offerPrice) ? item.offerPrice : item.price;
          return (
            <div key={item.id} className={`${theme.card} p-3 rounded-2xl border flex items-center gap-3 shadow-sm`}>
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs truncate">{item.name}</h4>
                <p className={`text-xs font-bold ${theme.accent}`}>
                  {storeConfig.currencySymbol}{(itemPrice * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/10">
                <button 
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-6 h-6 rounded-lg bg-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-700"
                >-</button>
                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-6 h-6 rounded-lg bg-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-700"
                >+</button>
              </div>

              <button onClick={() => onRemoveItem(item.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Datos del Cliente */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-md`}>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">1. Detalles de la Entrega</p>
        
        <div>
          <label className="block text-[10px] font-semibold opacity-70 mb-1">Nombre Completo</label>
          <input 
            type="text" 
            placeholder="Ej. María García"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className={`w-full ${theme.selectBg} border rounded-2xl p-3 text-xs outline-none focus:border-emerald-500`}
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold opacity-70 mb-1">Tipo de Entrega</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDeliveryMethod('delivery')}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                deliveryMethod === 'delivery' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 opacity-70'
              }`}
            >
              <Truck size={15} /> A Domicilio
            </button>
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                deliveryMethod === 'pickup' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 opacity-70'
              }`}
            >
              <Store size={15} /> Recojo Tienda
            </button>
          </div>
        </div>

        {deliveryMethod === 'delivery' && (
          <div>
            <label className="block text-[10px] font-semibold opacity-70 mb-1">Dirección de Entrega</label>
            <input 
              type="text" 
              placeholder="Ej. Av. Primavera 123, Miraflores"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className={`w-full ${theme.selectBg} border rounded-2xl p-3 text-xs outline-none focus:border-emerald-500`}
            />
          </div>
        )}
      </div>

      {/* Selección Método de Pago */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-md`}>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">2. Selecciona Método de Pago</p>

        <div className="grid grid-cols-2 gap-2">
          {storeConfig.payments?.acceptsYape !== false && (
            <button
              onClick={() => setPaymentMethod('yape')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                paymentMethod === 'yape' ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-white/10 opacity-70'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Yape / Plin
            </button>
          )}

          {storeConfig.payments?.acceptsCard && (
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 opacity-70'
              }`}
            >
              <CreditCard size={15} className="text-blue-400" /> Tarjeta
            </button>
          )}

          {storeConfig.payments?.acceptsBankTransfer !== false && (
            <button
              onClick={() => setPaymentMethod('bank')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-white/10 opacity-70'
              }`}
            >
              <Building2 size={15} className="text-emerald-400" /> Banco / CCI
            </button>
          )}

          {storeConfig.payments?.acceptsCash !== false && (
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-white/10 opacity-70'
              }`}
            >
              <Banknote size={15} className="text-amber-400" /> Efectivo
            </button>
          )}
        </div>

        {/* Cajas instructivas por método */}
        {paymentMethod === 'yape' && storeConfig.payments?.yapePlinNumber && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3 text-xs space-y-1">
            <p className="font-bold text-purple-300">📱 Número Yape / Plin para pagar:</p>
            <p className="font-black text-base text-purple-200">{storeConfig.payments.yapePlinNumber}</p>
            <p className="text-[10px] text-purple-300/70">Envía tu comprobante por WhatsApp tras realizar el pedido.</p>
          </div>
        )}

        {paymentMethod === 'card' && storeConfig.payments?.cardPaymentLink && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-xs space-y-2">
            <p className="font-bold text-blue-300">💳 Enlace seguro para pagar con tarjeta:</p>
            <a 
              href={storeConfig.payments.cardPaymentLink} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-blue-700"
            >
              Abrir Link de Pago <ExternalLink size={13} />
            </a>
          </div>
        )}

        {paymentMethod === 'bank' && storeConfig.payments?.bankAccountDetails && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-xs space-y-1">
            <p className="font-bold text-emerald-300">🏦 Cuentas Bancarias:</p>
            <p className="text-xs text-emerald-200 whitespace-pre-line">{storeConfig.payments.bankAccountDetails}</p>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs space-y-1">
            <p className="font-bold text-amber-300">💵 Pago en Efectivo:</p>
            <p className="text-[11px] text-amber-200/80">Cancelas en efectivo al momento de recibir o recoger tu pedido.</p>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className={`${theme.card} p-4 rounded-3xl border space-y-3 shadow-xl`}>
        <div className="flex justify-between items-center text-sm font-bold">
          <span>Total Pedido:</span>
          <span className={`text-lg font-black ${theme.accent}`}>{storeConfig.currencySymbol}{subtotal.toFixed(2)}</span>
        </div>

        <button
          onClick={handleSendWhatsApp}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-98"
        >
          <MessageCircle size={18} /> ENVIAR PEDIDO POR WHATSAPP
        </button>
      </div>
    </div>
  );
};

interface CatalogViewProps {
  products: Product[];
  storeConfig: StoreConfig;
  theme: any;
  addToCart: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products, storeConfig, theme, addToCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todos');
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');

  const categoriesList = storeConfig.categories || DEFAULT_CATEGORIES;
  const categories = ['Todos', ...categoriesList.map(c => c.name)];

  const activeCategoryObj = categoriesList.find(c => c.name === selectedCategory);
  const subcategories = activeCategoryObj ? ['Todos', ...activeCategoryObj.subcategories] : [];

  let filtered = products.filter(p => {
    const matchesCat = selectedCategory === 'Todos' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSub = selectedSubcategory === 'Todos' || (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());
    const matchesOffer = !onlyOffers || p.isOffer;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSub && matchesOffer && matchesSearch;
  });

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => ((a.isOffer && a.offerPrice) ? a.offerPrice : a.price) - ((b.isOffer && b.offerPrice) ? b.offerPrice : b.price));
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => ((b.isOffer && b.offerPrice) ? b.offerPrice : b.price) - ((a.isOffer && a.offerPrice) ? a.offerPrice : a.price));
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner Slider Hero */}
      {(storeConfig.banners || []).length > 0 && (
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/10 group">
          <img 
            src={storeConfig.banners[0].imageUrl} 
            alt="Banner Promocional" 
            className="w-full h-36 sm:h-44 object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
            <div>
              <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">Destacado</span>
              <p className="text-white font-bold text-xs mt-1 drop-shadow-sm">¡Haz tu pedido en línea de forma rápida!</p>
            </div>
          </div>
        </div>
      )}

      {/* Buscador & Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-9 py-2.5 ${theme.selectBg} border rounded-2xl text-xs outline-none focus:border-emerald-500 transition-all`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
              <X size={14} />
            </button>
          )}
        </div>

        <button 
          onClick={() => setOnlyOffers(!onlyOffers)}
          className={`px-3 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            onlyOffers 
              ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-950/40' 
              : `${theme.card} border-white/10 opacity-80 hover:opacity-100`
          }`}
        >
          <Tag size={14} /> Ofertas
        </button>

        <button 
          onClick={() => setSortBy(prev => prev === 'default' ? 'price-low' : prev === 'price-low' ? 'price-high' : 'default')}
          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1 ${theme.card} border-white/10 opacity-80`}
          title="Ordenar por precio"
        >
          <ArrowUpDown size={15} />
        </button>
      </div>

      {/* Categorías Principales */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => { setSelectedCategory(cat); setSelectedSubcategory('Todos'); }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === cat ? theme.primary : theme.badge
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subcategorías */}
        {selectedCategory !== 'Todos' && subcategories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center">
            <span className="text-[10px] opacity-40 font-bold uppercase mr-1">Sub:</span>
            {subcategories.map(sub => (
              <button 
                key={sub} 
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap border transition-all ${
                  selectedSubcategory === sub 
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold' 
                    : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Productos */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-white/10 rounded-3xl p-6 opacity-60 space-y-2">
          <ShoppingBag size={36} className="mx-auto" />
          <p className="text-xs font-medium">No se encontraron productos en esta sección.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => (
            <div key={p.id} className={`${theme.card} border rounded-3xl overflow-hidden shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-all group`}>
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-36 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                {p.isOffer && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Tag size={10} /> OFERTA
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-slate-950/70 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                  {p.category}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-bold text-xs line-clamp-1">{p.name}</h3>
                  <p className={`text-[10px] ${theme.subtext} line-clamp-2 mt-0.5`}>{p.description}</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {p.isOffer && p.offerPrice ? (
                      <div>
                        <span className="text-red-400 font-black text-sm block leading-none">{storeConfig.currencySymbol}{p.offerPrice.toFixed(2)}</span>
                        <span className="text-[10px] opacity-40 line-through">{storeConfig.currencySymbol}{p.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className={`font-black text-sm ${theme.accent}`}>{storeConfig.currencySymbol}{p.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => addToCart(p)} 
                    className={`${theme.primary} text-[10px] font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1 active:scale-95 transition-transform shadow-md`}
                  >
                    <Plus size={13} /> Añadir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'products' | 'orders' | 'plans' | 'settings'>('catalog');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Check URL parameters to see if opened in Client Only mode
  const [isClientOnly, setIsClientOnly] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'client' || params.get('view') === 'catalog';
    }
    return false;
  });

  // Persistence in LocalStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vendely_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('vendely_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vendely_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('vendely_config');
    return saved ? JSON.parse(saved) : {
      storeId: 'store-123',
      name: 'Vendely Pro',
      rubro: 'Emprendimiento Digital',
      slogan: 'Vende directo por WhatsApp',
      whatsapp: '51999123456',
      logo: '',
      currencySymbol: 'S/',
      country: 'PE',
      theme: 'proDark',
      font: 'Inter',
      plan: 'monthly',
      banners: [
        { id: 'b1', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800' }
      ],
      categories: DEFAULT_CATEGORIES,
      payments: {
        yapePlinNumber: '999 123 456',
        bankAccountDetails: 'BCP 193-1234567-0-12',
        acceptsCash: true,
        acceptsCard: true,
        acceptsYape: true,
        acceptsBankTransfer: true
      }
    };
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('vendely_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vendely_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vendely_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vendely_config', JSON.stringify(storeConfig));
  }, [storeConfig]);

  const theme = THEMES[storeConfig.theme] || THEMES.proDark;
  const currentFontObj = AVAILABLE_FONTS.find(f => f.id === storeConfig.font) || AVAILABLE_FONTS[0];

  const handleAddProduct = (p: Omit<Product, 'id'>) => {
    setProducts(prev => [{ ...p, id: `prod-${Date.now()}` }, ...prev]);
  };

  const handleUpdateProduct = (p: Product) => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${theme.gradientBg} ${theme.text} transition-colors duration-300 flex justify-center`}
      style={{ fontFamily: currentFontObj.family }}
    >
      {/* Outer wrapper for mobile app preview frame option */}
      <div className={`w-full max-w-md min-h-screen flex flex-col relative shadow-2xl ${isMobileFrame ? 'my-4 rounded-[40px] border-[8px] border-slate-800 overflow-hidden max-h-[92vh]' : ''}`}>
        
        {/* Header (Clean & Modern - Red Box Element Removed) */}
        <header className={`sticky top-0 z-40 ${theme.nav} p-3.5 shadow-md flex items-center justify-between border-b`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
              {storeConfig.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-black text-sm leading-tight flex items-center gap-1.5">
                {storeConfig.name}
              </h1>
              <p className={`text-[10px] ${theme.subtext} truncate max-w-[170px]`}>{storeConfig.slogan}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin vs Client Mode Toggle */}
            <button 
              onClick={() => {
                const next = !isClientOnly;
                setIsClientOnly(next);
                if (next && (activeTab !== 'catalog' && activeTab !== 'cart')) {
                  setActiveTab('catalog');
                }
              }}
              className={`px-2.5 py-1.5 rounded-2xl text-[10px] font-bold flex items-center gap-1 transition-all border ${
                isClientOnly 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
              title="Cambiar Vista Admin / Cliente"
            >
              {isClientOnly ? <UserCheck size={13} /> : <LockKeyhole size={13} />}
              <span>{isClientOnly ? 'Cliente' : 'Admin'}</span>
            </button>

            {!isClientOnly && (
              <>
                <button 
                  onClick={() => setIsMobileFrame(!isMobileFrame)}
                  className="p-2 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-xs"
                  title="Alternar Marco Celular"
                >
                  <Smartphone size={16} />
                </button>

                <button 
                  onClick={() => setShowQR(true)}
                  className="p-2 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                  title="Código QR Tienda"
                >
                  <QrCode size={16} />
                </button>
              </>
            )}

            <button 
              onClick={() => setActiveTab('cart')}
              className="relative p-2 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Main Body Area */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          {activeTab === 'catalog' && (
            <CatalogView 
              products={products}
              storeConfig={storeConfig}
              theme={theme}
              addToCart={addToCart}
            />
          )}

          {activeTab === 'cart' && (
            <CartView 
              cart={cart}
              storeConfig={storeConfig}
              theme={theme}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={id => setCart(prev => prev.filter(c => c.id !== id))}
              onClearCart={() => setCart([])}
              onBackToCatalog={() => setActiveTab('catalog')}
              onOrderCreated={handleOrderCreated}
            />
          )}

          {!isClientOnly && activeTab === 'products' && (
            <AdminProducts 
              products={products}
              storeConfig={storeConfig}
              theme={theme}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateStoreConfig={setStoreConfig}
              onUpgrade={() => setActiveTab('plans')}
            />
          )}

          {!isClientOnly && activeTab === 'orders' && (
            <OrdersView 
              orders={orders}
              storeConfig={storeConfig}
              theme={theme}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {!isClientOnly && activeTab === 'plans' && (
            <PlansView 
              currentPlan={storeConfig.plan}
              productCount={products.length}
              bannerCount={(storeConfig.banners || []).length}
              theme={theme}
              onSelectPlan={(newPlan) => setStoreConfig(prev => ({ ...prev, plan: newPlan }))}
            />
          )}

          {!isClientOnly && activeTab === 'settings' && (
            <AdminSettings 
              storeConfig={storeConfig}
              theme={theme}
              onUpdate={setStoreConfig}
              onUpgrade={() => setActiveTab('plans')}
              onOpenQR={() => setShowQR(true)}
            />
          )}
        </main>

        {/* Bottom App Navigation Bar */}
        <nav className={`fixed bottom-0 left-0 right-0 ${isMobileFrame ? 'absolute' : ''} ${theme.nav} border-t p-2 z-40 backdrop-blur-lg`}>
          <div className={`max-w-md mx-auto grid ${isClientOnly ? 'grid-cols-2' : 'grid-cols-5'} gap-1 text-center`}>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`py-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'catalog' ? 'text-emerald-400 font-bold scale-105' : 'opacity-50 hover:opacity-100'
              }`}
            >
              <Store size={18} />
              <span className="text-[9px]">Catálogo</span>
            </button>

            <button 
              onClick={() => setActiveTab('cart')}
              className={`py-2 rounded-2xl flex flex-col items-center gap-1 transition-all relative ${
                activeTab === 'cart' ? 'text-emerald-400 font-bold scale-105' : 'opacity-50 hover:opacity-100'
              }`}
            >
              <ShoppingBag size={18} />
              <span className="text-[9px]">Carrito</span>
              {cart.length > 0 && (
                <span className="absolute top-1 right-3 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            {!isClientOnly && (
              <>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`py-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'products' ? 'text-emerald-400 font-bold scale-105' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Package size={18} />
                  <span className="text-[9px]">Productos</span>
                </button>

                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 rounded-2xl flex flex-col items-center gap-1 transition-all relative ${
                    activeTab === 'orders' ? 'text-emerald-400 font-bold scale-105' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Clock size={18} />
                  <span className="text-[9px]">Pedidos</span>
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="absolute top-1 right-3 bg-emerald-500 text-slate-950 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {orders.filter(o => o.status === 'pending').length}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'settings' ? 'text-emerald-400 font-bold scale-105' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Settings size={18} />
                  <span className="text-[9px]">Ajustes</span>
                </button>
              </>
            )}
          </div>
        </nav>

        {/* QR Modal Popup */}
        <QRModal 
          isOpen={showQR} 
          onClose={() => setShowQR(false)} 
          storeName={storeConfig.name} 
        />
      </div>
    </div>
  );
}
