import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Save, X, Image, Tag, Eye, EyeOff, Plus } from 'lucide-react';

// Simulación de auth y db (reemplaza con tus imports reales)
const auth = { currentUser: { uid: 'admin123' } };
const db = {};

function AdminPanel() {
    const [user, setUser] = useState({ uid: 'admin123' });
    const [isAdmin, setIsAdmin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [menuItems, setMenuItems] = useState([
        { 
            id: '1', 
            name: 'Hamburguesa Clásica', 
            price: 3000, 
            description: 'Deliciosa hamburguesa con queso',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            category: 'Hamburguesas',
            discount: 0,
            isAvailable: true,
            hasOffer: false
        },
        { 
            id: '2', 
            name: 'Pizza Margarita', 
            price: 4500, 
            description: 'Pizza con salsa de tomate y mozzarella',
            imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
            category: 'Pizzas',
            discount: 15,
            isAvailable: true,
            hasOffer: true
        }
    ]);
    
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        category: 'Hamburguesas',
        discount: 0,
        isAvailable: true,
        hasOffer: false
    });
    
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [addProductMessage, setAddProductMessage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    
    const categories = ['Hamburguesas', 'Pizzas', 'Bebidas', 'Postres', 'Ensaladas', 'Acompañamientos'];

    const handleImageUpload = (e, isEditing = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEditing) {
                    setEditForm({...editForm, imageUrl: reader.result});
                } else {
                    setNewProduct({...newProduct, imageUrl: reader.result});
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const addNewProduct = () => {
        if (!newProduct.name || !newProduct.price) {
            setAddProductMessage("Por favor completa nombre y precio");
            return;
        }

        const product = {
            id: Date.now().toString(),
            ...newProduct,
            price: Number(newProduct.price),
            discount: Number(newProduct.discount)
        };

        setMenuItems([...menuItems, product]);
        setAddProductMessage('¡Producto agregado exitosamente!');
        setNewProduct({
            name: '',
            price: '',
            description: '',
            imageUrl: '',
            category: 'Hamburguesas',
            discount: 0,
            isAvailable: true,
            hasOffer: false
        });
        setImagePreview('');
        
        setTimeout(() => setAddProductMessage(''), 3000);
    };

    const deleteProduct = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            setMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditForm({...item});
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = () => {
        setMenuItems(menuItems.map(item => 
            item.id === editingId ? {...editForm, price: Number(editForm.price), discount: Number(editForm.discount)} : item
        ));
        setEditingId(null);
        setEditForm({});
    };

    const toggleAvailability = (id) => {
        setMenuItems(menuItems.map(item => 
            item.id === id ? {...item, isAvailable: !item.isAvailable} : item
        ));
    };

    const calculateFinalPrice = (price, discount) => {
        return discount > 0 ? price - (price * discount / 100) : price;
    };

    const handleLogout = () => {
        setUser(null);
        setIsAdmin(false);
    };

    if (!user || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-600 to-orange-700 p-6">
                <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        🔐 Admin Login
                    </h2>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email"
                        className="w-full px-4 py-3 border rounded-xl mb-4 focus:ring-2 focus:ring-yellow-500"
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password"
                        className="w-full px-4 py-3 border rounded-xl mb-4 focus:ring-2 focus:ring-yellow-500"
                    />
                    <button 
                        onClick={() => {setUser({uid: 'admin'}); setIsAdmin(true);}}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl"
                    >
                        Ingresar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-600 to-orange-700 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">🍔 Panel Admin</h1>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full py-2 px-6 shadow-lg transition-all"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Agregar Producto */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus className="w-6 h-6" /> Agregar Nuevo Producto
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input 
                            type="text" 
                            placeholder="Nombre del producto"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                        />
                        
                        <input 
                            type="number" 
                            placeholder="Precio"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                        />
                        
                        <select 
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        
                        <input 
                            type="number" 
                            placeholder="Descuento (%)"
                            value={newProduct.discount}
                            onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
                            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                        />
                        
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={newProduct.hasOffer}
                                onChange={(e) => setNewProduct({...newProduct, hasOffer: e.target.checked})}
                                className="w-5 h-5"
                            />
                            <label className="text-sm font-medium">Marcar como Oferta</label>
                        </div>
                        
                        <div className="col-span-full">
                            <textarea 
                                placeholder="Descripción del producto"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                                rows="2"
                            />
                        </div>
                        
                        <div className="col-span-full">
                            <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, false)}
                                className="w-full px-4 py-2 border rounded-xl"
                            />
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-xl" />
                            )}
                        </div>
                    </div>
                    
                    <button 
                        onClick={addNewProduct}
                        className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                    >
                        ✨ Agregar Producto
                    </button>
                    
                    {addProductMessage && (
                        <p className="mt-4 text-center font-semibold text-green-600">{addProductMessage}</p>
                    )}
                </div>

                {/* Lista de Productos */}
                <div className="bg-white rounded-3xl shadow-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Productos del Menú</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems.map(item => (
                            <div key={item.id} className={`border rounded-2xl overflow-hidden shadow-lg transition-all ${!item.isAvailable ? 'opacity-60' : ''}`}>
                                {editingId === item.id ? (
                                    // Modo Edición
                                    <div className="p-4 bg-yellow-50">
                                        <input 
                                            type="text" 
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg mb-2"
                                        />
                                        <input 
                                            type="number" 
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg mb-2"
                                        />
                                        <select 
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg mb-2"
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <input 
                                            type="number" 
                                            placeholder="Descuento %"
                                            value={editForm.discount}
                                            onChange={(e) => setEditForm({...editForm, discount: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg mb-2"
                                        />
                                        <textarea 
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg mb-2"
                                            rows="2"
                                        />
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, true)}
                                            className="w-full px-3 py-2 border rounded-lg mb-2 text-sm"
                                        />
                                        <div className="flex items-center gap-2 mb-2">
                                            <input 
                                                type="checkbox"
                                                checked={editForm.hasOffer}
                                                onChange={(e) => setEditForm({...editForm, hasOffer: e.target.checked})}
                                            />
                                            <label className="text-sm">Oferta Especial</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={saveEdit} className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-1">
                                                <Save className="w-4 h-4" /> Guardar
                                            </button>
                                            <button onClick={cancelEditing} className="flex-1 bg-gray-500 text-white py-2 rounded-lg flex items-center justify-center gap-1">
                                                <X className="w-4 h-4" /> Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Modo Vista
                                    <>
                                        <div className="relative">
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
                                            )}
                                            {item.hasOffer && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    ¡OFERTA!
                                                </div>
                                            )}
                                            {!item.isAvailable && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">NO DISPONIBLE</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-xs">{item.category}</span>
                                            </div>
                                            
                                            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                                            
                                            <div className="flex items-center gap-2 mb-3">
                                                {item.discount > 0 ? (
                                                    <>
                                                        <span className="text-gray-400 line-through">${item.price}</span>
                                                        <span className="text-green-600 font-bold text-xl">${calculateFinalPrice(item.price, item.discount)}</span>
                                                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">-{item.discount}%</span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-800 font-bold text-xl">${item.price}</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => toggleAvailability(item.id)}
                                                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 ${item.isAvailable ? 'bg-yellow-500 text-white' : 'bg-gray-300'}`}
                                                >
                                                    {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    {item.isAvailable ? 'Visible' : 'Oculto'}
                                                </button>
                                                <button 
                                                    onClick={() => startEditing(item)}
                                                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" /> Editar
                                                </button>
                                                <button 
                                                    onClick={() => deleteProduct(item.id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;