import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Store } from './types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  store: Store | null;
  stores: Store[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, storeName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshStore: () => Promise<void>;
  setStoreLocal: (updates: Partial<Store>) => void;
  switchStore: (storeId: string) => void;
  createStore: (name: string) => Promise<{ error: string | null }>;
  deleteStore: (storeId: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStores = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });
    if (error) { console.error('Error loading stores:', error); setStore(null); setStores([]); return; }
    const list = (data || []) as Store[];
    setStores(list);
    const savedId = localStorage.getItem('vendely_active_store');
    const active = list.find(s => s.id === savedId) || list[0] || null;
    setStore(active);
    if (active) localStorage.setItem('vendely_active_store', active.id);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadStores(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadStores(newSession.user.id);
        } else {
          setStore(null);
          setStores([]);
        }
        setLoading(false);
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, [loadStores]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, storeName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { store_name: storeName },
      },
    });
    if (error) return { error: error.message };

    if (data.user) {
      const { error: storeError } = await supabase.from('stores').insert({
        owner_id: data.user.id,
        name: storeName,
        slogan: 'Tu tienda, directa por WhatsApp',
        currency_symbol: '$',
        country: 'US',
        theme: 'proDark',
        font: 'Inter',
        plan: 'free',
        payments: {
          acceptsCash: true,
          acceptsYape: true,
          acceptsBankTransfer: true,
          acceptsCard: false,
        },
      });
      if (storeError) return { error: storeError.message };
      await loadStores(data.user.id);
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setStore(null);
    setStores([]);
    localStorage.removeItem('vendely_active_store');
  };

  const refreshStore = async () => {
    if (user) await loadStores(user.id);
  };

  const setStoreLocal = useCallback((updates: Partial<Store>) => {
    setStore(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setStores(list => list.map(s => s.id === updated.id ? updated : s));
      return updated;
    });
  }, []);

  const switchStore = useCallback((storeId: string) => {
    const found = stores.find(s => s.id === storeId);
    if (found) {
      setStore(found);
      localStorage.setItem('vendely_active_store', storeId);
    }
  }, [stores]);

  const createStore = async (name: string) => {
    if (!user) return { error: 'No autenticado' };
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({ owner_id: user.id, name })
        .select()
        .single();
      if (error) return { error: error.message };
      await loadStores(user.id);
      if (data) switchStore(data.id);
      return { error: null };
    } catch (e) {
      return { error: (e as Error).message };
    }
  };

  const deleteStore = async (storeId: string) => {
    if (!user) return { error: 'No autenticado' };
    try {
      const { error } = await supabase.from('stores').delete().eq('id', storeId);
      if (error) return { error: error.message };
      await loadStores(user.id);
      return { error: null };
    } catch (e) {
      return { error: (e as Error).message };
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, store, stores, loading, signIn, signUp, signInWithGoogle, resetPassword, signOut, refreshStore, setStoreLocal, switchStore, createStore, deleteStore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
