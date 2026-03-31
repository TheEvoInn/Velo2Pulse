import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { storeAuth, clearAuth, getStoredAuth, MOCK_USER } from '@/lib/mockData';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';

function mapUser(su: SupabaseUser): User {
  return {
    id: su.id,
    email: su.email ?? '',
    name: su.user_metadata?.username || su.user_metadata?.full_name || su.email?.split('@')[0] || 'Commander',
    role: 'owner',
    inviteCode: su.user_metadata?.invite_code || 'VELO-2026',
    createdAt: su.created_at,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getStoredAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          const u = mapUser(session.user);
          setUser(u);
          storeAuth(u);
        } else {
          // Fall back to localStorage mock user for offline/demo mode
          const stored = getStoredAuth();
          if (stored) setUser(stored);
        }
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const u = mapUser(session.user);
        setUser(u);
        storeAuth(u);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        clearAuth();
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const u = mapUser(session.user);
        setUser(u);
        storeAuth(u);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback((u: User) => {
    setUser(u);
    storeAuth(u);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    clearAuth();
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
