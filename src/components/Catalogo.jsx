// src/components/Catalogo.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import Cart from './Cart'; 

function SocialButtons() {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
      <a
        href="https://www.instagram.com/entrepanes_vcp/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        aria-label="Síguenos en Instagram"
      >
        <img
          src="/img-ig.jpeg"
          alt="Instagram Icono"
          className="w-6 h-6"
        />
      </a>
      <a
        href="https://www.tiktok.com/@entrepanes_vcp"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        aria-label="Síguenos en TikTok"
      >
        <img
          src="/tiktok-ig.png"
          alt="TikTok Icono"
          className="w-6 h-6"
        />
      </a>
    </div>
  );
}

function NotificationPopup({ message, onHide }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onHide();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <div className="fixed top-6 right-6 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-xl z-50 animate-slide-in-right select-none">
      {message}
    </div>
  );
}

function CatalogSection({ title, items, addToCart }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="max-w-screen-xl mx-auto px-6 py-16"
      aria-labelledby={`${title.toLowerCase().replace(/\s/g, '-')}-title`}
    >
      <h2
        id={`${title.toLowerCase().replace(/\s/g, '-')}-title`}
        className="text-4xl font-extrabold text-gray-900 mb-12 select-none"
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {items.map((item) => {
          const finalPrice = item.discount > 0 
            ? item.price - (item.price * item.discount / 100)
            : item.price;

          return (
            <article
              key={item.id}
              tabIndex={0}
              role="button"
              aria-pressed="false"
              onClick={() => addToCart({ ...item, finalPrice })}
              onKeyDown={(e) => { if (e.key === 'Enter') addToCart({ ...item, finalPrice }); }}
              className="bg-yellow-900/75 backdrop-blur-lg rounded-3xl shadow-lg p-6 flex flex-col cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-600 hover:shadow-xl transition-shadow relative"
            >
              {/* Badge de oferta */}
              {item.discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm z-10">
                  -{item.discount}%
                </div>
              )}
              
              {/* Badge de destacado */}
              {item.featured && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm z-10">
                  ⭐ Destacado
                </div>
              )}

              <img
                src={item.image || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                alt={item.name}
                className="rounded-xl object-cover mb-4 h-40 w-full"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                }}
              />
              <h3 className="text-xl font-semibold text-yellow-200 mb-2 select-none">{item.name}</h3>
              {item.description && (
                <p className="text-yellow-100 flex-grow text-sm mb-2">{item.description}</p>
              )}
              
              <div className="mt-auto">
                {item.discount > 0 ? (
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-lg text-yellow-400 select-none">${finalPrice.toFixed(0)}</p>
                    <p className="text-sm text-yellow-300 line-through select-none">${item.price}</p>
                  </div>
                ) : (
                  <p className="font-bold text-lg text-yellow-400 select-none mb-2">${item.price}</p>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ ...item, finalPrice });
                  }}
                  type="button"
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-semibold uppercase rounded-lg py-3 shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 select-none"
                >
                  Añadir al Carrito
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function Catalogo() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos desde Firebase
  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ 
          id: doc.id, 
          ...doc.data() 
        });
      });
      setMenuItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar productos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showPopup = () => {
    setShowNotification(true);
  };

  const hidePopup = () => {
    setShowNotification(false);
  };

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const found = prevItems.find((i) => i.id === item.id); 
      if (found) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { 
          ...item, 
          quantity: 1,
          price: item.finalPrice || item.price 
        }];
      }
    });
    showPopup();
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setIsCartOpen(false);
  };

  const increaseQty = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity - 1;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item) => item !== null)
    );
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Categorizar productos
  const sandwichesDeMiga = menuItems.filter(item => 
    item.category === 'miga' || 
    (!item.category && (item.name.toLowerCase().includes('miga') || item.name.toLowerCase().includes('mini')))
  );
  
  const pebetes = menuItems.filter(item => 
    item.category === 'pebete' || 
    (!item.category && !sandwichesDeMiga.find(s => s.id === item.id))
  );

  const destacados = menuItems.filter(item => item.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-700">
        <div className="text-white text-2xl font-semibold">Cargando catálogo...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-700 pt-20 pb-12 px-4 relative">
      <h1 className="text-center text-5xl font-serif font-extrabold text-white drop-shadow-lg mb-12 select-none">
        Nuestro Catálogo de Sándwiches:
      </h1>

      <button
        onClick={toggleCart}
        className="fixed top-6 right-6 bg-yellow-500 text-yellow-900 font-bold px-5 py-3 rounded-full shadow-lg hover:bg-yellow-400 transition-transform transform hover:scale-110 z-50 flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        aria-label="Abrir carrito de compras"
      >
        🛒{' '}
        {totalQuantity > 0 && (
          <span className="text-yellow-900 bg-yellow-300 px-2 rounded-full font-semibold select-none">
            {totalQuantity}
          </span>
        )}
      </button>

      {destacados.length > 0 && (
        <CatalogSection title="🌟 Productos Destacados:" items={destacados} addToCart={addToCart} />
      )}
      
      {sandwichesDeMiga.length > 0 && (
        <CatalogSection title="Sándwiches de Miga:" items={sandwichesDeMiga} addToCart={addToCart} />
      )}
      
      {pebetes.length > 0 && (
        <CatalogSection title="Pebetes:" items={pebetes} addToCart={addToCart} />
      )}

      {menuItems.length === 0 && (
        <div className="text-center text-white text-xl py-20">
          No hay productos disponibles en este momento.
        </div>
      )}

      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          onClose={toggleCart}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onIncreaseQty={increaseQty}
          onDecreaseQty={decreaseQty}
        />
      )}

      {showNotification && (
        <NotificationPopup message="¡Añadido al carrito!" onHide={hidePopup} />
      )}
      <SocialButtons />
    </main>
  );
}