import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, AlertCircle, X, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import { initiatePaystackPayment } from '../lib/payment';
import { auth, db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DeliveryCountry, DeliveryState } from '../types';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart, validateCart } = useCart();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [countries, setCountries] = useState<DeliveryCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const initCart = async () => {
      setIsValidating(true);
      const notes = await validateCart();
      setNotifications(notes);
      setIsValidating(false);
    };

    initCart();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesRef = collection(db, 'sites', 'mostbooked', 'delivery_countries');
        const snapshot = await getDocs(countriesRef);
        const countriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DeliveryCountry[];
        setCountries(countriesList);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const currentCountry = countries.find(c => c.id === selectedCountry);
  const currentState = currentCountry?.states.find(s => s.id === selectedState);
  const shippingCost = currentState?.price || 0;
  const finalTotal = cartTotal + shippingCost;

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedCountry || !selectedState || !address) {
      alert("Please fill in your delivery details.");
      return;
    }

    const cartId = `cart_${Date.now()}`;
    const productIds = cartItems.map(item => `${item.id}(${item.quantity})`).join(', ');
    const description = `IDs: [${productIds}] | Country: ${currentCountry?.name} | State: ${currentState?.name} | Location: ${address}`;
    
    initiatePaystackPayment(
      finalTotal,
      user?.email || 'guest@example.com',
      cartId,
      user?.uid || 'guest',
      user?.displayName || 'Guest Customer',
      description,
      'merch',
      cartId,
      productIds
    );

    // Clear the cart immediately after initiating the checkout process
    clearCart();
  };

  return (
    <main className="pt-32 min-h-screen bg-primary pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <h1 className="text-ui font-hero text-5xl md:text-7xl mb-4">YOUR CART</h1>
            <p className="text-ui/60 font-body text-lg">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link 
            to="/order-history"
            className="flex items-center gap-2 px-6 py-3 bg-secondary/50 border border-white/5 rounded-xl text-accent font-heading text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-all group w-fit"
          >
            <Clock size={16} className="group-hover:rotate-[-45deg] transition-transform" />
            <span>Order History</span>
          </Link>
        </motion.div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 space-y-2"
          >
            {notifications.map((note, i) => (
              <div key={i} className="bg-accent/10 border border-accent/20 p-4 rounded-xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-accent shrink-0 mt-0.5" size={18} />
                  <p className="text-ui/80 text-sm font-body">{note}</p>
                </div>
                <button 
                  onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-ui/40 hover:text-ui transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {isValidating ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto text-accent animate-spin mb-4" size={48} />
            <p className="text-ui/60 font-heading uppercase tracking-widest text-sm">Validating items...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20 bg-secondary/30 rounded-2xl border border-white/5"
          >
            <ShoppingBag className="mx-auto text-ui/20 mb-6" size={64} />
            <h2 className="text-2xl font-heading text-ui mb-4">Your cart is empty</h2>
            <p className="text-ui/60 font-body mb-8 max-w-md mx-auto">
              Looks like you haven't added any merch to your cart yet.
            </p>
            <Link to="/merch">
              <PrimaryButton>Shop Merch</PrimaryButton>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row gap-6 bg-secondary/50 p-6 rounded-2xl border border-white/5"
                  >
                    <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-primary shrink-0">
                      <img 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'} 
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-heading text-ui mb-1">{item.label}</h3>
                          <p className="text-ui/40 text-[10px] uppercase tracking-widest mb-1">Product ID: {item.id}</p>
                          <p className="text-accent font-mono">₦{item.amount.toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-ui/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <div className="flex items-center bg-primary rounded-lg border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-ui/60 hover:text-ui transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-mono text-ui">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={typeof item.maxQuantity === 'number' ? item.quantity >= item.maxQuantity : false}
                            className={`p-2 transition-colors ${typeof item.maxQuantity === 'number' && item.quantity >= item.maxQuantity ? 'text-ui/20 cursor-not-allowed' : 'text-ui/60 hover:text-ui'}`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="text-ui/60 font-body text-sm">
                          Subtotal: <span className="text-ui font-mono">₦{(item.amount * item.quantity).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Delivery Address Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-secondary/50 p-8 rounded-2xl border border-white/5 space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-heading text-ui">Delivery Details</h3>
                  <p className="text-ui/40 text-xs font-body mt-1">Where should we send your merch?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-ui/40 font-heading text-[10px] uppercase tracking-widest">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedState('');
                      }}
                      className="w-full bg-primary border border-white/10 rounded-xl px-4 py-3 text-ui focus:border-accent outline-none transition-colors appearance-none"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-ui/40 font-heading text-[10px] uppercase tracking-widest">State / Region</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      disabled={!selectedCountry}
                      className="w-full bg-primary border border-white/10 rounded-xl px-4 py-3 text-ui focus:border-accent outline-none transition-colors appearance-none disabled:opacity-50"
                    >
                      <option value="">Select State</option>
                      {currentCountry?.states.map(state => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-ui/40 font-heading text-[10px] uppercase tracking-widest">Full Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address, apartment, etc."
                    className="w-full bg-primary border border-white/10 rounded-xl px-4 py-3 text-ui focus:border-accent outline-none transition-colors min-h-[100px] resize-none"
                  />
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary/50 p-8 rounded-2xl border border-white/5 sticky top-32"
              >
                <h3 className="text-2xl font-heading text-ui mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-ui/60 font-body">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-mono text-ui">₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-ui/60 font-body">
                    <span>Shipping</span>
                    <span className="font-mono text-ui">
                      {selectedState ? `₦${shippingCost.toLocaleString()}` : 'Select state'}
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex justify-between text-ui font-heading text-xl">
                    <span>Total</span>
                    <span className="text-accent font-mono">₦{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <PrimaryButton 
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={handleCheckout}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </PrimaryButton>
                
                <p className="text-ui/40 text-xs text-center mt-4 font-body">
                  Secure checkout powered by Paystack
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
