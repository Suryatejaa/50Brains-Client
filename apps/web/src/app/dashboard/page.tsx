// app/dashboard/page.tsx - Server Component Dashboard Page
import { cookies } from 'next/headers';
import { DashboardRouter } from '@/components/dashboard/DashboardRouter';

export default async function DashboardPage() {
  // Server-side auth check using cookies (but don't redirect here to avoid conflicts)
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  console.log('🏠 [Dashboard Server] Auth tokens present:', { 
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken 
  });

  // Let the client-side RouteGuard handle authentication redirects
  // This prevents server/client conflicts and allows proper auth state management
  return <DashboardRouter />;
}
