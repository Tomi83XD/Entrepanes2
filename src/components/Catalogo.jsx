import React, { useState, useEffect } from 'react';

import Cart from './Cart'; 

const sandwichesDeMiga = [
  { id: 1, name: 'Jamón y Queso', description: 'Clásico jamón y queso', price: 2000, image: 'https://tumercaditovegano.com.ar/wp-content/uploads/2024/03/Sandwich-de-miga-jamon-y-queso-vegano-scaled.jpg' },
  { id: 2, name: 'Salame Y Queso', description: 'Clásico salame y queso', price: 2000, image: 'https://dcdn-us.mitiendanube.com/stores/004/823/838/products/descarga-2-52c0934cc46a90250817182173158410-1024-1024.jpg' },
  { id: 3, name: 'Miga de Ternera', description: 'Una ternera de 1° calidad y mayonesa', price: 3000, image: 'https://www.clarin.com/2022/12/06/yOnu4tCQx_2000x1500__1.jpg' },
  { id: 4, name: 'Vegetariano', description: 'Queso, lechuga, tomate y mayonesa', price: 2500, image: 'https://cocinerosargentinos.com/content/recipes/original/sandwiches-de-miga-livianitos.5165.jpg' },
  { id: 5, name: 'Miga de Pollo', description: 'Pollo desmenuzado, queso y mayonesa', price: 2500, image: 'https://www.rionegro.com.ar/wp-content/uploads/2021/05/sangg.jpg?w=920&h=517&crop=1' },
  { id: 6, name: 'Huevo', description: 'Clásico JyQ con huevo', price: 2200, image: 'https://ramalloclub.com/wp-content/uploads/2021/03/d70a1b10e302586782fe2ac9887fa84fo-scaled.jpg' },
  { id: 7, name: 'Primavera', description: 'Zanahoria, tomate, lechuga y queso', price: 2500, image: 'https://www.circuitogastronomico.com/wp-content/uploads/2022/12/armoniche-sand-jpeg.webp' },
  { id: 8, name: 'Mixto', description: 'Jamón, queso y tomate', price: 2300, image: 'https://ramalloclub.com/wp-content/uploads/2021/03/6740dc2132bf70bf6617d320c67241e7o-scaled.jpg' },
  { id: 9, name: 'Mini Sanguche clasico', description: 'Jamón Y queso', price: 1000, image: 'https://dcdn-us.mitiendanube.com/stores/001/147/470/products/sandiwch-miga-jamon-y-queso-a086902b80bddc799e17075120781205-640-0.jpg' },
];

const pebetes = [
  { id: 10, name: 'Clásico: JyQ', description: 'Jamón, queso y mayonesa', price: 2000, image: 'https://http2.mlstatic.com/D_NQ_NP_2X_983521-MLA83177866752_042025-F.webp' },
  { id: 11, name: 'Salame', description: 'Salame, queso y mayonesa', price: 2000, image: 'https://images.rappi.com.ar/products/1069222-1584565667732.jpg' },
  { id: 12, name: 'Completo', description: 'Jamón, queso, lechuga y tomate', price: 2300, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPfeuk8j2063xlzCQeNLg4OAa1jONmxSVJmw&s' },
  { id: 13, name: 'Ternera', description: 'Una ternera de 1° calidad y mayonesa', price: 2500, image: 'https://images.rappi.com.ar/restaurants_background/home-1625581095387.jpg?e=webp&d=200x200&q=50' },
];

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
        {items.map(({ id, name, description, price, image }) => (
          <article
            key={id}
            tabIndex={0}
            role="button"
            aria-pressed="false"
            onClick={() => addToCart({ id, name, price, image })}
            onKeyDown={(e) => { if (e.key === 'Enter') addToCart({ id, name, price, image }); }}
            className="bg-yellow-900/75 backdrop-blur-lg rounded-3xl shadow-lg p-6 flex flex-col cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-600 hover:shadow-xl transition-shadow"
          >
            <img
              src={image}
              alt={name}
              className="rounded-xl object-cover mb-4 h-40 w-full"
              loading="lazy"
            />
            <h3 className="text-xl font-semibold text-yellow-200 mb-2 select-none">{name}</h3>
            <p className="text-yellow-100 flex-grow">{description}</p>
            <p className="font-bold text-lg mt-4 text-yellow-400 select-none">${price}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart({ id, name, price, image });
              }}
              type="button"
              className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-semibold uppercase rounded-lg py-3 shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 select-none"
            >
              Añadir al Carrito
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Catalogo() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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
        return [...prevItems, { ...item, quantity: 1 }];
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

      <CatalogSection title="Sándwiches de Miga:" items={sandwichesDeMiga} addToCart={addToCart} />
      <CatalogSection title="Pebetes:" items={pebetes} addToCart={addToCart} />

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