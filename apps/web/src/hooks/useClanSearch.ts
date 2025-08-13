import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ClanSearchItem {
    id: string;
    name: string;
    slug: string;
}

export function useClanSearch() {
    const [q, setQ] = useState('');
    const [items, setItems] = useState<ClanSearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const reqIdRef = useRef(0);

    useEffect(() => {
        if (!q) {
            setItems([]);
            return;
        }
        const t = setTimeout(async () => {
            const myReq = ++reqIdRef.current;
            setLoading(true);
            setError(null);
            try {
                const resp = await apiClient.get(`/api/clan/public/search?search=${encodeURIComponent(q)}`);
                // Drop if a newer request started
                if (myReq !== reqIdRef.current) return;
                const list = (resp as any)?.data?.clans || (resp as any)?.data || [];
                setItems(list);
            } catch (e: any) {
                if (myReq !== reqIdRef.current) return;
                setError(e?.message || 'Search failed');
            } finally {
                if (myReq === reqIdRef.current) setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [q]);

    return { q, setQ, items, loading, error };
}
