import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStoreConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils/priceFormatter';
import { pickProductImage } from '../lib/utils/imageUrl';
import { toast } from '../lib/utils/toast';
import ImageWithFallback from './ImageWithFallback';
import type { Product } from '../types';

export function ShopProductCard({ product }: { product: Product }) {
  const cfg = useStoreConfig();
  const { add } = useCart();
  const [adding, setAdding] = useState(false);
  const ui = cfg.ui;
  const img = pickProductImage(product, 'medium');
  const price = formatPrice(product.price);
  const outOfStock = product.stock === 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || adding) return;
    setAdding(true);
    try {
      await add(product.id, 1);
      toast('به سبد اضافه شد', 'success', 2000);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setTimeout(() => setAdding(false), 1200);
    }
  };

  return (
    <Link to={`/product?id=${product.id}`} className={`group block iris-card ${ui.cardBase} ${ui.cardRadius} ${ui.cardHover}`}>
      <div className={`relative ${ui.productCardAspect} overflow-hidden bg-surface`}>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-sm text-white/80 font-medium">ناموجود</span>
          </div>
        )}
        <ImageWithFallback
          src={img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="product-card__gradient absolute inset-x-0 bottom-0 z-[5] pt-14 pb-3 px-3 md:px-4 pointer-events-none">
          <div className="pointer-events-auto">
            {product.category_name && (
              <p className="text-[10px] text-white/65 mb-1 tracking-wide uppercase">{product.category_name}</p>
            )}
            <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 leading-snug">{product.name}</h3>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white">{price}</span>
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock || adding}
                className={`add-to-cart-quick btn btn-aluminum btn-icon shrink-0 !shadow-none ${adding ? 'is-success' : ''}`}
                title="افزودن به سبد"
                aria-label="افزودن به سبد"
              >
                <span className="btn-inner">{adding ? '✓' : '+'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ShopProductCard;
