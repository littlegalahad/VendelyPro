import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Store } from './types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  store: Store | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, storeName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshStore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStore = useCallback(async (userId: string) => {
    // Primero intenta como dueño
    let { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();
    if (data) { setStore(data as Store); return; }
    // Si no es dueño, busca como miembro staff
    const { data: member } = await supabase
      .from('store_members')
      .select('store_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (member) {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('id', member.store_id)
        .maybeSingle();
      if (storeData) { setStore(storeData as Store); return; }
    }
    if (error) console.error('Error loading store:', error);
    setStore(null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadStore(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadStore(newSession.user.id);
        } else {
          setStore(null);
        }
        setLoading(false);
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, [loadStore]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, storeName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const { error: storeError } = await supabase.from('stores').insert({
        owner_id: data.user.id,
        name: storeName,
        slogan: 'Your store, direct to WhatsApp',
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
      await loadStore(data.user.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setStore(null);
  };

  const refreshStore = async () => {
    if (user) await loadStore(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, store, loading, signIn, signUp, signOut, refreshStore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
