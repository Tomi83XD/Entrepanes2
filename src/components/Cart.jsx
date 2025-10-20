import React from 'react';

export default function Cart({ cartItems, onClose, onRemoveItem, onClearCart, onIncreaseQty, onDecreaseQty, onConfirmSale }) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const alias = "tomas.hornalla";
  const titular = "Tomas Martin Orellana Jimenez";
  const whatsappNumber = "5493541682299";

  const copyAlias = async () => {
    try {
      await navigator.clipboard.writeText(alias);
      alert('Alias copiado: ' + alias);
    } catch (err) {
      console.error('Error al copiar el alias: ', err);
      alert('No se pudo copiar el alias.');
    }
  };

  const finalizePurchase = async () => {
    if (cartItems.length === 0) return;

    // Registrar venta y actualizar stock
    await onConfirmSale(cartItems, total);

    // Generar mensaje de WhatsApp
    let message = "🛒 *Nuevo Pedido - Entrepanes VCP*\n\n";
    cartItems.forEach(item => {
      message += `• ${item.name}\n`;
      message += `  Cantidad: ${item.quantity}\n`;
      message += `  Precio: $${item.price} c/u\n`;
      message += `  Subtotal: $${(item.price * item.quantity).toFixed(0)}\n\n`;
    });
    message += `💰 *Total: $${total.toFixed(0)}*\n\n`;
    message += "📍 Dirección de entrega:\n";
    message += "🕐 Horario preferido:\n";
    message += "💳 Forma de pago (Efectivo o Transferencia):\n";
    message += `*Alias para transferencia: ${alias}*\n`;
    message += `*Titular: ${titular}*\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
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
          <p className="text-yellow-300 text-sm mt-2">*Pago con transferencia: 10% descuento. Manda comprobante por WhatsApp.*</p>
          <p className="text-yellow-300 text-sm mt-2">WhatsApp: <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-yellow-500 underline">+{whatsappNumber}</a></p>
        </div>

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
              <button onClick={finalizePurchase} className="flex-grow bg-green-500 hover:bg-green-400 text-yellow-900 font-semibold uppercase py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 select-none">Finalizar Compra</button>
              <button onClick={onClearCart} className="flex-grow bg-red-600 hover:bg-red-500 text-yellow-100 font-semibold uppercase py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-400 select-none">Vaciar Carrito</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}