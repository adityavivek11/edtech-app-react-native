import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitialized(true);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        session,
        initialized,
    };
} 