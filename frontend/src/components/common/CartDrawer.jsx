import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Heart
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartDrawer() {
  const { 
    cart, 
    wishlist, 
    removeFromCart, 
    toggleWishlist, 
    totalAmount, 
    isCartDrawerOpen, 
    setIsCartDrawerOpen,
    isWishlistDrawerOpen,
    setIsWishlistDrawerOpen
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isCartDrawerOpen && !isWishlistDrawerOpen) return null;

  const isCart = isCartDrawerOpen;
  const items = isCart ? cart : wishlist;
  const title = isCart ? 'Your Webinar Pass Cart' : 'Your Saved Wishlist';
  const close = () => {
    setIsCartDrawerOpen(false);
    setIsWishlistDrawerOpen(false);
  };

  const handleCheckout = () => {
    close();
    if (!user) {
      navigate('/login?redirect=/webinars');
      return;
    }
    if (cart.length > 0) {
      navigate(`/webinars/${cart[0].slug || cart[0].id}?register=true`);
    } else {
      navigate('/webinars');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="flex-1" onClick={close} />

      {/* Slide-over panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#F1D3DE] animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#F1D3DE] flex items-center justify-between bg-[#FAF5F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#970747] text-white flex items-center justify-center shadow-xs">
              {isCart ? <ShoppingCart className="w-4.5 h-4.5" /> : <Heart className="w-4.5 h-4.5 fill-current" />}
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-[#1C1D1F] leading-tight">
                {title}
              </h3>
              <span className="text-[11px] text-[#52525B]">
                {items.length} {items.length === 1 ? 'workshop pass' : 'workshop passes'}
              </span>
            </div>
          </div>

          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F1D3DE] text-[#52525B] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body - Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF5F7] text-[#970747] flex items-center justify-center mx-auto">
                {isCart ? <ShoppingCart className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
              </div>
              <h4 className="font-bold text-[#1C1D1F] text-base">
                {isCart ? 'Your cart is empty' : 'No items saved in wishlist'}
              </h4>
              <p className="text-xs text-[#52525B] max-w-xs mx-auto">
                Explore our upcoming live masterclasses and reserve your verified passes.
              </p>
              <button
                onClick={() => {
                  close();
                  navigate('/webinars');
                }}
                className="btn-primary text-xs py-2.5 px-5 mt-2"
              >
                Browse Masterclasses
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id || item.slug}
                className="p-3.5 rounded-2xl border border-[#F1D3DE] bg-[#FAF5F7]/50 hover:bg-white hover:border-[#970747] transition-all flex gap-3.5 group"
              >
                <img
                  src={item.posterImage || item.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80'}
                  alt={item.title}
                  className="w-20 h-16 object-cover rounded-xl shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#970747] block truncate">
                      {item.category || 'Live Masterclass'}
                    </span>
                    <h5 className="font-bold text-xs text-[#1C1D1F] line-clamp-1 group-hover:text-[#970747] transition-colors">
                      {item.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-[#52525B] mt-0.5">
                      <Calendar className="w-3 h-3 text-[#970747]" />
                      <span className="truncate">{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-[#F1D3DE]/40">
                    <span className="text-xs font-black text-[#970747]">
                      {item.price === 0 ? 'FREE PASS' : `₹${item.price}.00`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCart ? (
                        <button
                          onClick={() => removeFromCart(item.id || item.slug)}
                          className="text-xs text-[#71717A] hover:text-red-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="text-xs text-red-600 hover:text-red-700 p-1 transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#F1D3DE] bg-[#FAF5F7] space-y-3">
            {isCart && (
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#52525B]">Total Pass Amount:</span>
                <span className="font-heading font-black text-2xl text-[#970747]">
                  {totalAmount === 0 ? 'FREE' : `₹${totalAmount}.00`}
                </span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>{isCart ? 'Proceed to Register Passes' : 'Enroll in Saved Passes'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-center text-[#71717A] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Instant verified email pass & calendar invite</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
