import { AuthProvider } from '@/lib/auth-context';
import VendelyApp from '@/components/vendely_pro_vende_directo_por_whatsapp';

export default function App() {
  return (
    <AuthProvider>
      <VendelyApp />
    </AuthProvider>
  );
}
