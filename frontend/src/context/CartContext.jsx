import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kaira_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('kaira_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('kaira_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('kaira_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const addToCart = (webinar) => {
    if (!webinar) return;
    const exists = cart.some(item => (item.id || item.slug) === (webinar.id || webinar.slug));
    if (!exists) {
      setCart(prev => [...prev, webinar]);
      showToast(`Added "${webinar.title}" to cart`);
    } else {
      showToast(`"${webinar.title}" is already in your cart`);
    }
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => (item.id || item.slug) !== id));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (id) => {
    return cart.some(item => (item.id || item.slug) === id);
  };

  // Wishlist operations
  const toggleWishlist = (webinar) => {
    if (!webinar) return;
    const id = webinar.id || webinar.slug;
    const exists = wishlist.some(item => (item.id || item.slug) === id);
    if (exists) {
      setWishlist(prev => prev.filter(item => (item.id || item.slug) !== id));
      showToast(`Removed from wishlist`);
    } else {
      setWishlist(prev => [...prev, webinar]);
      showToast(`Saved "${webinar.title}" to wishlist ❤️`);
    }
  };

  const isInWishlist = (id) => {
    return wishlist.some(item => (item.id || item.slug) === id);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartCount: cart.length,
        wishlistCount: wishlist.length,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        toggleWishlist,
        isInWishlist,
        totalAmount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isWishlistDrawerOpen,
        setIsWishlistDrawerOpen,
        toastMessage
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1D1F] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#A435F0]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
