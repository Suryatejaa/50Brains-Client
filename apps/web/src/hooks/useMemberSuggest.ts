import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface MemberSuggestItem {
    id: string;
    username?: string;
    email?: string;
    displayName?: string;
}

export function useMemberSuggest(clanId?: string) {
    const [q, setQ] = useState('');
    const [items, setItems] = useState<MemberSuggestItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const reqIdRef = useRef(0);

    useEffect(() => {
        if (!clanId || q.length === 0) {
            setItems([]);
            return;
        }
        const t = setTimeout(async () => {
            const myReq = ++reqIdRef.current;
            setLoading(true);
            setError(null);
            try {
                const resp = await apiClient.get(`/api/members/${clanId}/member-suggest?query=${encodeURIComponent(q)}&limit=10`);
                if (myReq !== reqIdRef.current) return;
                setItems((resp as any)?.data || []);
            } catch (e: any) {
                if (myReq !== reqIdRef.current) return;
                setError(e?.message || 'Suggest failed');
            } finally {
                if (myReq === reqIdRef.current) setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [clanId, q]);

    return { q, setQ, items, loading, error };
}
