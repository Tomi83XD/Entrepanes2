import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js'; // Importa db real (asegúrate de que firebase.js esté configurado)
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore'; // Importa funciones necesarias

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
        {/* Reemplaza el emoji con una imagen */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" 
          alt="Instagram" 
          className="w-6 h-6"  // Ajusta el tamaño si es necesario
        />
      </a>
      <a
        href="https://www.tiktok.com/@entrepanes_vcp"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        aria-label="Síguenos en TikTok"
      >
        {/* Reemplaza el emoji con una imagen */}
        <img 
          src="https://static.vecteezy.com/system/resources/previews/016/716/450/non_2x/tiktok-icon-free-png.png" 
          alt="TikTok" 
          className="w-6 h-6"  // Ajusta el tamaño si es necesario
        />
      </a>
    </div>
  );
}

function NotificationPopup({ message, type = 'success', onHide }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onHide();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-orange-500' : 'bg-red-500';
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';

  return (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 ${bgColor} text-white font-bold px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce select-none flex items-center gap-3`}>
      <span className="text-2xl">{icon}</span>
      <span>{message}</span>
    </div>
  );
}

function CategoryFilters({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="max-w-screen-xl mx-auto px-6 mb-8 sticky top-20 z-40 bg-yellow-700 py-4 rounded-xl shadow-lg">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-6 py-3 rounded-full font-bold uppercase transition-all transform hover:scale-105 ${
            activeCategory === 'all'
              ? 'bg-yellow-500 text-yellow-900 shadow-lg scale-105'
              : 'bg-yellow-800/80 text-yellow-200 hover:bg-yellow-700'
          }`}
        >
          🍽️ Todos
        </button>
        
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-6 py-3 rounded-full font-bold uppercase transition-all transform hover:scale-105 ${
              activeCategory === cat.id
                ? 'bg-yellow-500 text-yellow-900 shadow-lg scale-105'
                : 'bg-yellow-800/80 text-yellow-200 hover:bg-yellow-700'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function StockBadge({ stock, limitedStock }) {
  if (stock === 0) {
    return (
      <div className="absolute top-3 left-3 bg-red-600 text-white font-bold px-3 py-2 rounded-full text-xs z-10 shadow-lg">
        🚫 Agotado
      </div>
    );
  }
  
  if (limitedStock && stock <= 5) {
    return (
      <div className="absolute top-3 left-3 bg-orange-500 text-white font-bold px-3 py-2 rounded-full text-xs z-10 shadow-lg animate-pulse">
        ⏰ ¡Últimas {stock} unidades!
      </div>
    );
  }
  
  return null;
}

function CatalogSection({ title, items, addToCart, showTitle = true }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="max-w-screen-xl mx-auto px-6 py-8"
      aria-labelledby={`${title.toLowerCase().replace(/\s/g, '-')}-title`}
    >
      {showTitle && (
        <h2
          id={`${title.toLowerCase().replace(/\s/g, '-')}-title`}
          className="text-4xl font-extrabold text-white mb-8 select-none border-b-4 border-yellow-500 pb-3 inline-block"
        >
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.map((item) => {
          const finalPrice = item.discount > 0 
            ? item.price - (item.price * item.discount / 100)
            : item.price;
          
          const isOutOfStock = item.stock === 0;
          const isLowStock = item.limitedStock && item.stock > 0 && item.stock <= 5;

          return (
            <article
              key={item.id}
              className={`bg-yellow-900/90 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all hover:scale-105 transform relative group ${isOutOfStock ? 'opacity-60' : ''}`}
            >
              {/* Badge de stock */}
              <StockBadge stock={item.stock} limitedStock={item.limitedStock} />
              
              {/* Badge de oferta */}
              {item.discount > 0 && !isOutOfStock && (
                <div className="absolute top-3 right-3 bg-red-500 text-white font-bold px-3 py-2 rounded-full text-xs z-10 shadow-lg animate-pulse">
                  -{item.discount}% OFF
                </div>
              )}
              
              {/* Badge de destacado */}
              {item.featured && !isOutOfStock && (
                <div className="absolute top-14 left-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 font-bold px-3 py-2 rounded-full text-xs z-10 shadow-lg">
                  ⭐ Destacado
                </div>
              )}

              {/* Badge de nuevo */}
              {item.isNew && !isOutOfStock && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold px-3 py-2 rounded-full text-xs z-10 shadow-lg">
                  🆕 Nuevo
                </div>
              )}

              <div className="relative overflow-hidden h-48">
                <img
                  src={item.image || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                  }}
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">AGOTADO</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-yellow-100 mb-2 select-none">{item.name}</h3>
                {item.description && (
                  <p className="text-yellow-200 flex-grow text-sm mb-3 line-clamp-2">{item.description}</p>
                )}
                
                {/* Mostrar stock disponible */}
                {!isOutOfStock && item.limitedStock && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-yellow-300 mb-1">
                      <span>Stock disponible</span>
                      <span className="font-bold">{item.stock} unidades</span>
                    </div>
                    <div className="w-full bg-yellow-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          item.stock <= 3 ? 'bg-red-500' : 
                          item.stock <= 5 ? 'bg-orange-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((item.stock / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto">
                  {item.discount > 0 ? (
                    <div className="flex items-center gap-2 mb-3">
                      <p className="font-extrabold text-2xl text-yellow-300 select-none">${finalPrice.toFixed(0)}</p>
                      <p className="text-sm text-yellow-400 line-through select-none">${item.price}</p>
                      <span className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Ahorrás ${(item.price - finalPrice).toFixed(0)}
                      </span>
                    </div>
                  ) : (
                    <p className="font-extrabold text-2xl text-yellow-300 select-none mb-3">${item.price}</p>
                  )}
                  
                  <button
                    onClick={() => !isOutOfStock && addToCart({ ...item, finalPrice })}
                    type="button"
                    disabled={isOutOfStock}
                    className={`w-full font-bold uppercase rounded-xl py-3 shadow-lg transition-all transform focus:outline-none focus:ring-4 focus:ring-yellow-300 select-none ${
                      isOutOfStock 
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-yellow-900 hover:scale-105'
                    }`}
                  >
                    {isOutOfStock ? '😢 Agotado' : '🛒 Añadir al Carrito'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ... (el resto del archivo Catalogo.jsx permanece igual hasta el componente Cart)

// Componente de Carrito mejorado
function Cart({ cartItems, onClose, onRemoveItem, onClearCart, onIncreaseQty, onDecreaseQty, onConfirmSale }) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const alias = "tomas.hornalla";
  const titular = "Tomas Martin Orellana Jimenez";
  const whatsappNumber = "5493541682299";

  // Nuevos estados para el formulario de checkout
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerLastName: '',
    phone: '',
    address: '',
    preferredTime: '',
    paymentMethod: 'Efectivo' // Opciones: 'Efectivo' o 'Transferencia'
  });
  const [formErrors, setFormErrors] = useState({});

  const copyAlias = async () => {
    try {
      await navigator.clipboard.writeText(alias);
      alert('Alias copiado: ' + alias);
    } catch (err) {
      console.error('Error al copiar el alias: ', err);
      alert('No se pudo copiar el alias.');
    }
  };

  // Función para validar y enviar el formulario
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validaciones básicas
    if (!checkoutData.customerName.trim()) errors.customerName = 'Nombre es obligatorio';
    if (!checkoutData.customerLastName.trim()) errors.customerLastName = 'Apellido es obligatorio';
    if (!checkoutData.phone.trim() || !/^\d{10,15}$/.test(checkoutData.phone)) errors.phone = 'Teléfono debe ser un número válido (10-15 dígitos)';
    if (!checkoutData.address.trim()) errors.address = 'Dirección es obligatoria';
    if (!checkoutData.preferredTime.trim()) errors.preferredTime = 'Horario preferido es obligatorio';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (cartItems.length === 0) return;

    // Registrar venta con datos del cliente
    try {
      await onConfirmSale(cartItems, total, checkoutData); // Pasamos checkoutData a la función
      setShowCheckoutForm(false);
      setCheckoutData({ customerName: '', customerLastName: '', phone: '', address: '', preferredTime: '', paymentMethod: 'Efectivo' });
      setFormErrors({});
      alert('¡Pedido enviado exitosamente! Te contactaremos pronto.');
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Error al procesar el pedido. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} aria-hidden="true" />
      <aside className="fixed top-0 right-0 w-full max-w-md h-full bg-yellow-900 text-yellow-200 p-6 shadow-lg z-50 flex flex-col overflow-auto rounded-l-3xl" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <h2 id="cart-title" className="text-3xl font-extrabold mb-6 select-none">🛒 Tu Carrito</h2>
        <button onClick={onClose} aria-label="Cerrar carrito" className="self-end text-yellow-400 hover:text-yellow-300 mb-6 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">✕</button>

        {/* Info de pago siempre visible */}
        <div className="bg-yellow-800 bg-opacity-40 p-4 rounded-xl shadow-inner mb-4 select-none">
          <h4 className="font-semibold text-lg mb-2 text-yellow-400">Información de Pago:</h4>
          <p className="text-yellow-300">Alias: <span className="font-mono text-yellow-500 font-bold ml-2">{alias}</span>
            <button onClick={copyAlias} className="ml-2 text-yellow-900 bg-yellow-400 hover:bg-yellow-300 px-2 py-1 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500" aria-label="Copiar alias">Copiar</button>
          </p>
          <p className="text-yellow-300 mt-1">Titular: {titular}</p>
          <p className="text-yellow-300 text-sm mt-2">WhatsApp: <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-yellow-500 underline">+{whatsappNumber}</a></p>
        </div>

        {showCheckoutForm ? (
          // Formulario de Checkout
          <form onSubmit={handleCheckoutSubmit} className="flex-grow overflow-auto">
            <h3 className="text-2xl font-bold mb-4 text-yellow-100">📝 Finalizar Pedido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-yellow-300 font-semibold mb-1">Nombre *</label>
                <input
                  type="text"
                  value={checkoutData.customerName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-yellow-800 text-yellow-100 border border-yellow-600 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ingresa tu nombre"
                />
                {formErrors.customerName && <p className="text-red-400 text-sm mt-1">{formErrors.customerName}</p>}
              </div>
              <div>
                <label className="block text-yellow-300 font-semibold mb-1">Apellido *</label>
                <input
                  type="text"
                  value={checkoutData.customerLastName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, customerLastName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-yellow-800 text-yellow-100 border border-yellow-600 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ingresa tu apellido"
                />
                {formErrors.customerLastName && <p className="text-red-400 text-sm mt-1">{formErrors.customerLastName}</p>}
              </div>
              <div>
                <label className="block text-yellow-300 font-semibold mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-yellow-800 text-yellow-100 border border-yellow-600 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej: 549123456789"
                />
                {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-yellow-300 font-semibold mb-1">Dirección de Entrega *</label>
                <textarea
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-yellow-800 text-yellow-100 border border-yellow-600 focus:ring-2 focus:ring-yellow-400"
                  rows="3"
                  placeholder="Ingresa tu dirección completa"
                />
                {formErrors.address && <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>}
              </div>
              <div>
                <label className="block text-yellow-300 font-semibold mb-1">Horario Preferido *</label>
                <input
                  type="text"
                  value={checkoutData.preferredTime}
                  onChange={(e) => setCheckoutData({ ...checkoutData, preferredTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-yellow-800 text-yellow-100 border border-yellow-600 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej: Hoy a las 20:00"
                />
                {formErrors.preferredTime && <p className="text-red-400 text-sm mt-1">{formErrors.preferredTime}</p>}
              </div>
              <div>
                <label className="block text-yellow-300 font-semibold mb-1">Forma de Pago</label>
                <select
                  value={checkoutData.paymentMethod}
                  onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-yellow-800 text-yellow-100 border border-yellow-600 focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button type="submit" className="flex-grow bg-green-500 hover:bg-green-400 text-yellow-900 font-semibold uppercase py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 select-none">
                Enviar Pedido
              </button>
              <button type="button" onClick={() => setShowCheckoutForm(false)} className="flex-grow bg-gray-600 hover:bg-gray-500 text-yellow-100 font-semibold uppercase py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 select-none">
                Volver al Carrito
              </button>
            </div>
          </form>
        ) : (
          // Vista del Carrito Normal
          <>
            {cartItems.length === 0 ? (
              <p className="text-yellow-400 select-none">Tu carrito está vacío</p>
            ) : (
              <>
                <ul className="flex-grow divide-y divide-yellow-700 overflow-auto mb-4" aria-label="Lista de productos en carrito">
                  {cartItems.map(({ id, name, price, quantity, image }) => (
                    <li key={id} className="py-4 flex gap-4 items-start" role="listitem">
                      <img src={image} alt={name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                      <div className="flex flex-col flex-grow">
                        <h3 className="font-semibold select-none">{name}</h3>
                        <p className="select-none">{quantity} x ${price}</p>
                        <p className="font-bold mt-1 select-none">Subtotal: ${(price * quantity).toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => onDecreaseQty(id)} aria-label={`Disminuir cantidad de ${name}`} className="bg-yellow-700 hover:bg-yellow-600 rounded px-2 select-none focus:outline-none focus:ring-2 focus:ring-yellow-400">-</button>
                          <span className="font-semibold select-none">{quantity}</span>
                          <button onClick={() => onIncreaseQty(id)} aria-label={`Incrementar cantidad de ${name}`} className="bg-yellow-700 hover:bg-yellow-600 rounded px-2 select-none focus:outline-none focus:ring-2 focus:ring-yellow-400">+</button>
                        </div>
                      </div>
                      <button onClick={() => onRemoveItem(id)} aria-label={`Eliminar ${name} del carrito`} className="text-red-500 hover:text-red-400 font-bold self-end select-none ml-auto">✕</button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-yellow-700 pt-4 text-right font-bold text-yellow-300 text-xl select-none">Total: ${total.toFixed(2)}</div>
                <div className="mt-6 flex gap-4">
                  <button onClick={() => setShowCheckoutForm(true)} className="flex-grow bg-green-500 hover:bg-green-400 text-yellow-900 font-semibold uppercase py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 select-none">
                    Finalizar Compra
                  </button>
                  <button onClick={onClearCart} className="flex-grow bg-red-600 hover:bg-red-500 text-yellow-100 font-semibold uppercase py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-400 select-none">
                    Vaciar Carrito
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </>
  );
}

// ... (el resto del archivo Catalogo.jsx permanece igual)

export default function Catalogo() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'featured', name: 'Destacados', icon: '⭐' },
    { id: 'miga', name: 'Migas', icon: '🥪' },
    { id: 'pebete', name: 'Pebetes', icon: '🍔' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
    { id: 'postres', name: 'Postres', icon: '🍰' },
    { id: 'otros', name: 'Otros', icon: '📦' }
  ];

  // Hook para cargar datos de Firestore
  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('name')); // Ordena por nombre (puedes cambiar a otro campo si quieres)
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          name: docSnap.data().name || '',
          price: docSnap.data().price || 0,
          description: docSnap.data().description || '',
          image: docSnap.data().image || '',
          category: docSnap.data().category || 'miga',
          discount: docSnap.data().discount || 0,
          stock: docSnap.data().stock || 0,
          limitedStock: docSnap.data().limitedStock || false,
          featured: docSnap.data().featured || false,
          isNew: docSnap.data().isNew || false,
          isAvailable: docSnap.data().isAvailable !== false
        });
      });
      setMenuItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar el menú:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const confirmSale = async (cartItems, total, checkoutData) => {
  try {
    // Registrar la venta en 'sales' con datos del cliente
    const saleData = {
      date: new Date().toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      total: total,
      timestamp: new Date(),
      // Nuevos campos del cliente
      customerName: checkoutData.customerName,
      customerLastName: checkoutData.customerLastName,
      phone: checkoutData.phone,
      address: checkoutData.address,
      preferredTime: checkoutData.preferredTime,
      paymentMethod: checkoutData.paymentMethod
    };
    await addDoc(collection(db, 'sales'), saleData);

    // Disminuir stock en 'menu' para cada item
    for (const item of cartItems) {
      const itemRef = doc(db, 'menu', item.id);
      const currentStock = menuItems.find(m => m.id === item.id)?.stock || 0;
      const newStock = Math.max(0, currentStock - item.quantity); // Evita stock negativo
      await updateDoc(itemRef, { stock: newStock });
    }

    // Limpiar carrito después de confirmar
    setCartItems([]);
    setIsCartOpen(false);
    showNotification('¡Pedido registrado exitosamente!', 'success');
  } catch (error) {
    console.error('Error al confirmar venta:', error);
    showNotification('Error al procesar el pedido. Inténtalo de nuevo.', 'error');
  }
};
  const addToCart = (item) => {
    // Verificar stock disponible
    const currentCartItem = cartItems.find(i => i.id === item.id);
    const currentQuantityInCart = currentCartItem ? currentCartItem.quantity : 0;
    
    if (currentQuantityInCart >= item.stock) {
      showNotification(`⚠️ No hay más stock de ${item.name}`, 'warning');
      return;
    }
    
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
    showNotification('¡Añadido al carrito!', 'success');
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setIsCartOpen(false);
  };

  const increaseQty = (id) => {
    const item = menuItems.find(i => i.id === id);
    const cartItem = cartItems.find(i => i.id === id);
    
    if (cartItem && cartItem.quantity >= item.stock) {
      showNotification(`⚠️ Stock máximo alcanzado para ${item.name}`, 'warning');
      return;
    }
    
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

  const getFilteredItems = () => {
    if (activeCategory === 'all') {
      return menuItems;
    }
    if (activeCategory === 'featured') {
      return menuItems.filter(item => item.featured);
    }
    return menuItems.filter(item => item.category === activeCategory);
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-700">
        <div className="text-white text-2xl font-semibold animate-pulse">🍞 Cargando catálogo delicioso...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-700 via-yellow-600 to-yellow-800 pt-20 pb-12 px-4 relative">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-white drop-shadow-2xl mb-4 select-none animate-fade-in">
          🍞 Nuestro Catálogo 🍞
        </h1>
        <p className="text-yellow-200 text-lg md:text-xl font-medium select-none">
          Los mejores sándwiches de Carlos Paz te esperan
        </p>
      </div>

      <button
        onClick={toggleCart}
        className="fixed top-6 right-6 bg-yellow-500 text-yellow-900 font-bold px-5 py-3 rounded-full shadow-2xl hover:bg-yellow-400 transition-all transform hover:scale-110 z-50 flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        aria-label="Abrir carrito de compras"
      >
        <span className="text-2xl">🛒</span>
        {totalQuantity > 0 && (
          <span className="text-yellow-900 bg-yellow-300 px-3 py-1 rounded-full font-bold text-sm select-none animate-pulse">
            {totalQuantity}
          </span>
        )}
      </button>

      <CategoryFilters 
        categories={categories} 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />

      {filteredItems.length > 0 ? (
        <CatalogSection 
          title={activeCategory === 'all' ? 'Todos los Productos' : categories.find(c => c.id === activeCategory)?.name || 'Productos'} 
          items={filteredItems} 
          addToCart={addToCart}
          showTitle={false}
        />
      ) : (
        <div className="text-center text-white text-xl py-20 bg-yellow-800/50 rounded-3xl max-w-2xl mx-auto">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="font-semibold">No hay productos en esta categoría</p>
          <p className="text-yellow-200 mt-2">Prueba con otra categoría</p>
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
          onConfirmSale={confirmSale} // Nueva prop para confirmar venta
        />
      )}

      {notification && (
        <NotificationPopup 
          message={notification.message} 
          type={notification.type}
          onHide={hideNotification} 
        />
      )}
      <SocialButtons />
    </main>
  );
}