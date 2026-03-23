'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function PurchaseButton({ productId, priceFormatted }: { productId: string; priceFormatted: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handlePurchase() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/product/${productId}`);
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handlePurchase} loading={loading} size="lg" className="w-full">
      <ShoppingCart className="h-5 w-5" />
      Buy Now — {priceFormatted}
    </Button>
  );
}
