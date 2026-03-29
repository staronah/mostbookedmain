import React, { createContext, useContext, useState, useEffect } from 'react';
import { MerchItem } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface CartItem extends MerchItem {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MerchItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  validateCart: () => Promise<string[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('mostbooked_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [userId, setUserId] = useState<string | null>(null);
  const prevUserRef = React.useRef<string | null>(null);

  // Handle Auth State and Initial Firestore Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        prevUserRef.current = user.uid;
        try {
          const cartDoc = await getDoc(doc(db, 'public', user.uid, 'cart', 'items'));
          if (cartDoc.exists()) {
            const firestoreItems = cartDoc.data().items as CartItem[];
            
            // Merge logic: If local cart has items, we might want to merge or just take Firestore
            // For simplicity, if Firestore has items, we'll use them, but if local has items and Firestore is empty, we'll push local.
            setCartItems(prevLocal => {
              if (firestoreItems && firestoreItems.length > 0) {
                return firestoreItems;
              }
              return prevLocal;
            });
          } else if (cartItems.length > 0) {
            // Push local cart to Firestore if Firestore is empty
            await setDoc(doc(db, 'public', user.uid, 'cart', 'items'), {
              items: cartItems,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error syncing cart from Firestore:", error);
        }
      } else {
        // If we were previously logged in and now we're not, it's a logout
        if (prevUserRef.current) {
          setCartItems([]);
          localStorage.removeItem('mostbooked_cart');
        }
        setUserId(null);
        prevUserRef.current = null;
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to LocalStorage and Firestore on changes
  useEffect(() => {
    localStorage.setItem('mostbooked_cart', JSON.stringify(cartItems));
    
    const syncToFirestore = async () => {
      if (userId) {
        try {
          await setDoc(doc(db, 'public', userId, 'cart', 'items'), {
            items: cartItems,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error syncing cart to Firestore:", error);
        }
      }
    };

    syncToFirestore();
  }, [cartItems, userId]);

  const addToCart = (item: MerchItem, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      const maxQty = typeof item.maxQuantity === 'number' ? item.maxQuantity : Infinity;
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const finalQuantity = Math.min(newQuantity, maxQty);
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: finalQuantity } : i
        );
      }
      const finalQuantity = Math.min(quantity, maxQty);
      return [...prev, { ...item, quantity: finalQuantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const maxQty = typeof item.maxQuantity === 'number' ? item.maxQuantity : Infinity;
          const finalQuantity = Math.min(quantity, maxQty);
          return { ...item, quantity: finalQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const validateCart = async () => {
    if (cartItems.length === 0) return [];
    
    const validatedItems: CartItem[] = [];
    let changed = false;
    const notifications: string[] = [];

    for (const item of cartItems) {
      try {
        const itemDoc = await getDoc(doc(db, 'sites', 'mostbooked', 'merch', item.id));
        if (!itemDoc.exists()) {
          changed = true;
          notifications.push(`${item.label} is no longer available and has been removed from your cart.`);
          continue;
        }

        const latestData = itemDoc.data() as MerchItem;
        
        if (latestData.outOfStock) {
          changed = true;
          notifications.push(`${item.label} is now out of stock and has been removed from your cart.`);
          continue;
        }

        let updatedItem = { ...item, ...latestData };

        if (latestData.amount !== item.amount) {
          changed = true;
          notifications.push(`The price of ${item.label} has changed from ₦${item.amount.toLocaleString()} to ₦${latestData.amount.toLocaleString()}.`);
        }

        if (typeof latestData.maxQuantity === 'number' && item.quantity > latestData.maxQuantity) {
          changed = true;
          updatedItem.quantity = latestData.maxQuantity;
          notifications.push(`The available quantity for ${item.label} has decreased. Your cart has been updated to the maximum available (${latestData.maxQuantity}).`);
        }

        validatedItems.push(updatedItem);
      } catch (error) {
        console.error(`Error validating item ${item.id}:`, error);
        validatedItems.push(item);
      }
    }

    if (changed) {
      setCartItems(validatedItems);
    }
    return notifications;
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.amount * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      validateCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
