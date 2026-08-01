import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Pencil, X, ImageIcon, Tag, Lock, Store as StoreIcon, Palette,
  Type, MessageCircle, ChevronRight, CheckCircle, ArrowLeft,
  Truck, ShoppingBag, Search, FolderPlus, Layers, Check, Zap, Crown,
  Send,
  Package, CheckCircle2, QrCode, Settings, Clock, Smartphone,
  ArrowUpDown, Copy, ExternalLink, Banknote, CreditCard, Building2,
  ShieldCheck, LogOut, Loader2, AlertCircle, Wallet, Eye, EyeOff,
  LayoutGrid, Rows3, Columns3, Image as ImageIconBanner, Droplet, AlignLeft,
  KeyRound, Grid2x2, Grid3x3, List, GalleryVerticalEnd, Square, BookOpen,
  Phone, Upload, MapPin, User, Receipt, Sparkles, ZoomIn, FileText, TrendingUp, Calendar, DollarSign, ShoppingCart,
  CloudCog
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { Store, Product, Category, Banner, Order, OrderItem, CartItem, PlanType } from '@/lib/types';
import * as api from '@/lib/store-api';
import { uploadPaymentProof, updateOrderPayment } from '@/lib/store-api';
import AuthScreen from '@/components/AuthScreen';

// ============ CONSTANTES ============

export const AVAILABLE_FONTS = [
  { id: 'Inter', name: 'Inter (Moderna y limpia)', family: "'Inter', sans-serif" },
  { id: 'Poppins', name: 'Poppins (Fresca y geométrica)', family: "'Poppins', sans-serif" },
  { id: 'Montserrat', name: 'Montserrat (Profesional)', family: "'Montserrat', sans-serif" },
  { id: 'Raleway', name: 'Raleway (Sofisticada)', family: "'Raleway', sans-serif" },
  { id: 'Nunito', name: 'Nunito (Amigable y redondeada)', family: "'Nunito', sans-serif" },
  { id: 'DM Sans', name: 'DM Sans (Minimalista)', family: "'DM Sans', sans-serif" },
  { id: 'Manrope', name: 'Manrope (Contemporánea)', family: "'Manrope', sans-serif" },
  { id: 'Space Grotesk', name: 'Space Grotesk (Tech)', family: "'Space Grotesk', sans-serif" },
  { id: 'Karla', name: 'Karla (Clara y elegante)', family: "'Karla', sans-serif" },
  { id: 'Work Sans', name: 'Work Sans (Versátil)', family: "'Work Sans', sans-serif" },
  { id: 'Playfair Display', name: 'Playfair Display (Lujo serif)', family: "'Playfair Display', serif" },
  { id: 'Lora', name: 'Lora (Serif elegante)', family: "'Lora', serif" },
  { id: 'Cormorant Garamond', name: 'Cormorant (Serif refinada)', family: "'Cormorant Garamond', serif" },
  { id: 'Bebas Neue', name: 'Bebas Neue (Impacto)', family: "'Bebas Neue', sans-serif" },
];

export const CATALOG_LAYOUTS = [
  { id: 'grid2', name: 'Cuadrícula 2', icon: Grid2x2, desc: '2 columnas clásicas' },
  { id: 'grid3', name: 'Cuadrícula 3', icon: Grid3x3, desc: '3 columnas compactas' },
  { id: 'lista', name: 'Lista', icon: List, desc: 'Filas horizontales' },
  { id: 'magazine', name: 'Revista', icon: BookOpen, desc: 'Destacado grande' },
  { id: 'compact', name: 'Compacto', icon: Square, desc: 'Tarjetas pequeñas' },
  { id: 'gallery', name: 'Galería', icon: GalleryVerticalEnd, desc: 'Imagen completa' },
];

export const PLAN_LIMITS: Record<PlanType, {
  name: string; priceText: string; badge: string;
  maxProducts: number; maxBanners: number; maxCatalogs: number;
  features: string[];
}> = {
  free: {
    name: 'Starter', priceText: '$0/mes', badge: 'Gratis',
    maxProducts: 8, maxBanners: 1, maxCatalogs: 1,
    features: [
      'Hasta 8 productos activos', 'Categorías y subcategorías ilimitadas',
      '1 banner destacado', 'Pedidos directos por WhatsApp',
      'Código QR exclusivo para clientes', 'Múltiples métodos de pago',
      'Ofertas y descuentos', '6 modelos de catálogo', '1 catálogo'
    ]
  },
  monthly: {
    name: 'Pro Comerciante', priceText: 'US$29/mes', badge: 'Popular',
    maxProducts: Infinity, maxBanners: 5, maxCatalogs: 3,
    features: [
      'Productos ILIMITADOS', 'Hasta 5 banners promocionales',
      'Hasta 3 catálogos', 'Tipografía avanzada con Google Fonts',
      'Billeteras digitales, tarjetas y enlaces de pago',
      'Panel de historial de pedidos', 'Soporte prioritario por WhatsApp',
      'Colores personalizados de la tienda'
    ]
  },
  yearly: {
    name: 'Enterprise', priceText: 'US$249/año', badge: 'Ahorra 35%',
    maxProducts: Infinity, maxBanners: Infinity, maxCatalogs: Infinity,
    features: [
      'Todo lo de Pro Comerciante', 'Banners y colecciones ilimitadas',
      'Catálogos ILIMITADOS', 'Modo tienda exclusivo solo para clientes',
      'Dominio propio y enlace corto', 'Cero comisión por venta',
      'Consultoría de catálogo y pasarelas'
    ]
  }
};

// Rubros removed — now a free-text input field

const COUNTRIES = [
  { code: 'PE', name: 'Perú', currency: 'S/' },
  { code: 'PE_USD', name: 'Perú (USD)', currency: 'US$' },
  { code: 'MX', name: 'México', currency: '$' },
  { code: 'MX_USD', name: 'México (USD)', currency: 'US$' },
  { code: 'CO', name: 'Colombia', currency: '$' },
  { code: 'CO_USD', name: 'Colombia (USD)', currency: 'US$' },
  { code: 'AR', name: 'Argentina', currency: '$' },
  { code: 'AR_USD', name: 'Argentina (USD)', currency: 'US$' },
  { code: 'CL', name: 'Chile', currency: '$' },
  { code: 'CL_USD', name: 'Chile (USD)', currency: 'US$' },
  { code: 'EC', name: 'Ecuador', currency: '$' },
  { code: 'BO', name: 'Bolivia', currency: 'Bs' },
  { code: 'VE', name: 'Venezuela', currency: 'Bs' },
  { code: 'UY', name: 'Uruguay', currency: '$U' },
  { code: 'PY', name: 'Paraguay', currency: '₲' },
  { code: 'DO', name: 'Rep. Dominicana', currency: 'RD$' },
  { code: 'US', name: 'Estados Unidos', currency: 'US$' },
  { code: 'ES', name: 'España', currency: '€' },
  { code: 'GLOBAL_USD', name: 'Otros (USD)', currency: 'US$' },
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
  { id: 'corporateLight', name: 'Corporativo Pro', color: '#075ea1', bg: '#f8f9ff', isDark: false },
  { id: 'proDark', name: 'Azul Marca', color: '#1E6FFF', bg: '#0A1628', isDark: true },
  { id: 'elegante', name: 'Púrpura Noir', color: '#8B5CF6', bg: '#0B0914', isDark: true },
  { id: 'goldLuxury', name: 'Lujo Dorado', color: '#F59E0B', bg: '#0F1115', isDark: true },
  { id: 'roseGold', name: 'Rosa Oro', color: '#F43F5E', bg: '#FAF5F7', isDark: false },
  { id: 'artesanal', name: 'Cálido Artesanal', color: '#D96B43', bg: '#FAF6F0', isDark: false },
  { id: 'moderno', name: 'Limpio Moderno', color: '#4F46E5', bg: '#F8FAFC', isDark: false },
  { id: 'cyberNeon', name: 'Cyber Neón', color: '#06B6D4', bg: '#050B14', isDark: true },
  { id: 'nordicMint', name: 'Menta Nórdica', color: '#059669', bg: '#F2F8F6', isDark: false },
];

interface ThemeDef {
  bg: string; card: string; primary: string; accent: string; accentBg: string;
  badge: string; text: string; subtext: string; nav: string; selectBg: string;
  gradientBg: string; cardRadius: string; cardHover: string; borderSubtle: string;
  sectionBg: string; activeText: string; overlayBg: string; modalBg: string;
  modalInputBg: string; isDark: boolean; accentSolid: string;
}

const THEMES: Record<string, ThemeDef> = {
  corporateLight: {
    bg: 'bg-[#f8f9ff]', card: 'bg-white/80 border-[#c1c7d2]/30 text-[#0b1c30] backdrop-blur-xl shadow-sm',
    primary: 'bg-[#075ea1] hover:bg-[#064f87] text-white shadow-md shadow-[#075ea1]/20',
    accent: 'text-[#075ea1]', accentBg: 'bg-[#d2e4ff] text-[#075ea1] border border-[#a1c9ff]/40',
    accentSolid: 'bg-[#075ea1] text-white',
    badge: 'bg-[#eff4ff] text-[#414750] border border-[#c1c7d2]/30', text: 'text-[#0b1c30]',
    subtext: 'text-[#414750]', nav: 'bg-[#f8f9ff]/90 border-[#c1c7d2]/30 backdrop-blur-xl',
    selectBg: 'bg-white text-[#0b1c30] border-[#c1c7d2]/30', gradientBg: 'from-[#f8f9ff] via-[#eff4ff] to-[#dce9ff]',
    cardRadius: 'rounded-xl', cardHover: 'hover:border-[#075ea1]/30 hover:shadow-md hover:shadow-[#075ea1]/10',
    borderSubtle: 'border-[#c1c7d2]/30', sectionBg: 'bg-[#eff4ff]', activeText: 'text-[#075ea1]',
    overlayBg: 'from-[#f8f9ff]/85', modalBg: 'bg-white border-[#c1c7d2]/30 text-[#0b1c30]',
    modalInputBg: 'bg-[#eff4ff] border-[#c1c7d2]/30', isDark: false
  },
  proDark: {
    bg: 'bg-[#0A1628]', card: 'bg-[#0F1D33]/90 border-[#1E2D45] text-slate-100 backdrop-blur-md',
    primary: 'bg-gradient-to-r from-[#1E6FFF] to-[#0052CC] text-white shadow-lg shadow-[#1E6FFF]/30 hover:from-[#2E7FFF] hover:to-[#1060DD]',
    accent: 'text-[#3B82F6]', accentBg: 'bg-[#1E6FFF]/20 text-[#5B9BFF] border border-[#1E6FFF]/30',
    accentSolid: 'bg-[#1E6FFF] text-white',
    badge: 'bg-[#13243F] text-slate-300 border border-[#1E2D45]', text: 'text-slate-100',
    subtext: 'text-slate-400', nav: 'bg-[#0A1628]/95 border-[#1E2D45] backdrop-blur-lg',
    selectBg: 'bg-[#0F1D33] text-slate-100 border-[#1E2D45]', gradientBg: 'from-[#0A1628] via-[#0F1D33] to-[#0A1628]/60',
    cardRadius: 'rounded-2xl', cardHover: 'hover:border-[#1E6FFF]/40 hover:shadow-lg hover:shadow-[#1E6FFF]/10',
    borderSubtle: 'border-[#1E2D45]', sectionBg: 'bg-[#0A1628]/60', activeText: 'text-[#3B82F6]',
    overlayBg: 'from-[#0A1628]/85', modalBg: 'bg-[#0F1D33] border-[#1E2D45] text-slate-100',
    modalInputBg: 'bg-[#0A1628] border-[#1E2D45]', isDark: true
  },
  elegante: {
    bg: 'bg-[#0B0914]', card: 'bg-[#151226]/90 border-[#2A2447] text-purple-50 backdrop-blur-md shadow-lg',
    primary: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50 hover:opacity-95',
    accent: 'text-violet-400', accentBg: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    accentSolid: 'bg-violet-500 text-white',
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
    accentSolid: 'bg-amber-500 text-slate-950',
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
    accentSolid: 'bg-rose-500 text-white',
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
    accentSolid: 'bg-[#D96B43] text-white',
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
    accentSolid: 'bg-indigo-600 text-white',
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
    primary: 'bg-gradient-to-r from-[#1E6FFF] via-[#0052CC] to-[#1E6FFF] text-white font-black shadow-lg shadow-[#1E6FFF]/40 hover:opacity-90',
    accent: 'text-cyan-400', accentBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    accentSolid: 'bg-cyan-400 text-slate-950',
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
    primary: 'bg-[#1E6FFF] hover:bg-[#1060DD] text-white shadow-md shadow-[#1E6FFF]/30',
    accent: 'text-[#1E6FFF]', accentBg: 'bg-[#1E6FFF]/10 text-[#0052CC] border border-[#1E6FFF]/20',
    accentSolid: 'bg-[#1E6FFF] text-white',
    badge: 'bg-[#E4F2EE] text-[#345B51] border border-[#D2E7E2]', text: 'text-[#1E3832]', subtext: 'text-[#577A72]',
    nav: 'bg-white/95 border-[#D2E7E2]', selectBg: 'bg-white text-[#1E3832] border-[#D2E7E2]',
    gradientBg: 'from-[#F2F8F6] via-[#E7F3F0] to-[#DCECE7]',
    cardRadius: 'rounded-3xl', cardHover: 'hover:border-[#1E6FFF]/40 hover:shadow-lg hover:shadow-[#1E6FFF]/10',
    borderSubtle: 'border-[#D2E7E2]', sectionBg: 'bg-[#F2F8F6]/60', activeText: 'text-[#1E6FFF]',
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

// Props de estilo para selects que respetan el tema
function selectStyle(theme: ThemeDef, customTextColor?: string): React.CSSProperties {
  return { colorScheme: theme.isDark ? 'dark' : 'light', color: customTextColor || undefined };
}

// Lee un archivo de imagen y devuelve base64
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============ LIGHTBOX (visor de imagen) ============

interface LightboxProps { src: string; alt: string; onClose: () => void; }

const Lightbox: React.FC<LightboxProps> = ({ src, alt, onClose }) => (
  <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
    <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors" onClick={onClose}><X size={24} /></button>
    <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()} />
  </div>
);

// ============ MODAL CATEGORÍAS ============

interface CategoryManagerModalProps {
  isOpen: boolean; onClose: () => void;
  categories: Category[]; storeId: string; theme: ThemeDef;
  onSaved: () => void; customTextColor?: string;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, storeId, theme, onSaved, customTextColor }) => {
  const [cats, setCats] = useState(categories);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(categories[0]?.id || null);
  const [newSubName, setNewSubName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setCats(categories); setSelectedCatId(categories[0]?.id || null); }, [categories, isOpen]);
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
    } catch { alert('Error al guardar las categorías'); }
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
              <h3 className="font-bold text-base">Categorías y Secciones</h3>
              <p className={`text-xs ${theme.subtext}`}>Organiza tu catálogo para tus clientes</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 ${theme.subtext} hover:opacity-70 ${theme.cardRadius}`}><X size={20} /></button>
        </div>
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider ${theme.subtext}`}>1. Categorías principales</label>
          <div className="flex gap-2">
            <input type="text" placeholder="Nueva categoría..." value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCat())}
              className={`flex-1 ${theme.modalInputBg} ${theme.cardRadius} px-3.5 py-2.5 text-xs outline-none focus:border-[#1E6FFF]`} />
            <button onClick={handleAddCat} className={`${theme.primary} px-4 py-2.5 ${theme.cardRadius} text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95`}>
              <Plus size={15} /> Agregar
            </button>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {cats.length === 0 && <p className={`text-xs ${theme.subtext} italic text-center py-3`}>Aún no hay categorías. Crea la primera arriba.</p>}
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
              2. Subcategorías de <span className={theme.accent}>&ldquo;{activeCat.name}&rdquo;</span>
            </label>
            <div className="flex gap-2">
              <input type="text" placeholder={`Subcategoría para ${activeCat.name}...`} value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSub())}
                className={`flex-1 ${theme.modalInputBg} ${theme.cardRadius} px-3 py-2 text-xs outline-none focus:border-[#1E6FFF]`} />
              <button onClick={handleAddSub} className={`${theme.badge} px-3 py-2 ${theme.cardRadius} text-xs font-bold flex items-center gap-1`}>
                <Plus size={14} /> Agregar
              </button>
            </div>
            {activeCat.subcategories.length === 0 ? (
              <p className={`text-xs ${theme.subtext} italic text-center py-4 border border-dashed ${theme.borderSubtle} ${theme.cardRadius}`}>Aún no hay subcategorías.</p>
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
        ) : <p className={`text-xs ${theme.subtext} text-center py-4`}>Selecciona o crea una categoría arriba.</p>}
        <button onClick={handleSaveAll} disabled={saving}
          className={`w-full ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50`}>
          {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Guardar y cerrar'}
        </button>
      </div>
    </div>
  );
};

// ============ MODAL QR ============

interface QRModalProps { isOpen: boolean; onClose: () => void; storeId: string; storeName: string; theme: ThemeDef; }

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, storeId, storeName, theme }) => {
  if (!isOpen) return null;
  const origin = window.location.origin + window.location.pathname;
  const clientUrl = `${origin}?store=${storeId}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`${theme.modalBg} ${theme.cardRadius} p-6 w-full max-w-sm text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95`}>
        <div className={`flex justify-between items-center border-b ${theme.borderSubtle} pb-3`}>
          <h3 className="font-bold text-sm flex items-center gap-2"><QrCode size={18} className={theme.accent} /> Código QR para clientes</h3>
          <button onClick={onClose} className={`p-1 ${theme.subtext}`}><X size={18} /></button>
        </div>
        <div className="bg-gradient-to-br from-[#1E6FFF] via-[#0052CC] to-[#0A1628] p-6 rounded-3xl text-white space-y-3 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 backdrop-blur-md text-blue-100 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-white/20 mb-2"><ShieldCheck size={12} /> Solo catálogo y carrito</span>
            <p className="font-black text-lg text-white drop-shadow-sm">{storeName}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl relative z-10 border border-[#1E6FFF]/20">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(clientUrl)}`} alt="QR" className="w-44 h-44 mx-auto rounded-lg" />
          </div>
          <p className="text-[10px] text-blue-100 font-medium relative z-10">Tus clientes escanean esto para ver tus productos y hacer pedidos.</p>
        </div>
        <div className="space-y-2">
          <button onClick={() => { navigator.clipboard?.writeText(clientUrl); alert('¡Enlace copiado!'); }}
            className={`w-full ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2`}>
            <Copy size={14} /> Copiar enlace de cliente
          </button>
          <a href={clientUrl} target="_blank" rel="noopener noreferrer"
            className={`w-full ${theme.badge} py-2.5 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-1.5 block text-center`}>
            <ExternalLink size={14} /> Probar vista de cliente
          </a>
        </div>
      </div>
    </div>
  );
};

// ============ VISTA PLANES ============

interface PlansViewProps {
  currentPlan: PlanType; productCount: number; bannerCount: number; theme: ThemeDef;
  onSelectPlan: (plan: PlanType) => void;
}

const PlansView: React.FC<PlansViewProps> = ({ currentPlan, productCount, bannerCount, theme, onSelectPlan }) => {
  const planOrder: PlanType[] = ['free', 'monthly', 'yearly'];
  const planBadges: Record<PlanType, string> = { free: 'Básico', monthly: 'Popular', yearly: 'Corporativo' };
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Elige tu Plan Pro</h2>
        <p className={`text-sm ${theme.subtext} max-w-md mx-auto`}>Escala tu negocio con herramientas diseñadas para la eficiencia corporativa y el control total de tus ventas.</p>
      </div>

      {/* Current plan usage bar */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-2 shadow-md`}>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold flex items-center gap-1.5"><Zap size={15} className={theme.accent} /> Plan actual: <strong className={theme.accent}>{PLAN_LIMITS[currentPlan].name}</strong></span>
          <span className={`font-black uppercase px-2.5 py-1 rounded-full ${theme.accentBg} text-[10px]`}>{PLAN_LIMITS[currentPlan].name}</span>
        </div>
        <div>
          <div className={`flex justify-between text-[11px] mb-1 font-semibold ${theme.subtext}`}>
            <span>Productos: {productCount} / {PLAN_LIMITS[currentPlan].maxProducts === Infinity ? '\u221e' : PLAN_LIMITS[currentPlan].maxProducts}</span>
            <span>Banners: {bannerCount} / {PLAN_LIMITS[currentPlan].maxBanners === Infinity ? '\u221e' : PLAN_LIMITS[currentPlan].maxBanners}</span>
          </div>
          <div className={`w-full ${theme.sectionBg} h-2 rounded-full overflow-hidden`}>
            <div className={`h-full transition-all ${productCount >= PLAN_LIMITS[currentPlan].maxProducts ? 'bg-amber-500' : theme.accentSolid}`}
              style={{ width: PLAN_LIMITS[currentPlan].maxProducts === Infinity ? '100%' : `${Math.min(100, (productCount / PLAN_LIMITS[currentPlan].maxProducts) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* 3-column pricing grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {planOrder.map((planKey, idx) => {
          const plan = PLAN_LIMITS[planKey];
          const isCurrent = currentPlan === planKey;
          const isFeatured = planKey === 'monthly';
          return (
            <div key={planKey} className={`relative ${theme.card} ${theme.cardRadius} p-6 flex flex-col h-full border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isFeatured ? 'border-[#075ea1]/40 ring-4 ring-[#075ea1]/5 md:scale-105 z-10' : ''}`}
              style={{ animationDelay: `${idx * 100}ms` }}>
              {isFeatured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#075ea1] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">RECOMENDADO</span>
              )}
              <div className="mb-6">
                <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block mb-3 ${isFeatured ? 'bg-[#3377bc] text-white' : theme.accentBg}`}>{planBadges[planKey]}</span>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-bold">{plan.priceText.split('/')[0]}</span>
                  {plan.priceText.includes('/') && <span className={`text-sm ${theme.subtext}`}>/{plan.priceText.split('/')[1]}</span>}
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={18} className={`${theme.accent} shrink-0 mt-0.5`} />
                    <span className={isFeatured ? 'font-medium' : theme.subtext}>{feat}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className={`w-full py-3.5 ${theme.cardRadius} text-sm font-bold text-center ${theme.badge}`}>Plan actual</div>
              ) : (
                <button onClick={() => onSelectPlan(planKey)}
                  className={`w-full py-3.5 ${theme.cardRadius} text-sm font-bold transition-all active:scale-95 ${isFeatured ? `${theme.primary}` : `border-2 border-[#075ea1] text-[#075ea1] hover:bg-[#075ea1]/5`}`}>
                  Seleccionar Plan
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust section */}
      <div className={`mt-8 py-8 px-6 ${theme.cardRadius} ${theme.sectionBg} border ${theme.borderSubtle} text-center`}>
        <h3 className="text-lg font-bold mb-6">Con la confianza de miles de negocios</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div className="flex items-center gap-2"><ShieldCheck size={20} className={theme.accent} /><span className="font-bold text-sm">PCI Compliance</span></div>
          <div className="flex items-center gap-2"><CloudCog size={20} className={theme.accent} /><span className="font-bold text-sm">Google Cloud Partner</span></div>
          <div className="flex items-center gap-2"><Lock size={20} className={theme.accent} /><span className="font-bold text-sm">AES-256 Encrypted</span></div>
        </div>
      </div>
    </div>
  );
};

// ============ ADMIN PRODUCTOS ============

interface AdminProductsProps {
  products: Product[]; store: Store; theme: ThemeDef; categories: Category[];
  onRefresh: () => void; onUpgrade: () => void; customTextColor?: string;
}

type FormState = {
  name: string; price: string; category: string; subcategory: string;
  description: string; image: string; isOffer: boolean; offerPrice: string;
  stock: string; isFeatured: boolean;
};

const EMPTY_FORM: FormState = { name: '', price: '', category: '', subcategory: '', description: '', image: '', isOffer: false, offerPrice: '', stock: '10', isFeatured: false };

const AdminProducts: React.FC<AdminProductsProps> = ({ products, store, theme, categories, onRefresh, onUpgrade, customTextColor }) => {
  const [showModal, setShowModal] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const planLimits = PLAN_LIMITS[store.plan] || PLAN_LIMITS.free;
  const canAddMore = products.length < planLimits.maxProducts;
  const catNames = categories.length > 0 ? categories.map(c => c.name) : ['General'];
  const currentCatObj = categories.find(c => c.name === form.category);
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
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const base64 = await readFileAsBase64(file); setForm(prev => ({ ...prev, image: base64 })); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const data = {
        name: form.name, price: parseFloat(form.price), category: form.category || catNames[0] || 'General',
        subcategory: form.subcategory || null, description: form.description, image: form.image || PRESET_IMAGES[0],
        is_offer: form.isOffer,
        offer_price: (form.isOffer && form.offerPrice) ? parseFloat(form.offerPrice) : null,
        stock: parseInt(form.stock) || 10, is_featured: form.isFeatured
      };
      if (editing) await api.updateProduct(editing.id, data);
      else await api.createProduct(store.id, data);
      onRefresh(); setShowModal(false);
    } catch { alert('Error al guardar el producto'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try { await api.deleteProduct(id); onRefresh(); } catch { alert('Error al eliminar'); }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className={`flex items-center justify-between border-b ${theme.borderSubtle} pb-3`}>
        <div>
          <h2 className="text-lg font-bold">Productos</h2>
          <p className={`text-xs ${theme.subtext}`}>Plan <strong className={`uppercase ${theme.accent}`}>{store.plan}</strong> &mdash; {products.length}{planLimits.maxProducts !== Infinity ? `/${planLimits.maxProducts}` : ''} registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCatManager(true)} className={`${theme.badge} px-3 py-2 ${theme.cardRadius} flex items-center gap-1.5 text-xs font-bold transition-all`}><FolderPlus size={14} /> Secciones</button>
          <button onClick={openAdd} className={`${theme.primary} px-3.5 py-2 ${theme.cardRadius} flex items-center gap-1.5 text-xs font-bold`}><Plus size={15} /> Nuevo</button>
        </div>
      </div>
      {!canAddMore && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-amber-200 text-xs">
          <Lock size={16} className="text-amber-400 shrink-0" />
          <p>Alcanzaste el límite del plan Starter. <button onClick={onUpgrade} className="font-bold underline text-amber-300">Mejora tu plan</button> para productos ilimitados.</p>
        </div>
      )}
      <div className="space-y-2.5">
        {products.length === 0 && (
          <div className={`text-center py-14 opacity-50 text-xs space-y-2 ${theme.subtext}`}><Package size={40} className="mx-auto" /><p>Aún no hay productos. ¡Agrega el primero!</p></div>
        )}
        {products.map(p => (
          <div key={p.id} className={`${theme.card} p-3 ${theme.cardRadius} border flex items-center gap-3 shadow-sm ${theme.cardHover} transition-all`}>
            <img src={p.image} alt={p.name} className={`w-14 h-14 ${theme.cardRadius} object-cover shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-xs truncate">{p.name}</h4>
                {p.is_offer && <span className="bg-red-500/20 text-red-400 text-[8px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">OFERTA</span>}
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
              <h3 className="font-bold text-sm">{editing ? 'Editar producto' : 'Crear producto'}</h3>
              <button onClick={() => setShowModal(false)} className={theme.subtext}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Nombre *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre del producto"
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#1E6FFF]`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Precio *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="29.90"
                    className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#1E6FFF]`} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Precio de oferta</label>
                  <input type="number" step="0.01" value={form.offerPrice} onChange={e => setForm({...form, offerPrice: e.target.value, isOffer: e.target.value !== ''})} placeholder="19.90"
                    className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-red-500`} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked={form.isOffer} onChange={e => setForm({...form, isOffer: e.target.checked})} className="rounded text-[#1E6FFF] focus:ring-0" />
                <span className="text-xs font-semibold">Marcar como OFERTA</span>
              </label>
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Categoría</label>
                <select value={form.category} onChange={e => { const nc = e.target.value; const fs = categories.find(c => c.name === nc)?.subcategories[0] || ''; setForm({...form, category: nc, subcategory: fs}); }}
                  style={selectStyle(theme, customTextColor)}
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#1E6FFF] font-medium`}>
                  {catNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Subcategoría</label>
                <select value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})}
                  style={selectStyle(theme, customTextColor)}
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#1E6FFF]`}>
                  <option value="">Sin subcategoría</option>
                  {availableSubs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Descripción</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detalles..."
                  className={`w-full ${theme.modalInputBg} ${theme.cardRadius} p-3 text-xs resize-none outline-none focus:border-[#1E6FFF]`} />
              </div>
              <div>
                <label className={`block text-[10px] font-semibold ${theme.subtext} uppercase mb-1`}>Imagen</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((imgUrl, i) => (
                    <img key={i} src={imgUrl} alt="" onClick={() => setForm({...form, image: imgUrl})}
                      className={`h-12 w-full object-cover ${theme.cardRadius} cursor-pointer border-2 transition-all ${form.image === imgUrl ? `${theme.accent.replace('text-', 'border-')} scale-105 shadow-md` : `${theme.borderSubtle} opacity-60 hover:opacity-100`}`} />
                  ))}
                </div>
                <label className={`flex items-center justify-center gap-2 ${theme.modalInputBg} border border-dashed ${theme.cardRadius} p-2.5 cursor-pointer hover:opacity-70 transition-opacity`}>
                  <ImageIcon size={16} className={theme.subtext} /><span className={`text-xs ${theme.subtext} font-medium`}>O sube una imagen</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 ${theme.badge} py-3 ${theme.cardRadius} text-xs font-bold`}>Cancelar</button>
                <button type="submit" disabled={saving} className={`flex-1 ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50`}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}{editing ? 'Guardar' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <CategoryManagerModal isOpen={showCatManager} onClose={() => setShowCatManager(false)} categories={categories} storeId={store.id} theme={theme} onSaved={onRefresh} customTextColor={customTextColor} />
    </div>
  );
};

// ============ VISTA PEDIDOS ============

interface OrdersViewProps { orders: Order[]; store: Store; theme: ThemeDef; onRefresh: () => void; customTextColor?: string; }

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pendiente', preparing: 'Preparando', shipped: 'Enviado', delivered: 'Entregado',
};
const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  preparing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-[#1E6FFF]/20 text-[#5B9BFF] border-[#1E6FFF]/30',
};

const generateOrderPDF = (order: Order, store: Store) => {
  const win = window.open('', '_blank');
  if (!win) return;
  const itemsHtml = order.items.map((item: OrderItem) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.quantity}x ${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${store.currency_symbol}${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');
  win.document.write(`<!DOCTYPE html><html><head><title>Pedido #${order.id.slice(-5)}</title>
    <style>body{font-family:Inter,sans-serif;max-width:500px;margin:40px auto;padding:20px;color:#1a1a1a}
    h1{font-size:20px;margin:0}.sub{color:#666;font-size:12px;margin:4px 0 20px}
    .info{background:#f8f9fa;border-radius:12px;padding:16px;margin:16px 0;font-size:13px}
    .info p{margin:4px 0}table{width:100%;border-collapse:collapse;font-size:13px}
    .total{font-size:18px;font-weight:bold;margin-top:16px;padding-top:12px;border-top:2px solid #1E6FFF;display:flex;justify-content:space-between}
    .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold;text-transform:uppercase}
    .logo{font-size:24px;font-weight:900;color:#1E6FFF}</style></head>
    <body>
    <div class="logo">${store.name}</div>
    <h1>Pedido #${order.id.slice(-5)}</h1>
    <div class="sub">${new Date(order.created_at).toLocaleString('es-ES')}</div>
    <div class="info">
      <p><strong>Cliente:</strong> ${order.customer_name}</p>
      ${order.phone ? `<p><strong>Teléfono:</strong> ${order.phone}</p>` : ''}
      <p><strong>Entrega:</strong> ${order.delivery_method === 'delivery' ? 'Delivery' : 'Recojo'}</p>
      ${order.address ? `<p><strong>Dirección:</strong> ${order.address}</p>` : ''}
      <p><strong>Pago:</strong> ${order.payment_method.toUpperCase()}</p>
      <p><strong>Estado:</strong> <span class="badge" style="background:#f0fdf4;color:#1E6FFF">${STATUS_LABELS[order.status]}</span></p>
    </div>
    <table><thead><tr><th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1E6FFF">Producto</th><th style="text-align:right;padding:8px 12px;border-bottom:2px solid #1E6FFF">Subtotal</th></tr></thead>
    <tbody>${itemsHtml}</tbody></table>
    <div class="total"><span>Total:</span><span>${store.currency_symbol}${Number(order.total).toFixed(2)}</span></div>
    ${order.payment_proof ? `<div style="margin-top:20px"><h3 style="font-size:14px">Comprobante de pago:</h3><img src="${order.payment_proof}" style="max-width:100%;border-radius:12px;margin-top:8px" /></div>` : ''}
    <script>window.onload=function(){window.print()}</script>
    </body></html>`);
  win.document.close();
};

const OrdersView: React.FC<OrdersViewProps> = ({ orders, store, theme, onRefresh, customTextColor }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingPayment, setEditingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<Order['payment_method']>('yape');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

  const handleStatus = async (orderId: string, status: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, status);
      onRefresh();
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
    } catch { alert('Error al actualizar el estado.'); }
  };

  const handlePaymentUpdate = async (orderId: string) => {
    try {
      await updateOrderPayment(orderId, newPayment);
      onRefresh();
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, payment_method: newPayment });
      setEditingPayment(false);
    } catch { alert('Error al actualizar el método de pago.'); }
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  if (selectedOrder) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <button onClick={() => setSelectedOrder(null)} className={`flex items-center gap-2 text-xs font-bold ${theme.subtext} hover:opacity-80 transition-opacity`}>
          <ArrowLeft size={16} /> Volver a pedidos
        </button>
        <div className={`${theme.card} p-5 ${theme.cardRadius} border space-y-4 shadow-lg`}>
          <div className={`flex justify-between items-start border-b ${theme.borderSubtle} pb-3`}>
            <div>
              <span className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>Pedido #{selectedOrder.id.slice(-5)}</span>
              <h3 className="font-black text-base mt-0.5">{selectedOrder.customer_name}</h3>
              <p className="text-[10px] opacity-60">{new Date(selectedOrder.created_at).toLocaleString('es-ES')}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[selectedOrder.status]}`}>{STATUS_LABELS[selectedOrder.status]}</span>
          </div>

          {/* Customer info */}
          <div className={`space-y-1.5 text-xs ${theme.sectionBg} p-3 rounded-2xl`}>
            {selectedOrder.phone && <p className="flex items-center gap-2"><Phone size={12} className={theme.subtext} /> {selectedOrder.phone}</p>}
            <p className="flex items-center gap-2"><Truck size={12} className={theme.subtext} /> {selectedOrder.delivery_method === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</p>
            {selectedOrder.address && <p className="flex items-center gap-2"><MapPin size={12} className={theme.subtext} /> {selectedOrder.address}</p>}
          </div>

          {/* Payment method — editable if no proof */}
          <div className={`flex items-center justify-between p-3 rounded-2xl ${theme.sectionBg}`}>
            <div className="flex items-center gap-2">
              <CreditCard size={14} className={theme.accent} />
              <span className="text-xs font-bold">Pago: </span>
              {editingPayment ? (
                <select value={newPayment} onChange={e => setNewPayment(e.target.value as Order['payment_method'])}
                  style={selectStyle(theme, customTextColor)}
                  className={`${theme.selectBg} border rounded-xl px-2 py-1 text-[10px] font-bold outline-none`}>
                  <option value="yape">Yape/Plin</option>
                  <option value="cash">Efectivo</option>
                  <option value="bank">Transferencia</option>
                  <option value="card">Tarjeta</option>
                </select>
              ) : (
                <span className="text-xs font-bold uppercase">{selectedOrder.payment_method}</span>
              )}
            </div>
            {editingPayment ? (
              <div className="flex gap-2">
                <button onClick={() => handlePaymentUpdate(selectedOrder.id)} className={`${theme.primary} px-3 py-1.5 rounded-xl text-[10px] font-bold`}>Guardar</button>
                <button onClick={() => setEditingPayment(false)} className={`border ${theme.borderSubtle} px-3 py-1.5 rounded-xl text-[10px] font-bold`}>Cancelar</button>
              </div>
            ) : (
              !selectedOrder.payment_proof && (
                <button onClick={() => { setNewPayment(selectedOrder.payment_method); setEditingPayment(true); }} className={`text-[10px] font-bold ${theme.accent} hover:underline flex items-center gap-1`}>
                  <Pencil size={11} /> Editar
                </button>
              )
            )}
          </div>

          {/* Products ordered */}
          <div className="space-y-2">
            <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>Productos del pedido</p>
            {selectedOrder.items.map((item: OrderItem, idx: number) => (
              <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-2xl ${theme.sectionBg}`}>
                {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs line-clamp-1">{item.name}</p>
                  <p className={`text-[10px] ${theme.subtext}`}>{item.quantity}x {store.currency_symbol}{Number(item.price).toFixed(2)}</p>
                </div>
                <span className="font-bold text-xs">{store.currency_symbol}{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={`flex justify-between items-center border-t ${theme.borderSubtle} pt-3`}>
            <span className="text-xs font-bold opacity-70">Total:</span>
            <span className={`${theme.accent} text-lg font-black`}>{store.currency_symbol}{Number(selectedOrder.total).toFixed(2)}</span>
          </div>

          {/* Payment proof */}
          {selectedOrder.payment_proof && (
            <div className={`border-t ${theme.borderSubtle} pt-3`}>
              <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider mb-2 flex items-center gap-1.5`}><Receipt size={11} /> Comprobante de pago</p>
              <img src={selectedOrder.payment_proof} alt="Comprobante" className={`w-full max-h-64 object-contain ${theme.cardRadius} border ${theme.borderSubtle}`} />
            </div>
          )}

          {/* Status + PDF */}
          <div className="flex gap-2">
            <select value={selectedOrder.status} onChange={e => handleStatus(selectedOrder.id, e.target.value as Order['status'])}
              style={selectStyle(theme, customTextColor)}
              className={`flex-1 ${theme.selectBg} font-bold border rounded-xl px-3 py-2.5 text-xs outline-none`}>
              <option value="pending">Pendiente</option>
              <option value="preparing">Preparando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
            </select>
            <button onClick={() => generateOrderPDF(selectedOrder, store)} className={`${theme.accentBg} px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap`}>
              <FileText size={14} /> PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <p className={`text-xs font-bold ${theme.accent} mb-1 uppercase tracking-wider`}>Análisis de Negocio</p>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Pedidos</h2>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`p-2 ${theme.accentBg} ${theme.cardRadius} ${theme.accent}`}><DollarSign size={18} /></span>
          </div>
          <p className={`text-xs ${theme.subtext}`}>Ingresos Totales</p>
          <h3 className={`text-lg font-bold mt-1 ${theme.accent}`}>{store.currency_symbol}{totalRevenue.toFixed(2)}</h3>
        </div>
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`p-2 ${theme.accentBg} ${theme.cardRadius} ${theme.accent}`}><ShoppingCart size={18} /></span>
          </div>
          <p className={`text-xs ${theme.subtext}`}>Pedidos Totales</p>
          <h3 className="text-lg font-bold mt-1">{orders.length}</h3>
        </div>
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`p-2 ${theme.accentBg} ${theme.cardRadius} ${theme.accent}`}><Receipt size={18} /></span>
          </div>
          <p className={`text-xs ${theme.subtext}`}>Ticket Promedio</p>
          <h3 className={`text-lg font-bold mt-1 ${theme.accent}`}>{store.currency_symbol}{avgTicket.toFixed(2)}</h3>
        </div>
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`p-2 ${theme.accentBg} ${theme.cardRadius} ${theme.accent}`}><CheckCircle2 size={18} /></span>
          </div>
          <p className={`text-xs ${theme.subtext}`}>Entregados</p>
          <h3 className="text-lg font-bold mt-1">{deliveredCount}</h3>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'preparing', 'shipped', 'delivered'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${statusFilter === s ? theme.primary : `${theme.card} ${theme.borderSubtle} opacity-60`}`}>
            {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className={`text-center py-16 space-y-3 opacity-50 ${theme.subtext}`}><Clock size={40} className="mx-auto" /><p className="text-xs font-medium">No hay pedidos {statusFilter !== 'all' ? 'con este estado' : 'todavía'}.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => {
            const statusIcon = order.status === 'pending' ? <MessageCircle size={20} /> : order.status === 'shipped' ? <Truck size={20} /> : order.status === 'delivered' ? <CheckCircle2 size={20} /> : <Clock size={20} />;
            const statusBg = order.status === 'pending' ? 'bg-[#25D366]/10 text-[#25D366]' : order.status === 'shipped' ? `${theme.accentBg} ${theme.accent}` : order.status === 'delivered' ? 'bg-green-100 text-green-600' : `${theme.sectionBg} ${theme.subtext}`;
            return (
              <div key={order.id}
                className={`${theme.card} border ${theme.borderSubtle} ${theme.cardRadius} p-5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusBg}`}>{statusIcon}</div>
                    <div>
                      <p className={`text-[10px] font-bold ${theme.subtext} uppercase tracking-wider`}>#{order.id.slice(-5)}</p>
                      <h4 className="font-bold text-sm leading-tight">{order.customer_name}</h4>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                </div>
                <div className="space-y-1.5 mb-4 flex-grow">
                  <div className="flex justify-between text-xs">
                    <span className={theme.subtext}>Productos:</span>
                    <span className="font-medium">{order.items.length} items</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={theme.subtext}>Pago:</span>
                    <span className="font-medium uppercase">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={theme.subtext}>Total:</span>
                    <span className={`font-bold ${theme.accent}`}>{store.currency_symbol}{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
                <div className={`pt-3 border-t ${theme.borderSubtle} flex gap-2`}>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                    className={`flex-1 py-2.5 ${theme.cardRadius} text-xs font-bold border ${theme.borderSubtle} ${theme.accent} hover:bg-[#075ea1]/5 transition-colors`}>
                    Ver Detalles
                  </button>
                  <a href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, '') || ''}`} target="_blank" rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 flex items-center justify-center bg-[#25D366] text-white ${theme.cardRadius} active:scale-90 transition-transform shrink-0">
                    <Send size={16} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============ ADMIN AJUSTES ============

interface AdminSettingsProps { store: Store; theme: ThemeDef; categories: Category[]; onUpdate: (updates: Partial<Store>) => Promise<void>; onUpgrade: () => void; onOpenQR: () => void; onRefresh: () => void; customTextColor?: string; }

const AdminSettings: React.FC<AdminSettingsProps> = ({ store, theme, categories, onUpdate, onUpgrade, onOpenQR, onRefresh, customTextColor }) => {
  const [showCatModal, setShowCatModal] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const planLimits = PLAN_LIMITS[store.plan] || PLAN_LIMITS.free;
  const payments = store.payments || {};
  const update = (partial: Partial<Store>) => onUpdate(partial);

  useEffect(() => {
    api.fetchBanners(store.id).then(setBanners).catch(() => {});
  }, [store.id]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La imagen no puede pesar más de 2MB.'); return; }
    setLogoUploading(true);
    try {
      const base64 = await readFileAsBase64(file);
      await update({ logo: base64 });
    } catch { alert('Error al subir el logo.'); }
    setLogoUploading(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (banners.length >= planLimits.maxBanners) { alert(`Tu plan permite hasta ${planLimits.maxBanners} banner(s).`); return; }
    try {
      const base64 = await readFileAsBase64(file);
      await api.addBanner(store.id, base64);
      const b = await api.fetchBanners(store.id); setBanners(b); onRefresh();
    } catch { alert('Error al subir el banner'); }
  };
  const handleDeleteBanner = async (id: string) => { try { await api.deleteBanner(id); const b = await api.fetchBanners(store.id); setBanners(b); onRefresh(); } catch { alert('Error'); } };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <p className={`text-xs font-bold ${theme.accent} mb-1 uppercase tracking-wider`}>Configuración</p>
        <h2 className="text-2xl font-bold tracking-tight">Ajustes</h2>
      </div>

      {/* Store profile quick card - matching mockup */}
      <div className={`${theme.card} ${theme.cardRadius} p-5 flex items-center gap-4 shadow-md hover:scale-[1.01] transition-transform border ${theme.borderSubtle}`}>
        <div className={`w-16 h-16 rounded-full ${theme.sectionBg} flex items-center justify-center ${theme.accent} shrink-0 overflow-hidden`}>
          {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" /> : <StoreIcon size={28} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base truncate">{store.name}</h3>
          <p className={`text-xs ${theme.subtext}`}>Plan {PLAN_LIMITS[store.plan].name} &bull; ID: #{store.id.slice(-6)}</p>
        </div>
        <button onClick={onUpgrade} className={`${theme.primary} px-3.5 py-2 ${theme.cardRadius} text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform shrink-0`}><Crown size={14} className="text-amber-400" /> Cambiar</button>
      </div>

      {/* Section: Perfil de la Tienda */}
      <section>
        <h3 className={`text-xs font-bold ${theme.subtext} uppercase tracking-wider mb-3 px-1`}>Perfil de la Tienda</h3>
        <div className={`${theme.card} ${theme.cardRadius} border ${theme.borderSubtle} overflow-hidden shadow-md`}>
          <div className="p-4 space-y-3.5">
            <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>Información de la tienda</p>
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Nombre de la tienda</label>
              <input type="text" value={store.name} onChange={e => update({ name: e.target.value })} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#075ea1]`} />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Eslogan</label>
              <input type="text" value={store.slogan} onChange={e => update({ slogan: e.target.value })} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#075ea1]`} />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Rubro / Giro</label>
              <input type="text" value={store.rubro || ''} onChange={e => update({ rubro: e.target.value })} placeholder="Ej: Ropa, Comida, Tecnología..." className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#075ea1]`} />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>País</label>
              <select value={store.country || 'US'} onChange={e => {
                const country = COUNTRIES.find(c => c.code === e.target.value);
                update({ country: e.target.value, currency_symbol: country?.currency || '$' });
              }}
                style={selectStyle(theme, customTextColor)}
                className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#075ea1] font-medium`}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Número de WhatsApp</label>
              <input type="tel" inputMode="tel" value={store.whatsapp} onChange={e => update({ whatsapp: e.target.value })} placeholder="+51 999 888 777" className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#075ea1]`} />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Moneda</label>
              <input type="text" value={store.currency_symbol} onChange={e => update({ currency_symbol: e.target.value })} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#075ea1]`} />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Diseño y Personalización */}
      <section>
        <h3 className={`text-xs font-bold ${theme.subtext} uppercase tracking-wider mb-3 px-1`}>Diseño y Personalización</h3>
        <div className="space-y-4">
      {/* Logo de la tienda */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3.5 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><ImageIcon size={14} /> Logo de la tienda</p>
        <p className={`text-[11px] ${theme.subtext}`}>Sube el logo de tu tienda. Se mostrará en el encabezado de tu catálogo.</p>
        <div className="flex items-center gap-3">
          <div className={`w-20 h-20 ${theme.cardRadius} border-2 ${theme.borderSubtle} overflow-hidden flex items-center justify-center shrink-0 bg-black/10`}>
            {store.logo ? <img src={store.logo} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon size={28} className={theme.subtext} />}
          </div>
          <div className="flex-1 space-y-2">
            <label className={`${theme.primary} px-4 py-2.5 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity`}>
              {logoUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={15} />}
              {logoUploading ? 'Subiendo...' : 'Subir logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {store.logo && (
              <button onClick={() => update({ logo: '' })} className={`w-full text-[10px] text-red-400 hover:underline font-bold`}>Quitar logo</button>
            )}
          </div>
        </div>
      </div>

      {/* Pagos */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3.5 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><CreditCard size={14} /> Métodos de pago</p>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} space-y-2`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2"><Wallet size={14} className={theme.accent} /> Billetera digital</label>
            <input type="checkbox" checked={payments.acceptsYape !== false} onChange={e => update({ payments: { ...payments, acceptsYape: e.target.checked } })} className="rounded focus:ring-0" />
          </div>
          <input type="text" placeholder="Número de billetera (ej. +1 555 0123)" value={payments.yapePlinNumber || ''} onChange={e => update({ payments: { ...payments, yapePlinNumber: e.target.value } })} className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none`} />
        </div>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} space-y-2`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2"><CreditCard size={14} className={theme.accent} /> Tarjeta / Enlace de pago</label>
            <input type="checkbox" checked={!!payments.acceptsCard} onChange={e => update({ payments: { ...payments, acceptsCard: e.target.checked } })} className="rounded focus:ring-0" />
          </div>
          <input type="text" placeholder="Stripe, PayPal, MercadoPago..." value={payments.cardPaymentLink || ''} onChange={e => update({ payments: { ...payments, cardPaymentLink: e.target.value } })} className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none`} />
        </div>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} space-y-2`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-2"><Building2 size={14} className={theme.accent} /> Transferencia bancaria</label>
            <input type="checkbox" checked={payments.acceptsBankTransfer !== false} onChange={e => update({ payments: { ...payments, acceptsBankTransfer: e.target.checked } })} className="rounded focus:ring-0" />
          </div>
          <textarea rows={2} placeholder="Nombre del banco y número de cuenta" value={payments.bankAccountDetails || ''} onChange={e => update({ payments: { ...payments, bankAccountDetails: e.target.value } })} className={`w-full ${theme.selectBg} border rounded-2xl p-2.5 text-xs outline-none resize-none`} />
        </div>
        <div className={`p-3 rounded-2xl ${theme.sectionBg} border ${theme.borderSubtle} flex items-center justify-between`}>
          <label className="text-xs font-bold flex items-center gap-2"><Banknote size={14} className={theme.accent} /> Pago contra entrega</label>
          <input type="checkbox" checked={payments.acceptsCash !== false} onChange={e => update({ payments: { ...payments, acceptsCash: e.target.checked } })} className="rounded focus:ring-0" />
        </div>
      </div>

      {/* Banners */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3.5 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><ImageIconBanner size={14} /> Banners promocionales ({banners.length}/{planLimits.maxBanners === Infinity ? '\u221e' : planLimits.maxBanners})</p>
        <label className={`flex items-center justify-center gap-2 ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity`}>
          <ImageIcon size={16} /> Subir banner desde tu dispositivo
          <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
        </label>
        {banners.length > 0 && (
          <div className="space-y-2">
            {banners.map(b => (
              <div key={b.id} className={`relative ${theme.cardRadius} overflow-hidden border ${theme.borderSubtle} group`}>
                <img src={b.image_url} alt="Banner" className="w-full h-20 object-cover" />
                <button onClick={() => handleDeleteBanner(b.id)} className="absolute top-1.5 right-1.5 bg-red-500/80 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tipografía */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><Type size={14} /> Tipografía</p>
        <select value={store.font} onChange={e => update({ font: e.target.value })}
          style={selectStyle(theme, customTextColor)}
          className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none font-medium`}>
          {AVAILABLE_FONTS.map(f => <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>{f.name}</option>)}
        </select>
      </div>

      {/* Tema visual */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><Palette size={14} /> Tema visual</p>
        <div className="grid grid-cols-2 gap-2.5">
          {ALL_THEMES.map(t => (
            <button key={t.id} onClick={() => update({ theme: t.id, custom_bg_color: null, custom_text_color: null, custom_accent_color: null })}
              className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center justify-between transition-all ${store.theme === t.id && !store.custom_bg_color ? `${theme.accentBg} ring-2 ring-[#1E6FFF]/30` : `${theme.borderSubtle} hover:opacity-80`}`}>
              <span className="truncate pr-1">{t.name}</span><span className="w-4 h-4 rounded-full border shadow-sm shrink-0" style={{ backgroundColor: t.color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Colores personalizados */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3.5 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><Droplet size={14} /> Colores personalizados</p>
        <p className={`text-[11px] ${theme.subtext}`}>Personaliza los colores de tu tienda. Estos anulan el tema seleccionado arriba.</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold">Color de fondo</label>
            <div className="flex items-center gap-2">
              <input type="color" value={store.custom_bg_color || '#0A1628'} onChange={e => update({ custom_bg_color: e.target.value })} className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent" />
              <button onClick={() => update({ custom_bg_color: null })} className={`text-[10px] ${theme.subtext} underline`}>Restablecer</button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold">Color del texto</label>
            <div className="flex items-center gap-2">
              <input type="color" value={store.custom_text_color || '#F1F5F9'} onChange={e => update({ custom_text_color: e.target.value })} className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent" />
              <button onClick={() => update({ custom_text_color: null })} className={`text-[10px] ${theme.subtext} underline`}>Restablecer</button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold">Color de acento</label>
            <div className="flex items-center gap-2">
              <input type="color" value={store.custom_accent_color || '#1E6FFF'} onChange={e => update({ custom_accent_color: e.target.value })} className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent" />
              <button onClick={() => update({ custom_accent_color: null })} className={`text-[10px] ${theme.subtext} underline`}>Restablecer</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modelo de catálogo */}
      <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-3 shadow-md`}>
        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><LayoutGrid size={14} /> Modelo de catálogo</p>
        <div className="grid grid-cols-2 gap-2.5">
          {CATALOG_LAYOUTS.map(layout => {
            const Icon = layout.icon;
            return (
              <button key={layout.id} onClick={() => update({ catalog_layout: layout.id })}
                className={`p-3 ${theme.cardRadius} border text-left transition-all ${store.catalog_layout === layout.id ? `${theme.accentBg} ring-2 ring-[#1E6FFF]/30` : `${theme.borderSubtle} hover:opacity-80`}`}>
                <Icon size={18} className={theme.accent} />
                <p className="font-bold text-xs mt-1.5">{layout.name}</p>
                <p className={`text-[10px] ${theme.subtext}`}>{layout.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <CategoryManagerModal isOpen={showCatModal} onClose={() => setShowCatModal(false)} categories={categories} storeId={store.id} theme={theme} onSaved={onRefresh} customTextColor={customTextColor} />
        </div>
      </section>
    </div>
  );
};

// ============ VISTA CARRITO ============

interface CartViewProps {
  cart: CartItem[]; store: Store; theme: ThemeDef;
  onUpdateQty: (id: string, delta: number) => void; onRemove: (id: string) => void;
  onClear: () => void; onBack: () => void; onOrder: (order: Omit<Order, 'id' | 'store_id' | 'created_at'>) => void;
}

const CartView: React.FC<CartViewProps> = ({ cart, store, theme, onUpdateQty, onRemove, onClear, onBack, onOrder }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'card' | 'cash' | 'bank'>('yape');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const payments = store.payments || {};
  const subtotal = cart.reduce((sum, item) => {
    const price = (item.is_offer && item.offer_price) ? item.offer_price : item.price;
    return sum + price * item.quantity;
  }, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const availableMethods: { id: 'yape' | 'card' | 'cash' | 'bank'; label: string; icon: any }[] = [];
  if (payments.acceptsYape !== false) availableMethods.push({ id: 'yape', label: 'Billetera', icon: Wallet });
  if (payments.acceptsCard) availableMethods.push({ id: 'card', label: 'Tarjeta', icon: CreditCard });
  if (payments.acceptsBankTransfer !== false) availableMethods.push({ id: 'bank', label: 'Banco', icon: Building2 });
  if (payments.acceptsCash !== false) availableMethods.push({ id: 'cash', label: 'Efectivo', icon: Banknote });

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('La imagen es muy grande (máx 5MB)'); return; }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setPaymentProof(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canProceedStep1 = customerName.trim().length >= 2 && (deliveryMethod === 'pickup' || address.trim().length >= 5);
  const canProceedStep2 = availableMethods.length > 0;
  const canSend = canProceedStep1 && canProceedStep2 && (paymentMethod !== 'cash' || true);

  const payLabel = paymentMethod === 'yape' ? 'Billetera digital' : paymentMethod === 'card' ? 'Tarjeta' : paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia bancaria';

  const buildWhatsAppText = (paymentProofUrl?: string | null) => {
    let text = `*NUEVO PEDIDO - ${store.name.toUpperCase()}*\n\n`;
    text += `*Cliente:* ${customerName}\n`;
    if (customerPhone) text += `*Teléfono:* ${customerPhone}\n`;
    text += `*Entrega:* ${deliveryMethod === 'delivery' ? 'Delivery' : 'Recojo en tienda'}\n`;
    if (deliveryMethod === 'delivery' && address) text += `*Dirección:* ${address}\n`;
    text += `*Pago:* ${payLabel}\n`;
    if (paymentProofUrl) text += `*Comprobante de pago:* ${paymentProofUrl}\n`;
    text += `\n*DETALLE DEL PEDIDO:*\n`;
    text += `${'─'.repeat(24)}\n`;
    cart.forEach(item => {
      const price = (item.is_offer && item.offer_price) ? item.offer_price : item.price;
      const lineTotal = price * item.quantity;
      text += `${item.quantity}x ${item.name}\n   ${store.currency_symbol}${lineTotal.toFixed(2)}\n`;
    });
    text += `${'─'.repeat(24)}\n`;
    text += `*TOTAL: ${store.currency_symbol}${subtotal.toFixed(2)}*\n\n`;
    text += `*DATOS DE PAGO:*\n`;
    if (paymentMethod === 'yape' && payments.yapePlinNumber) {
      text += `Billetera: ${payments.yapePlinNumber}\n`;
      if (payments.yapePlinHolder) text += `Titular: ${payments.yapePlinHolder}\n`;
    }
    if (paymentMethod === 'bank' && payments.bankAccountDetails) {
      text += `Cuenta: ${payments.bankAccountDetails}\n`;
    }
    if (paymentMethod === 'card' && payments.cardPaymentLink) {
      text += `Pagar con tarjeta: ${payments.cardPaymentLink}\n`;
    }
    if (paymentMethod === 'cash') {
      text += `Pago en efectivo al momento de la entrega/recojo.\n`;
    }
    text += `\n_Pedido generado desde ${store.name}_`;
    return text;
  };

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    let proofUrl: string | null = null;
    if (proofFile) {
      try {
        proofUrl = await uploadPaymentProof(proofFile);
      } catch {
        setSending(false);
        alert('No se pudo subir el comprobante. Intenta de nuevo.');
        return;
      }
    }
    const newOrder: Omit<Order, 'id' | 'store_id' | 'created_at'> = {
      customer_name: customerName || 'Cliente WhatsApp',
      phone: customerPhone || null,
      delivery_method: deliveryMethod,
      address: deliveryMethod === 'delivery' ? address : null,
      payment_method: paymentMethod,
      items: cart.map(i => ({ id: i.id, name: i.name, price: (i.is_offer && i.offer_price) ? i.offer_price : i.price, quantity: i.quantity, image: i.image })),
      total: subtotal, payment_proof: proofUrl, status: 'pending'
    };
    try {
      await onOrder(newOrder);
      const text = buildWhatsAppText(proofUrl);
      const cleanPhone = store.whatsapp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
      setOrderSent(true);
      setSending(false);
    } catch {
      setSending(false);
      alert('Error al enviar el pedido. Intenta de nuevo.');
    }
  };

  if (orderSent) {
    return (
      <div className="text-center py-16 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className={`w-24 h-24 mx-auto ${theme.accentBg} rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500`}>
          <Check size={48} className={theme.accent} strokeWidth={3} />
        </div>
        <h3 className="font-black text-xl">¡Pedido enviado!</h3>
        <p className={`text-xs max-w-xs mx-auto ${theme.subtext}`}>Te redirigimos a WhatsApp para confirmar tu pedido con el vendedor. Revisa que se haya abierto el chat.</p>
        <button onClick={() => { onClear(); onBack(); }} className={`${theme.primary} px-6 py-3 ${theme.cardRadius} text-xs font-bold inline-flex items-center gap-2 active:scale-95`}><ArrowLeft size={16} /> Volver al catálogo</button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 animate-in fade-in duration-200">
        <div className={`w-20 h-20 mx-auto ${theme.sectionBg} rounded-full flex items-center justify-center ${theme.subtext} border ${theme.borderSubtle}`}><ShoppingBag size={36} /></div>
        <h3 className="font-bold text-base">Tu carrito está vacío</h3>
        <p className={`text-xs max-w-xs mx-auto ${theme.subtext}`}>Explora el catálogo y agrega tus productos.</p>
        <button onClick={onBack} className={`${theme.primary} px-5 py-3 ${theme.cardRadius} text-xs font-bold inline-flex items-center gap-2`}><ArrowLeft size={16} /> Ver productos</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-24">
      <div className="mb-2">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShoppingBag size={22} className={theme.accent} /> Tu Carrito</h2>
        <p className={`text-sm ${theme.subtext} mt-1`}>Revisa tus productos seleccionados antes de finalizar el pedido.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${step >= s ? theme.accent : theme.subtext}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? theme.accentBg : `${theme.sectionBg} border ${theme.borderSubtle}`}`}>
                {step > s ? <Check size={15} /> : s}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide hidden sm:block">{s === 1 ? 'Datos' : s === 2 ? 'Confirmar' : 'Pago'}</span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > s ? theme.accent.replace('text-', 'bg-') : theme.borderSubtle}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart items column */}
        <div className="lg:col-span-8 space-y-3">
          {cart.map(item => {
            const price = (item.is_offer && item.offer_price) ? item.offer_price : item.price;
            return (
              <div key={item.id} className={`${theme.card} p-4 ${theme.cardRadius} border border-opacity-30 flex gap-4 shadow-md hover:scale-[1.01] transition-transform`}>
                <div className={`w-24 h-24 ${theme.cardRadius} overflow-hidden shrink-0 ${theme.sectionBg}`}>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.name}</h4>
                      <p className={`text-xs ${theme.subtext} mt-0.5`}>{store.currency_symbol}{price.toFixed(2)} c/u</p>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors shrink-0"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className={`flex items-center gap-1 ${theme.sectionBg} rounded-xl p-1 border ${theme.borderSubtle}`}>
                      <button onClick={() => onUpdateQty(item.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${theme.card} ${theme.accent} font-bold text-sm hover:opacity-80 active:scale-90 transition-all`}>-</button>
                      <span className="px-4 font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${theme.card} ${theme.accent} font-bold text-sm hover:opacity-80 active:scale-90 transition-all`}>+</button>
                    </div>
                    <span className={`text-lg font-black ${theme.accent}`}>{store.currency_symbol}{(price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={onClear} className="text-xs text-red-400 hover:underline font-bold pt-1">Vaciar carrito</button>
        </div>

        {/* Summary column */}
        <div className="lg:col-span-4">
          <div className={`${theme.sectionBg} ${theme.cardRadius} p-5 shadow-md sticky top-24 border ${theme.borderSubtle}`}>
            <h3 className="font-bold text-base mb-4">Resumen</h3>
            <div className="space-y-2.5 mb-4">
              <div className={`flex justify-between text-sm ${theme.subtext}`}><span>Subtotal ({totalItems} items)</span><span className="font-medium">{store.currency_symbol}{subtotal.toFixed(2)}</span></div>
              <div className={`flex justify-between text-sm ${theme.subtext}`}><span>Envío</span><span className={theme.accent}>Se coordina</span></div>
            </div>
            <div className={`h-px ${theme.borderSubtle} my-3`} />
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-bold">Total</span>
              <span className={`text-2xl font-black ${theme.accent}`}>{store.currency_symbol}{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: Datos de entrega */}
      {step === 1 && (
        <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-4 shadow-md animate-in fade-in slide-in-from-right-4 duration-200`}>
          <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><User size={12} /> Datos de entrega</p>
          <div>
            <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Nombre completo *</label>
            <input type="text" placeholder="Ej: María García" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#1E6FFF]`} />
          </div>
          <div>
            <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Teléfono (opcional)</label>
            <input type="tel" inputMode="tel" placeholder="Ej: +51 999 888 777" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#1E6FFF]`} />
          </div>
          <div>
            <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Tipo de entrega</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDeliveryMethod('delivery')} className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center justify-center gap-2 transition-all ${deliveryMethod === 'delivery' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><Truck size={16} /> Delivery</button>
              <button onClick={() => setDeliveryMethod('pickup')} className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center justify-center gap-2 transition-all ${deliveryMethod === 'pickup' ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}><StoreIcon size={16} /> Recojo</button>
            </div>
          </div>
          {deliveryMethod === 'delivery' && (
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1`}>Dirección de entrega *</label>
              <input type="text" placeholder="Ej: Av. Principal 123, Ref. Frente al parque" value={address} onChange={e => setAddress(e.target.value)} className={`w-full ${theme.selectBg} border ${theme.cardRadius} p-3 text-xs outline-none focus:border-[#1E6FFF]`} />
            </div>
          )}
          <button onClick={() => canProceedStep1 && setStep(2)} disabled={!canProceedStep1} className={`w-full ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all`}>Continuar <ChevronRight size={16} /></button>
        </div>
      )}

      {/* STEP 2: Confirmación del pedido antes de pago */}
      {step === 2 && (
        <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-4 shadow-md animate-in fade-in slide-in-from-right-4 duration-200`}>
          <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><Receipt size={12} /> Confirmar tu pedido</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className={theme.subtext}>Cliente</span><span className="font-bold">{customerName}</span></div>
            {customerPhone && <div className="flex justify-between"><span className={theme.subtext}>Teléfono</span><span className="font-bold">{customerPhone}</span></div>}
            <div className="flex justify-between"><span className={theme.subtext}>Entrega</span><span className="font-bold">{deliveryMethod === 'delivery' ? 'Delivery' : 'Recojo'}</span></div>
            {deliveryMethod === 'delivery' && address && <div className="flex justify-between gap-2"><span className={theme.subtext}>Dirección</span><span className="font-bold text-right">{address}</span></div>}
          </div>
          <div className={`border-t ${theme.borderSubtle} pt-3 space-y-1`}>
            {cart.map(item => {
              const price = (item.is_offer && item.offer_price) ? item.offer_price : item.price;
              return <div key={item.id} className="flex justify-between text-[11px]"><span className={theme.subtext}>{item.quantity}x {item.name}</span><span className="font-bold">{store.currency_symbol}{(price * item.quantity).toFixed(2)}</span></div>;
            })}
          </div>
          <div className={`flex justify-between items-center border-t ${theme.borderSubtle} pt-3`}>
            <span className="text-sm font-bold">Total</span>
            <span className={`text-xl font-black ${theme.accent}`}>{store.currency_symbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className={`flex-1 ${theme.badge} py-3 ${theme.cardRadius} text-xs font-bold`}>Editar pedido</button>
            <button onClick={() => setStep(3)} className={`flex-1 ${theme.primary} py-3 ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-2 active:scale-95`}>Ir a pagar <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* STEP 3: Método de pago + comprobante */}
      {step === 3 && (
        <div className={`${theme.card} p-4 ${theme.cardRadius} border space-y-4 shadow-md animate-in fade-in slide-in-from-right-4 duration-200`}>
          <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider flex items-center gap-1.5`}><Wallet size={12} /> Método de pago</p>
          <div className="grid grid-cols-2 gap-2">
            {availableMethods.map(m => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`p-3 ${theme.cardRadius} border text-xs font-bold flex items-center gap-2 transition-all ${paymentMethod === m.id ? theme.accentBg : `${theme.borderSubtle} opacity-70`}`}>
                  <Icon size={16} /> {m.label}
                </button>
              );
            })}
          </div>

          {/* Payment details box */}
          <div className={`${theme.sectionBg} ${theme.cardRadius} border ${theme.borderSubtle} p-3.5 space-y-2`}>
            {paymentMethod === 'yape' && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Datos de billetera</p>
                {payments.yapePlinNumber ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold">{payments.yapePlinNumber}</span>
                      <button onClick={() => navigator.clipboard?.writeText(payments.yapePlinNumber || '')} className={`p-1.5 ${theme.badge} rounded-lg`}><Copy size={12} /></button>
                    </div>
                    {payments.yapePlinHolder && <p className="text-[11px] opacity-70">Titular: {payments.yapePlinHolder}</p>}
                  </div>
                ) : <p className="text-[11px] opacity-60">El vendedor no configuró el número. Contáctalo por WhatsApp.</p>}
              </>
            )}
            {paymentMethod === 'bank' && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Cuenta bancaria</p>
                {payments.bankAccountDetails ? <p className="text-[11px] whitespace-pre-line">{payments.bankAccountDetails}</p> : <p className="text-[11px] opacity-60">El vendedor no configuró la cuenta. Contáctalo por WhatsApp.</p>}
              </>
            )}
            {paymentMethod === 'card' && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Pago con tarjeta</p>
                {payments.cardPaymentLink ? <a href={payments.cardPaymentLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 ${theme.primary} px-3 py-2 ${theme.cardRadius} text-xs font-bold`}><ExternalLink size={13} /> Ir a pagar</a> : <p className="text-[11px] opacity-60">El vendedor no configuró el enlace. Contáctalo por WhatsApp.</p>}
              </>
            )}
            {paymentMethod === 'cash' && <p className="text-[11px] opacity-70">Pagarás en efectivo al momento de la entrega o recojo.</p>}
          </div>

          {/* Payment proof upload */}
          {paymentMethod !== 'cash' && (
            <div>
              <label className={`block text-[10px] font-semibold ${theme.subtext} mb-1.5`}>Comprobante de pago (opcional)</label>
              {paymentProof ? (
                <div className="relative">
                  <img src={paymentProof} alt="Comprobante" className={`w-full max-h-48 object-contain ${theme.cardRadius} border ${theme.borderSubtle}`} />
                  <button onClick={() => { setPaymentProof(null); setProofFile(null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg"><X size={14} /></button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-2 p-6 ${theme.sectionBg} ${theme.cardRadius} border-2 border-dashed ${theme.borderSubtle} cursor-pointer hover:border-[#1E6FFF] transition-colors`}>
                  <Upload size={22} className={theme.subtext} />
                  <span className="text-[11px] font-semibold opacity-70">Toca para subir captura del comprobante</span>
                  <span className="text-[9px] opacity-50">JPG, PNG · máx 2MB</span>
                  <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className={`flex-1 ${theme.badge} py-3 ${theme.cardRadius} text-xs font-bold`}>Atrás</button>
            <button onClick={handleSend} disabled={sending} className={`flex-[2] ${theme.primary} py-3.5 ${theme.cardRadius} text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50`}>
              {sending ? <Loader2 size={18} className="animate-spin" /> : <><MessageCircle size={18} /> ENVIAR A WHATSAPP</>}
            </button>
          </div>
          <p className={`text-center text-[10px] ${theme.subtext} flex items-center justify-center gap-1`}><ShieldCheck size={11} /> Tu pedido se envía seguro por WhatsApp</p>
        </div>
      )}

      {/* Floating total bar on mobile */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme.card} border-t ${theme.borderSubtle} p-3 flex items-center justify-between shadow-2xl z-30 sm:hidden`}>
        <div><span className={`text-[10px] ${theme.subtext}`}>Total</span><p className={`text-lg font-black ${theme.accent}`}>{store.currency_symbol}{subtotal.toFixed(2)}</p></div>
        <button onClick={() => {
          if (step === 1 && canProceedStep1) setStep(2);
          else if (step === 2) setStep(3);
          else if (step === 3) handleSend();
        }} disabled={(step === 1 && !canProceedStep1) || sending} className={`${theme.primary} px-5 py-2.5 ${theme.cardRadius} text-xs font-bold flex items-center gap-1.5 disabled:opacity-50`}>{step === 3 ? <><MessageCircle size={15} /> Enviar</> : <>Continuar <ChevronRight size={15} /></>}</button>
      </div>
    </div>
  );
};

// ============ VISTA CATÁLOGO ============

interface CatalogViewProps { products: Product[]; store: Store; theme: ThemeDef; banners: Banner[]; addToCart: (p: Product) => void; }

const CatalogView: React.FC<CatalogViewProps> = ({ products, store, theme, banners, addToCart }) => {
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [selectedSub, setSelectedSub] = useState('Todos');
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'low' | 'high'>('default');
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const catNames = ['Todos', ...new Set(products.map(p => p.category))];
  const activeCatProducts = products.filter(p => p.category === selectedCat);
  const subs: string[] = selectedCat === 'Todos' ? [] : ['Todos', ...new Set(activeCatProducts.map(p => p.subcategory).filter((s): s is string => !!s))];

  let filtered = products.filter(p => {
    const mc = selectedCat === 'Todos' || p.category === selectedCat;
    const ms = selectedSub === 'Todos' || p.subcategory === selectedSub;
    const mo = !onlyOffers || p.is_offer;
    const msr = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return mc && ms && mo && msr;
  });
  if (sortBy === 'low') filtered.sort((a, b) => ((a.is_offer && a.offer_price) ? a.offer_price : a.price) - ((b.is_offer && b.offer_price) ? b.offer_price : b.price));
  if (sortBy === 'high') filtered.sort((a, b) => ((b.is_offer && b.offer_price) ? b.offer_price : b.price) - ((a.is_offer && a.offer_price) ? a.offer_price : a.price));

  const layout = store.catalog_layout || 'grid2';
  const accentColor = store.custom_accent_color || undefined;

  // Shared "Add" button — consistent across all layouts
  const AddButton = ({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = {
      sm: 'text-[9px] px-2 py-1 gap-0.5',
      md: 'text-[10px] px-3 py-1.5 gap-1',
      lg: 'text-xs px-4 py-2.5 gap-1.5',
    };
    const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 13;
    return (
      <button
        onClick={() => addToCart(product)}
        className={`${theme.primary} ${sizes[size]} font-bold ${theme.cardRadius} flex items-center justify-center active:scale-95 transition-transform shadow-sm whitespace-nowrap shrink-0`}
      >
        <Plus size={iconSize} /> Agregar
      </button>
    );
  };

  // Shared price display
  const PriceTag = ({ p, size = 'md' }: { p: Product; size?: 'sm' | 'md' | 'lg' }) => {
    const cls = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-lg' : 'text-sm';
    if (p.is_offer && p.offer_price) {
      return (
        <div>
          <span className={`text-red-400 font-black ${cls} block leading-none`}>{store.currency_symbol}{Number(p.offer_price).toFixed(2)}</span>
          <span className={`text-[10px] opacity-40 line-through`}>{store.currency_symbol}{Number(p.price).toFixed(2)}</span>
        </div>
      );
    }
    return <span className={`font-black ${cls} ${theme.accent}`} style={accentColor ? { color: accentColor } : undefined}>{store.currency_symbol}{Number(p.price).toFixed(2)}</span>;
  };

  const renderProductCard = (p: Product, layoutType: string) => {
    // Image with zoom-on-click
    const ProductImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
      <div className="relative cursor-zoom-in" onClick={() => setLightbox({ src, alt })}>
        <img src={src} alt={alt} className={className} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={20} className="text-white drop-shadow-lg" />
        </div>
      </div>
    );

    if (layoutType === 'lista') {
      return (
        <div key={p.id} className={`${theme.card} border ${theme.cardRadius} overflow-hidden shadow-md flex items-center gap-3 p-2.5 ${theme.cardHover} transition-all group`}>
          <div className="relative shrink-0">
            <ProductImage src={p.image} alt={p.name} className={`w-20 h-20 object-cover ${theme.cardRadius} group-hover:scale-105 transition-transform`} />
            {p.is_offer && <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">OFERTA</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs line-clamp-1">{p.name}</h3>
            <p className={`text-[10px] ${theme.subtext} line-clamp-1`}>{p.description}</p>
            <div className="flex items-center justify-between mt-1.5">
              <PriceTag p={p} size="sm" />
              <AddButton product={p} size="sm" />
            </div>
          </div>
        </div>
      );
    }

    if (layoutType === 'magazine') {
      return (
        <div key={p.id} className={`${theme.card} border ${theme.cardRadius} overflow-hidden shadow-lg flex flex-col ${theme.cardHover} transition-all group`}>
          <div className="relative">
            <ProductImage src={p.image} alt={p.name} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
            {p.is_offer && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><Tag size={11} /> OFERTA</span>}
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${theme.overlayBg} p-3 pt-8 pointer-events-none`}>
              <h3 className="font-black text-sm text-white line-clamp-1">{p.name}</h3>
              <p className="text-[10px] text-white/80 line-clamp-1">{p.description}</p>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <PriceTag p={p} size="lg" />
            <AddButton product={p} size="lg" />
          </div>
        </div>
      );
    }

    if (layoutType === 'compact') {
      return (
        <div key={p.id} className={`${theme.card} border ${theme.cardRadius} overflow-hidden shadow-sm flex flex-col ${theme.cardHover} transition-all group`}>
          <div className="relative">
            <ProductImage src={p.image} alt={p.name} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
            {p.is_offer && <span className="absolute top-1 left-1 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">OFERTA</span>}
          </div>
          <div className="p-2 flex-1 flex flex-col justify-between gap-1">
            <h3 className="font-bold text-[10px] line-clamp-1">{p.name}</h3>
            <PriceTag p={p} size="sm" />
            <AddButton product={p} size="sm" />
          </div>
        </div>
      );
    }

    if (layoutType === 'gallery') {
      return (
        <div key={p.id} className={`${theme.card} border ${theme.cardRadius} overflow-hidden shadow-lg flex flex-col ${theme.cardHover} transition-all group`}>
          <div className="relative">
            <ProductImage src={p.image} alt={p.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
            {p.is_offer && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><Tag size={11} /> OFERTA</span>}
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${theme.overlayBg} p-4 pt-12 pointer-events-none`}>
              <h3 className="font-black text-base text-white line-clamp-1">{p.name}</h3>
              <p className="text-[11px] text-white/80 line-clamp-2">{p.description}</p>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <PriceTag p={p} size="lg" />
            <AddButton product={p} size="lg" />
          </div>
        </div>
      );
    }

    // grid2 o grid3 — premium card style matching catalog mockup
    return (
      <div key={p.id} className={`${theme.card} border border-opacity-20 ${theme.cardRadius} overflow-hidden shadow-md flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl duration-300 group`}>
        <div className="relative aspect-square overflow-hidden bg-[#eff4ff]">
          <ProductImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {p.is_offer && <span className="absolute top-3 right-3 bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold">-{Math.round((1 - (p.offer_price || 0) / p.price) * 100)}%</span>}
          {p.is_new && <span className="absolute top-3 left-3 bg-[#3377bc] text-white px-2.5 py-1 rounded-lg text-xs font-bold">Nuevo</span>}
        </div>
        <div className="p-4 flex flex-col flex-grow gap-2">
          <span className={`text-xs ${theme.subtext}`}>{p.category}</span>
          <h3 className="font-bold text-sm line-clamp-1">{p.name}</h3>
          <div className="flex items-center gap-2 mb-1">
            <PriceTag p={p} size="md" />
          </div>
          <button onClick={() => addToCart(p)} className={`mt-auto w-full py-2.5 ${theme.primary} ${theme.cardRadius} text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all`}>
            <ShoppingCart size={15} /> Añadir al carrito
          </button>
        </div>
      </div>
    );
  };

  const gridClass = layout === 'grid3' ? 'grid-cols-3' : layout === 'magazine' || layout === 'gallery' || layout === 'lista' ? 'grid-cols-1' : layout === 'compact' ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {banners.length > 0 && (
        <div className={`relative ${theme.cardRadius} overflow-hidden shadow-xl border ${theme.borderSubtle} group`}>
          <img src={banners[0].image_url} alt="Banner" className="w-full h-36 sm:h-44 object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlayBg} via-transparent to-transparent flex items-end p-4`}>
            <div><span className={`${theme.primary} text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm`}>Destacado</span><p className="text-white font-bold text-xs mt-1">¡Pide en línea ahora!</p></div>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.subtext}`} />
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full pl-10 pr-9 py-2.5 ${theme.selectBg} border ${theme.cardRadius} text-xs outline-none focus:border-[#1E6FFF]`} />
          {search && <button onClick={() => setSearch('')} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${theme.subtext}`}><X size={14} /></button>}
        </div>
        <button onClick={() => setOnlyOffers(!onlyOffers)} className={`px-3 py-2.5 ${theme.cardRadius} border text-xs font-bold flex items-center gap-1.5 transition-all ${onlyOffers ? 'bg-red-500 text-white border-red-600 shadow-lg' : `${theme.card} ${theme.borderSubtle}`}`}><Tag size={14} /> Ofertas</button>
        <button onClick={() => setSortBy(prev => prev === 'default' ? 'low' : prev === 'low' ? 'high' : 'default')} className={`p-2.5 ${theme.cardRadius} border text-xs font-bold flex items-center gap-1 ${theme.card} ${theme.borderSubtle}`}><ArrowUpDown size={15} /></button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {catNames.map(cat => <button key={cat} onClick={() => { setSelectedCat(cat); setSelectedSub('Todos'); }} className={`px-4 py-2 ${theme.cardRadius} text-xs font-bold whitespace-nowrap transition-all ${selectedCat === cat ? theme.primary : theme.badge}`}>{cat}</button>)}
      </div>
      {selectedCat !== 'Todos' && subs.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 items-center">
          <span className={`text-[10px] ${theme.subtext} font-bold uppercase mr-1`}>Sub:</span>
          {subs.map(sub => <button key={sub} onClick={() => setSelectedSub(sub)} className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap border transition-all ${selectedSub === sub ? theme.accentBg : `${theme.borderSubtle} opacity-60`}`}>{sub}</button>)}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className={`text-center py-14 border border-dashed ${theme.borderSubtle} ${theme.cardRadius} p-6 opacity-60 space-y-2 ${theme.subtext}`}><ShoppingBag size={36} className="mx-auto" /><p className="text-xs font-medium">No se encontraron productos.</p></div>
      ) : (
        <div className={`grid ${gridClass} gap-3`}>
          {filtered.map(p => renderProductCard(p, layout))}
        </div>
      )}
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
  );
};

// ============ CONTENEDOR PRINCIPAL (compartido por admin y cliente) ============

interface StoreContainerProps {
  store: Store;
  products: Product[];
  categories: Category[];
  banners: Banner[];
  orders: Order[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onRefresh: () => void;
  onOrder: (order: Omit<Order, 'id' | 'store_id' | 'created_at'>) => void;
  onUpdateStore?: (updates: Partial<Store>) => Promise<void>;
  onUpgrade?: () => void;
  onSignOut?: () => void;
  onOpenQR?: () => void;
  onOpenStoreSwitcher?: () => void;
  storeCount?: number;
  isAdmin: boolean;
  onBackToAdmin?: () => void;
}

const StoreContainer: React.FC<StoreContainerProps> = ({
  store, products, categories, banners, orders, cart, setCart, activeTab, setActiveTab,
  onRefresh, onOrder, onUpdateStore, onUpgrade, onSignOut, onOpenQR, onOpenStoreSwitcher, storeCount, isAdmin, onBackToAdmin
}) => {
  const theme = THEMES[store.theme] || THEMES.corporateLight;
  const fontObj = AVAILABLE_FONTS.find(f => f.id === store.font) || AVAILABLE_FONTS[0];
  const customTextColor = store.custom_text_color || undefined;
  const accentColor = store.custom_accent_color || undefined;

  // Estilo del contenedor: si hay color de fondo personalizado, NO aplicar gradiente
  const containerStyle: React.CSSProperties = { fontFamily: fontObj.family, colorScheme: theme.isDark ? 'dark' : 'light' };
  if (store.custom_bg_color) {
    containerStyle.backgroundColor = store.custom_bg_color;
    containerStyle.background = store.custom_bg_color;
  }
  if (customTextColor) containerStyle.color = customTextColor;

  const containerClass = store.custom_bg_color
    ? `h-screen overflow-hidden ${customTextColor ? '' : theme.text} flex justify-center`
    : `h-screen overflow-hidden bg-gradient-to-br ${theme.gradientBg} ${customTextColor ? '' : theme.text} flex justify-center`;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, dbProductToCart(product)];
    });
  };

  const navBtnStyle = (isActive: boolean) => isActive && accentColor ? { color: accentColor } : undefined;

  return (
    <div className={containerClass} style={containerStyle}>
      <div className="w-full max-w-md h-full flex flex-col relative shadow-2xl">
        <header className={`sticky top-0 z-40 ${theme.nav} px-4 py-3 flex items-center justify-between border-b`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md shrink-0 bg-white/5 border border-white/10">
              <img src="/image copy.png" alt="Vendely Pro" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm leading-tight truncate" style={customTextColor ? { color: customTextColor } : undefined}>{store.name}</h1>
              <p className={`text-[10px] ${theme.subtext} truncate max-w-[120px]`}>{store.slogan}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onBackToAdmin && <button onClick={onBackToAdmin} className={`p-2 ${theme.sectionBg} ${theme.cardRadius} transition-colors`} title="Volver al panel"><ArrowLeft size={16} /></button>}
            {isAdmin && onOpenStoreSwitcher && (
              <button onClick={onOpenStoreSwitcher} className={`p-2 ${theme.sectionBg} ${theme.cardRadius} transition-colors flex items-center gap-1`} title="Mis catálogos">
                <Layers size={16} />
                {storeCount && storeCount > 1 && <span className="text-[9px] font-bold">{storeCount}</span>}
              </button>
            )}
            {isAdmin && onOpenQR && <button onClick={onOpenQR} className={`p-2 ${theme.sectionBg} ${theme.cardRadius} transition-colors`} title="Código QR"><QrCode size={16} /></button>}
            <button onClick={() => setActiveTab('cart')} className={`relative p-2 ${theme.sectionBg} ${theme.cardRadius} transition-colors`}>
              <ShoppingBag size={18} style={customTextColor ? { color: customTextColor } : undefined} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
            </button>
            {isAdmin && onSignOut && <button onClick={onSignOut} className={`p-2 ${theme.sectionBg} ${theme.cardRadius} hover:text-red-400 transition-colors`} title="Cerrar sesión"><LogOut size={16} /></button>}
          </div>
        </header>
        <main className="flex-1 p-4 pb-20 overflow-y-auto overscroll-contain">
          {activeTab === 'catalog' && <CatalogView products={products} store={store} theme={theme} banners={banners} addToCart={addToCart} />}
          {activeTab === 'cart' && <CartView cart={cart} store={store} theme={theme} onUpdateQty={(id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))} onRemove={id => setCart(prev => prev.filter(c => c.id !== id))} onClear={() => setCart([])} onBack={() => setActiveTab('catalog')} onOrder={onOrder} />}
          {isAdmin && activeTab === 'products' && <AdminProducts products={products} store={store} theme={theme} categories={categories} onRefresh={onRefresh} onUpgrade={onUpgrade || (() => {})} customTextColor={customTextColor} />}
          {isAdmin && activeTab === 'orders' && <OrdersView orders={orders} store={store} theme={theme} onRefresh={onRefresh} customTextColor={customTextColor} />}
          {isAdmin && activeTab === 'reports' && <ReportsView orders={orders} store={store} theme={theme} />}
          {isAdmin && activeTab === 'plans' && <PlansView currentPlan={store.plan} productCount={products.length} bannerCount={banners.length} theme={theme} onSelectPlan={async (plan) => { if (onUpdateStore) { try { await api.updatePlan(store.id, plan); await onUpdateStore({}); } catch { alert('Error al cambiar de plan'); } } }} />}
          {isAdmin && activeTab === 'settings' && onUpdateStore && <AdminSettings store={store} theme={theme} categories={categories} onUpdate={onUpdateStore} onUpgrade={onUpgrade || (() => {})} onOpenQR={onOpenQR || (() => {})} onRefresh={onRefresh} customTextColor={customTextColor} />}
        </main>
        <nav className={`fixed bottom-0 left-0 right-0 ${theme.nav} border-t px-2 py-2 z-40 backdrop-blur-xl rounded-t-2xl shadow-[0_-4px_12px_rgba(7,94,161,0.08)]`}>
          <div className={`max-w-md mx-auto grid ${isAdmin ? 'grid-cols-6' : 'grid-cols-2'} gap-0.5 text-center`}>
            <button onClick={() => setActiveTab('catalog')} className={`py-1.5 px-2 ${theme.cardRadius} flex flex-col items-center gap-0.5 transition-all active:scale-90 ${activeTab === 'catalog' ? `${theme.activeText} font-bold ${theme.accentBg}` : 'opacity-50'}`} style={navBtnStyle(activeTab === 'catalog')}><StoreIcon size={18} /><span className="text-[9px]">Catálogo</span></button>
            <button onClick={() => setActiveTab('cart')} className={`py-1.5 px-2 ${theme.cardRadius} flex flex-col items-center gap-0.5 transition-all relative active:scale-90 ${activeTab === 'cart' ? `${theme.activeText} font-bold ${theme.accentBg}` : 'opacity-50'}`} style={navBtnStyle(activeTab === 'cart')}><ShoppingBag size={18} /><span className="text-[9px]">Carrito</span>{cart.length > 0 && <span className="absolute top-0.5 right-3 bg-red-500 text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}</button>
            {isAdmin && <button onClick={() => setActiveTab('products')} className={`py-1.5 px-2 ${theme.cardRadius} flex flex-col items-center gap-0.5 transition-all active:scale-90 ${activeTab === 'products' ? `${theme.activeText} font-bold ${theme.accentBg}` : 'opacity-50'}`} style={navBtnStyle(activeTab === 'products')}><Package size={18} /><span className="text-[9px]">Productos</span></button>}
            {isAdmin && <button onClick={() => setActiveTab('orders')} className={`py-1.5 px-2 ${theme.cardRadius} flex flex-col items-center gap-0.5 transition-all relative active:scale-90 ${activeTab === 'orders' ? `${theme.activeText} font-bold ${theme.accentBg}` : 'opacity-50'}`} style={navBtnStyle(activeTab === 'orders')}><Clock size={18} /><span className="text-[9px]">Pedidos</span>{orders.filter(o => o.status === 'pending').length > 0 && <span className="absolute top-0.5 right-3 bg-red-500 text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{orders.filter(o => o.status === 'pending').length}</span>}</button>}
            {isAdmin && <button onClick={() => setActiveTab('reports')} className={`py-1.5 px-2 ${theme.cardRadius} flex flex-col items-center gap-0.5 transition-all active:scale-90 ${activeTab === 'reports' ? `${theme.activeText} font-bold ${theme.accentBg}` : 'opacity-50'}`} style={navBtnStyle(activeTab === 'reports')}><TrendingUp size={18} /><span className="text-[9px]">Reportes</span></button>}
            {isAdmin && <button onClick={() => setActiveTab('settings')} className={`py-1.5 px-2 ${theme.cardRadius} flex flex-col items-center gap-0.5 transition-all active:scale-90 ${activeTab === 'settings' ? `${theme.activeText} font-bold ${theme.accentBg}` : 'opacity-50'}`} style={navBtnStyle(activeTab === 'settings')}><Settings size={18} /><span className="text-[9px]">Ajustes</span></button>}
          </div>
        </nav>
      </div>
    </div>
  );
};

// ============ VISTA REPORTES ============

interface ReportsViewProps { orders: Order[]; store: Store; theme: ThemeDef; }

const ReportsView: React.FC<ReportsViewProps> = ({ orders, store, theme }) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const now = new Date();
  const filterByPeriod = (o: Order) => {
    const d = new Date(o.created_at);
    if (period === 'today') return d.toDateString() === now.toDateString();
    if (period === 'week') { const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7); return d >= weekAgo; }
    if (period === 'month') { const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1); return d >= monthAgo; }
    return true;
  };

  const filtered = orders.filter(filterByPeriod);
  const totalRevenue = filtered.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0);
  const pendingRevenue = filtered.filter(o => o.status === 'pending').reduce((s, o) => s + Number(o.total), 0);
  const deliveredCount = filtered.filter(o => o.status === 'delivered').length;
  const pendingCount = filtered.filter(o => o.status === 'pending').length;
  const avgTicket = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

  // Payment method breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  filtered.forEach(o => {
    const m = o.payment_method;
    if (!paymentBreakdown[m]) paymentBreakdown[m] = { count: 0, total: 0 };
    paymentBreakdown[m].count++;
    paymentBreakdown[m].total += Number(o.total);
  });

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  filtered.forEach(o => {
    o.items.forEach(item => {
      if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
      productSales[item.id].qty += item.quantity;
      productSales[item.id].revenue += item.price * item.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const exportReportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const periodLabel = period === 'today' ? 'Hoy' : period === 'week' ? 'Última semana' : period === 'month' ? 'Último mes' : 'Todos';
    win.document.write(`<!DOCTYPE html><html><head><title>Reporte - ${store.name}</title>
      <style>body{font-family:Inter,sans-serif;max-width:600px;margin:40px auto;padding:20px;color:#1a1a1a}
      h1{font-size:22px;margin:0}.sub{color:#666;font-size:12px;margin:4px 0 24px}
      .cards{display:flex;gap:12px;margin:16px 0}.card{flex:1;background:#f8f9fa;border-radius:12px;padding:16px;text-align:center}
      .card .v{font-size:22px;font-weight:900;color:#1E6FFF}.card .l{font-size:10px;color:#666;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
      th{text-align:left;padding:8px;border-bottom:2px solid #1E6FFF}td{padding:8px;border-bottom:1px solid #eee}
      .logo{font-size:24px;font-weight:900;color:#1E6FFF}</style></head>
      <body><div class="logo">${store.name}</div><h1>Reporte de ventas</h1>
      <div class="sub">Periodo: ${periodLabel} &bull; Generado: ${now.toLocaleString('es-ES')}</div>
      <div class="cards">
        <div class="card"><div class="v">${store.currency_symbol}${totalRevenue.toFixed(2)}</div><div class="l">Ingresos</div></div>
        <div class="card"><div class="v">${deliveredCount}</div><div class="l">Entregados</div></div>
        <div class="card"><div class="v">${pendingCount}</div><div class="l">Pendientes</div></div>
        <div class="card"><div class="v">${store.currency_symbol}${avgTicket.toFixed(2)}</div><div class="l">Ticket prom.</div></div>
      </div>
      <h3>Productos más vendidos</h3><table><thead><tr><th>Producto</th><th>Cant.</th><th style="text-align:right">Ingresos</th></tr></thead>
      <tbody>${topProducts.map(p => `<tr><td>${p.name}</td><td>${p.qty}</td><td style="text-align:right">${store.currency_symbol}${p.revenue.toFixed(2)}</td></tr>`).join('')}</tbody></table>
      <h3>Por método de pago</h3><table><thead><tr><th>Método</th><th>Pedidos</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${Object.entries(paymentBreakdown).map(([m, v]) => `<tr><td>${m.toUpperCase()}</td><td>${v.count}</td><td style="text-align:right">${store.currency_symbol}${v.total.toFixed(2)}</td></tr>`).join('')}</tbody></table>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className={`flex items-center justify-between border-b ${theme.borderSubtle} pb-3`}>
        <div><h2 className="text-lg font-bold">Reportes</h2><p className={`text-xs ${theme.subtext}`}>Análisis de tus ventas</p></div>
        <button onClick={exportReportPDF} className={`${theme.accentBg} px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5`}><FileText size={14} /> PDF</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['today', 'week', 'month', 'all'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${period === p ? theme.primary : `${theme.card} ${theme.borderSubtle} opacity-60`}`}>
            {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Todo'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex items-center gap-2 mb-1"><DollarSign size={14} className={theme.accent} /><span className={`text-[10px] font-bold ${theme.subtext} uppercase`}>Ingresos</span></div>
          <p className={`text-2xl font-black ${theme.accent}`}>{store.currency_symbol}{totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] opacity-50">Solo pedidos entregados</p>
        </div>
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className={theme.accent} /><span className={`text-[10px] font-bold ${theme.subtext} uppercase`}>Ticket prom.</span></div>
          <p className="text-2xl font-black">{store.currency_symbol}{avgTicket.toFixed(2)}</p>
          <p className="text-[10px] opacity-50">Por pedido entregado</p>
        </div>
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex items-center gap-2 mb-1"><ShoppingCart size={14} className={theme.accent} /><span className={`text-[10px] font-bold ${theme.subtext} uppercase`}>Entregados</span></div>
          <p className="text-2xl font-black">{deliveredCount}</p>
          <p className="text-[10px] opacity-50">{filtered.length} pedidos total</p>
        </div>
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md`}>
          <div className="flex items-center gap-2 mb-1"><Clock size={14} className={theme.accent} /><span className={`text-[10px] font-bold ${theme.subtext} uppercase`}>Pendientes</span></div>
          <p className="text-2xl font-black">{pendingCount}</p>
          <p className="text-[10px] opacity-50">{store.currency_symbol}{pendingRevenue.toFixed(2)} en espera</p>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md space-y-3`}>
          <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>Top productos</p>
          {topProducts.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full ${theme.accentBg} flex items-center justify-center text-[9px] font-black`}>{i + 1}</span><span className="font-bold line-clamp-1">{p.name}</span></div>
              <div className="text-right shrink-0 ml-2"><span className="font-bold">{p.qty} vend.</span><span className={`text-[10px] ${theme.subtext} block`}>{store.currency_symbol}{p.revenue.toFixed(2)}</span></div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(paymentBreakdown).length > 0 && (
        <div className={`${theme.card} p-4 ${theme.cardRadius} border shadow-md space-y-3`}>
          <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>Por método de pago</p>
          {Object.entries(paymentBreakdown).map(([m, v]) => (
            <div key={m} className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase">{m}</span>
              <span>{v.count} pedidos &bull; <strong>{store.currency_symbol}{v.total.toFixed(2)}</strong></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ VISTA TIENDA CLIENTE (Pública, sin auth) ============

interface ClientStoreViewProps { storeId: string; }

const ClientStoreView: React.FC<ClientStoreViewProps> = ({ storeId }) => {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart'>('catalog');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const s = await api.fetchStoreById(storeId);
      if (!s) { setError('Tienda no encontrada'); setLoading(false); return; }
      setStore(s);
      const [p, b, c] = await Promise.all([api.fetchProducts(storeId), api.fetchBanners(storeId), api.fetchCategories(storeId)]);
      setProducts(p); setBanners(b); setCategories(c);
    } catch { setError('Error al cargar la tienda'); }
    setLoading(false);
  }, [storeId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOrder = async (order: Omit<Order, 'id' | 'store_id' | 'created_at'>) => {
    try { await api.createOrder(storeId, order); setCart([]); setActiveTab('catalog'); } catch { alert('Error al realizar el pedido'); }
  };

  const backToAdmin = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('store');
    window.location.href = url.toString();
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#1E6FFF]" /></div>;
  if (error || !store) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400"><AlertCircle size={40} /><p className="text-sm">{error || 'Tienda no disponible'}</p>{user && <button onClick={backToAdmin} className="mt-2 px-4 py-2 bg-[#1E6FFF] text-white rounded-xl text-xs font-bold">Volver al panel</button>}</div>;

  return <StoreContainer store={store} products={products} categories={categories} banners={banners} orders={[]} cart={cart} setCart={setCart} activeTab={activeTab} setActiveTab={setActiveTab} onRefresh={loadData} onOrder={handleOrder} isAdmin={false} onBackToAdmin={user ? backToAdmin : undefined} />;
};

// ============ APP ADMIN (comerciante autenticado) ============

const AdminApp: React.FC = () => {
  const { store, stores, signOut, refreshStore, setStoreLocal, switchStore, createStore, deleteStore } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'products' | 'orders' | 'reports' | 'plans' | 'settings'>('catalog');
  const [showQR, setShowQR] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [creatingStore, setCreatingStore] = useState(false);

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

  const handleUpdateStore = async (updates: Partial<Store>) => {
    setStoreLocal(updates);
    try { await api.updateStore(store.id, updates); } catch { alert('Error al guardar'); await refreshStore(); }
  };
  const handleOrder = async (order: Omit<Order, 'id' | 'store_id' | 'created_at'>) => {
    try { await api.createOrder(store.id, order); setCart([]); setActiveTab('catalog'); refreshAll(); } catch { alert('Error al realizar el pedido'); }
  };

  const planLimits = PLAN_LIMITS[store.plan] || PLAN_LIMITS.free;
  const canCreateMore = stores.length < planLimits.maxCatalogs;

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) return;
    setCreatingStore(true);
    const { error } = await createStore(newStoreName.trim());
    setCreatingStore(false);
    if (error) { alert(error); return; }
    setNewStoreName('');
    setShowStoreSwitcher(false);
    setActiveTab('catalog');
  };

  const handleDeleteStore = async (storeId: string) => {
    if (stores.length <= 1) { alert('Debes tener al menos un catálogo'); return; }
    if (!confirm('¿Eliminar este catálogo y todos sus productos? Esta acción no se puede deshacer.')) return;
    const { error } = await deleteStore(storeId);
    if (error) { alert(error); return; }
    setShowStoreSwitcher(false);
  };

  if (loadingData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#1E6FFF]" /></div>;

  return (
    <>
      <StoreContainer store={store} products={products} categories={categories} banners={banners} orders={orders} cart={cart} setCart={setCart} activeTab={activeTab} setActiveTab={setActiveTab} onRefresh={refreshAll} onOrder={handleOrder} onUpdateStore={handleUpdateStore} onUpgrade={() => setActiveTab('plans')} onSignOut={signOut} onOpenQR={() => setShowQR(true)} isAdmin={true} onOpenStoreSwitcher={() => setShowStoreSwitcher(true)} storeCount={stores.length} />
      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} storeId={store.id} storeName={store.name} theme={THEMES[store.theme] || THEMES.corporateLight} />
      {showStoreSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowStoreSwitcher(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-[90%] max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Layers size={18} className="text-[#3B82F6]" /> Mis catálogos ({stores.length}/{planLimits.maxCatalogs === Infinity ? '∞' : planLimits.maxCatalogs})</h3>
              <button onClick={() => setShowStoreSwitcher(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stores.map(s => (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border ${s.id === store.id ? 'border-[#1E6FFF] bg-[#1E6FFF]/10' : 'border-slate-700 bg-slate-800/50'}`}>
                  <button onClick={() => { switchStore(s.id); setShowStoreSwitcher(false); setActiveTab('catalog'); }} className="flex items-center gap-2 flex-1 text-left">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-[#1E6FFF] shrink-0">
                      {s.logo ? <img src={s.logo} alt={s.name} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-xs">{s.name.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.rubro || 'Sin rubro'}</p>
                    </div>
                  </button>
                  {s.id === store.id && <span className="text-[10px] text-[#5B9BFF] font-bold">Activo</span>}
                  {stores.length > 1 && s.id !== store.id && (
                    <button onClick={() => handleDeleteStore(s.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            {canCreateMore ? (
              <div className="space-y-2 pt-3 border-t border-slate-700">
                <div className="flex gap-2">
                  <input type="text" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} placeholder="Nombre del nuevo catálogo..." className="flex-1 bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#1E6FFF]" />
                  <button onClick={handleCreateStore} disabled={creatingStore || !newStoreName.trim()} className="px-4 py-2.5 bg-[#1E6FFF] hover:bg-[#1060DD] disabled:opacity-50 rounded-xl text-xs font-bold text-white flex items-center gap-1.5">
                    {creatingStore ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />} Crear
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-700">
                <p className="text-[11px] text-amber-400 text-center">Has alcanzado el límite de catálogos de tu plan. Mejora tu plan para crear más.</p>
                <button onClick={() => { setShowStoreSwitcher(false); setActiveTab('plans'); }} className="w-full mt-2 py-2.5 bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold">Ver planes</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// ============ ONBOARDING (3 pasos de bienvenida) ============

const ONBOARDING_STEPS = [
  {
    icon: MessageCircle,
    badge: 'VENTAS DIRECTAS',
    title: 'Vende por WhatsApp en segundos',
    desc: 'Convierte tus chats en ventas reales. Tus clientes compran y tú recibes el pedido listo en tu WhatsApp.',
    accent: 'from-[#1E6FFF] to-[#0052CC]',
  },
  {
    icon: BookOpen,
    badge: 'CONSTRUCCIÓN DE MARCA',
    title: 'Tu catálogo, con look profesional',
    desc: 'Crea una vitrina digital elegante para tus productos. Organiza por categorías y destaca tus mejores ofertas con un toque sofisticado.',
    accent: 'from-[#3B82F6] to-[#1E6FFF]',
  },
  {
    icon: TrendingUp,
    badge: 'GESTIÓN PRO',
    title: 'Control total de tu negocio',
    desc: 'Analiza tus ventas, gestiona tu inventario y haz crecer tu marca con herramientas diseñadas para comerciantes profesionales.',
    accent: 'from-[#0052CC] to-[#1E6FFF]',
  },
];

const OnboardingScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const Icon = current.icon;
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1D33] to-[#0A1628] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1E6FFF]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0052CC]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white/5 ring-2 ring-[#1E6FFF]/20">
              <img src="/ChatGPT_Image_30_jul_2026,_12_24_41_p.m. copy copy.png" alt="Vendely Pro" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="text-lg font-black text-white">VendelyPro</span>
          </div>
          <button onClick={onDone} className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors">Saltar</button>
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`relative w-40 h-40 rounded-3xl bg-gradient-to-br ${current.accent} flex items-center justify-center shadow-2xl animate-in zoom-in-95 duration-500`}>
            <Icon size={64} className="text-white" />
            <div className="absolute -bottom-3 -right-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white">Activo</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#1E6FFF]/15 text-[#5B9BFF] text-[10px] font-bold uppercase tracking-wider">{current.badge}</span>
            <h1 className="text-2xl font-black text-white tracking-tight">{current.title}</h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{current.desc}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-center gap-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#1E6FFF]' : 'w-2 bg-slate-700'}`} />
            ))}
          </div>

          <button onClick={() => isLast ? onDone() : setStep(s => s + 1)}
            className="w-full bg-gradient-to-r from-[#1E6FFF] to-[#0052CC] hover:from-[#2E7FFF] hover:to-[#1060DD] text-white py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-[#1E6FFF]/30 transition-all active:scale-95">
            {isLast ? 'Comenzar ahora' : 'Siguiente'}
            <ChevronRight size={18} className={isLast ? 'hidden' : ''} />
          </button>
          <p className="text-center text-[10px] text-slate-500">{step + 1} de {ONBOARDING_STEPS.length}</p>
        </div>
      </div>
    </div>
  );
};

// ============ EXPORT PRINCIPAL ============

const VendelyProVendeDirectoPorWhatsApp: React.FC = () => {
  const { user, store, loading } = useAuth();

  const [publicStoreId, setPublicStoreId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeId = params.get('store');
    if (storeId) setPublicStoreId(storeId);
  }, []);

  useEffect(() => {
    if (user && store && !localStorage.getItem('vendely_onboarding_done')) {
      setShowOnboarding(true);
    }
  }, [user, store]);

  if (publicStoreId) return <ClientStoreView storeId={publicStoreId} />;
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#1E6FFF]" /></div>;
  if (!user || !store) return <AuthScreen />;
  if (showOnboarding) return <OnboardingScreen onDone={() => { localStorage.setItem('vendely_onboarding_done', '1'); setShowOnboarding(false); }} />;
  return <AdminApp />;
};

export default VendelyProVendeDirectoPorWhatsApp;
