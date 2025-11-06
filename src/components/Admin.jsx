import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'; 
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, where, orderBy } from 'firebase/firestore';
import Papa from 'papaparse'; // Para exportar CSV (instala con npm install papaparse)

// Iconos simples con emojis
const Trash2 = () => <span>🗑️</span>;
const Edit = () => <span>✏️</span>;
const Save = () => <span>💾</span>;
const X = () => <span>❌</span>;
const Eye = () => <span>👁️</span>;
const EyeOff = () => <span>🚫</span>;
const Plus = () => <span>➕</span>;
const Star = () => <span>⭐</span>;
const Search = () => <span>🔍</span>;
const Filter = () => <span>🔽</span>;

function AdminPanel() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        image: '', // Cambiado de imageUrl a image para coincidir con Catalogo
        category: 'miga',
        discount: 0,
        isAvailable: true,
        featured: false, // Cambiado de hasOffer a featured
        stock: 0,
        limitedStock: false,
        isNew: false
    });
    
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [addProductMessage, setAddProductMessage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    
    // Nuevos estados para ventas del día
    const [dailySales, setDailySales] = useState([]);
    const [totalSalesToday, setTotalSalesToday] = useState(0);
    
    // Nuevos estados para mejoras
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    
    // Categorías que coinciden con tu Catalogo
    const categories = ['miga', 'pebete', 'bebidas', 'postres', 'otros'];

    // Hook 1: Escucha la autenticación y verifica el rol
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
            
            if (currentUser) {
                try {
                    const token = await currentUser.getIdTokenResult(true); 
                    if (token.claims.admin) {
                        setIsAdmin(true);
                        setMessage('');
                    } else {
                        setIsAdmin(false);
                        setMessage("Acceso denegado: No tienes permisos de administrador.");
                        signOut(auth);
                    }
                } catch (error) {
                    console.error("Error al verificar token:", error);
                    setIsAdmin(false);
                    setMessage("Error de verificación.");
                    signOut(auth); 
                }
            } else {
                setIsAdmin(false);
                setMessage('');
            }
        });
        return () => unsubscribe();
    }, []);

    // Hook 2: Carga la lista de ítems del menú si es admin
    useEffect(() => {
        if (!isAdmin || !db) return;

        const q = query(collection(db, 'menu'));
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
                    isAvailable: docSnap.data().isAvailable !== false,
                    featured: docSnap.data().featured || false,
                    stock: docSnap.data().stock || 0,
                    limitedStock: docSnap.data().limitedStock || false,
                    isNew: docSnap.data().isNew || false
                });
            });
            setMenuItems(items);
            
            // Generar alertas de stock bajo
            const alerts = items.filter(item => item.stock <= 5 && item.stock > 0);
            setLowStockAlerts(alerts);
        }, (error) => {
            console.error("Error al cargar el menú:", error);
        });

        return () => unsubscribe();
    }, [isAdmin]);

    // Hook 3: Carga ventas del día si es admin
    useEffect(() => {
        if (!isAdmin) return;

        const today = new Date().toISOString().split('T')[0]; // Fecha actual en YYYY-MM-DD
        const q = query(
            collection(db, 'sales'),
            where('date', '==', today),
            orderBy('timestamp', 'desc')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const sales = [];
            let total = 0;
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                sales.push({ id: docSnap.id, ...data });
                total += data.total;
            });
            setDailySales(sales);
            setTotalSalesToday(total);
        }, (error) => {
            console.error("Error al cargar ventas del día:", error);
        });

        return () => unsubscribe();
    }, [isAdmin]);

    const handleLogin = async () => {
        setMessage('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            let errorMessage = "Error al iniciar sesión. Inténtalo de nuevo.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                 errorMessage = "Correo o contraseña incorrectos.";
            }
            setMessage(errorMessage);
        }
    };

    const handleImageUpload = (e, isEditing = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEditing) {
                    setEditForm({...editForm, image: reader.result});
                } else {
                    setNewProduct({...newProduct, image: reader.result});
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const addNewProduct = async () => {
        if (!newProduct.name || !newProduct.price) {
            setAddProductMessage("Por favor completa nombre y precio");
            return;
        }

        try {
            setAddProductMessage('Agregando producto...');
            await addDoc(collection(db, 'menu'), {
                name: newProduct.name,
                price: Number(newProduct.price),
                description: newProduct.description,
                image: newProduct.image,
                category: newProduct.category,
                discount: Number(newProduct.discount),
                isAvailable: newProduct.isAvailable,
                featured: newProduct.featured,
                stock: Number(newProduct.stock),
                limitedStock: newProduct.limitedStock,
                isNew: newProduct.isNew
            });

            setAddProductMessage('¡Producto agregado exitosamente!');
            setNewProduct({
                name: '',
                price: '',
                description: '',
                image: '',
                category: 'miga',
                discount: 0,
                isAvailable: true,
                featured: false,
                stock: 0,
                limitedStock: false,
                isNew: false
            });
            setImagePreview('');
            
            setTimeout(() => setAddProductMessage(''), 3000);
        } catch (error) {
            console.error("Error al agregar producto:", error);
            setAddProductMessage(`Error: ${error.message}`);
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await deleteDoc(doc(db, 'menu', id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error al eliminar el producto");
            }
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

    const saveEdit = async () => {
        try {
            const itemRef = doc(db, 'menu', editingId);
            await updateDoc(itemRef, {
                name: editForm.name,
                price: Number(editForm.price),
                description: editForm.description,
                image: editForm.image,
                category: editForm.category,
                discount: Number(editForm.discount),
                isAvailable: editForm.isAvailable,
                featured: editForm.featured,
                stock: Number(editForm.stock),
                limitedStock: editForm.limitedStock,
                isNew: editForm.isNew
            });
            setEditingId(null);
            setEditForm({});
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("Error al guardar cambios");
        }
    };

    const toggleAvailability = async (id) => {
        try {
            const item = menuItems.find(i => i.id === id);
            const itemRef = doc(db, 'menu', id);
            await updateDoc(itemRef, {
                isAvailable: !item.isAvailable
            });
        } catch (error) {
            console.error("Error al cambiar disponibilidad:", error);
        }
    };

    const toggleFeatured = async (id) => {
        try {
            const item = menuItems.find(i => i.id === id);
            const itemRef = doc(db, 'menu', id);
            await updateDoc(itemRef, {
                featured: !item.featured
            });
        } catch (error) {
            console.error("Error al cambiar destacado:", error);
        }
    };

    const calculateFinalPrice = (price, discount) => {
        return discount > 0 ? Math.round(price - (price * discount / 100)) : price;
    };

    const handleLogout = () => {
        signOut(auth);
    };

    // Nuevas funciones para mejoras
    const exportSalesToCSV = () => {
        const csvData = dailySales.map(sale => ({
            ID: sale.id,
            Fecha: sale.date,
            Total: sale.total,
            Items: sale.items.map(i => `${i.name} x${i.quantity}`).join('; '),
            Cliente: `${sale.customerName || ''} ${sale.customerLastName || ''}`.trim(),
            Telefono: sale.phone || '',
            Direccion: sale.address || '',
            Horario: sale.preferredTime || '',
            Pago: sale.paymentMethod || ''
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ventas-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getFilteredItems = () => {
        let items = menuItems;
        if (searchTerm) {
            items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (activeFilter !== 'all') {
            items = items.filter(item => item.category === activeFilter);
        }
        return items;
    };

    const getTopSellingProduct = () => {
        const productCounts = {};
        dailySales.forEach(sale => {
            sale.items.forEach(item => {
                productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            });
        });
        const topProduct = Object.entries(productCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
        return topProduct[0] || 'Ninguno';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-yellow-700">
                <div className="text-white text-xl font-semibold">Cargando datos de administrador...</div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-yellow-700 p-6">
                <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-md">
                    <h2 className="text-3xl font-extrabold text-yellow-900 mb-6 text-center select-none">
                        🔐 Acceso de Administrador
                    </h2>

                    <div className="space-y-4">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Correo Electrónico"
                            className="w-full px-5 py-3 border border-yellow-300 rounded-xl focus:ring-4 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
                            aria-label="Correo Electrónico"
                        />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Contraseña"
                            className="w-full px-5 py-3 border border-yellow-300 rounded-xl focus:ring-4 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
                            aria-label="Contraseña"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLogin();
                            }}
                        />
                        
                        <button 
                            onClick={handleLogin}
                            type="button"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold uppercase rounded-xl py-3 shadow-lg transition-transform transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-yellow-300 select-none"
                        >
                            Ingresar
                        </button>
                    </div>

                    {message && (
                        <p className={`mt-4 text-center font-semibold rounded-lg p-3 ${message.includes('Error') || message.includes('denegado') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    const filteredItems = getFilteredItems();

    return (
        <div className="min-h-screen bg-yellow-700 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">🍞 Panel Admin - Entrepanes</h1>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full py-2 px-6 shadow-lg transition-all"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Alertas de Stock Bajo */}
                {lowStockAlerts.length > 0 && (
                    <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-xl">
                        <h3 className="font-bold">⚠️ Alertas de Stock Bajo</h3>
                        <ul>
                            {lowStockAlerts.map(item => (
                                <li key={item.id}>{item.name}: {item.stock} unidades restantes</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Agregar Producto */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus /> Agregar Nuevo Producto
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
                            <option value="miga">Sándwiches de Miga</option>
                            <option value="pebete">Pebetes</option>
                            <option value="bebidas">Bebidas</option>
                            <option value="postres">Postres</option>
                            <option value="otros">Otros</option>
                        </select>
                        
                        <input 
                            type="number" 
                            placeholder="Descuento (%)"
                            value={newProduct.discount}
                            onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
                            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                        />
                        
                        <input 
                            type="number" 
                            placeholder="Stock"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                        />
                        
                                                <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={newProduct.limitedStock}
                                onChange={(e) => setNewProduct({...newProduct, limitedStock: e.target.checked})}
                                className="w-5 h-5"
                                id="limited-stock-checkbox"
                            />
                            <label htmlFor="limited-stock-checkbox" className="text-sm font-medium">Stock Limitado</label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={newProduct.featured}
                                onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})}
                                className="w-5 h-5"
                                id="featured-checkbox"
                            />
                            <label htmlFor="featured-checkbox" className="text-sm font-medium">⭐ Marcar como Destacado</label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={newProduct.isNew}
                                onChange={(e) => setNewProduct({...newProduct, isNew: e.target.checked})}
                                className="w-5 h-5"
                                id="is-new-checkbox"
                            />
                            <label htmlFor="is-new-checkbox" className="text-sm font-medium">🆕 Producto Nuevo</label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={newProduct.isAvailable}
                                onChange={(e) => setNewProduct({...newProduct, isAvailable: e.target.checked})}
                                className="w-5 h-5"
                                id="available-checkbox"
                            />
                            <label htmlFor="available-checkbox" className="text-sm font-medium">Producto Disponible</label>
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
                                onChange={(e) => handleImageUpload(e, false)}                            />
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
                        <p className={`mt-4 text-center font-semibold ${addProductMessage.includes('Éxito') || addProductMessage.includes('exitosamente') ? 'text-green-600' : 'text-red-600'}`}>
                            {addProductMessage}
                        </p>
                    )}
                </div>

                {/* Lista de Productos con Búsqueda y Filtros */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Productos del Menú ({filteredItems.length})</h2>
                    
                    {/* Búsqueda y Filtros */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search />
                            <input 
                                type="text" 
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <select 
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500"
                        >
                            <option value="all">Todas las Categorías</option>
                            <option value="miga">Sándwiches de Miga</option>
                            <option value="pebete">Pebetes</option>
                            <option value="bebidas">Bebidas</option>
                            <option value="postres">Postres</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    
                    {filteredItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            No hay productos que coincidan con tu búsqueda. ¡Agrega el primero! 🎉
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map(item => (
                                <div key={item.id} className={`border rounded-2xl overflow-hidden shadow-lg transition-all ${!item.isAvailable ? 'opacity-60' : ''}`}>
                                    {editingId === item.id ? (
                                        // Modo Edición
                                        <div className="p-4 bg-yellow-50">
                                            <input 
                                                type="text" 
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                                placeholder="Nombre"
                                            />
                                            <input 
                                                type="number" 
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                                placeholder="Precio"
                                            />
                                            <select 
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                            >
                                                <option value="miga">Sándwiches de Miga</option>
                                                <option value="pebete">Pebetes</option>
                                                <option value="bebidas">Bebidas</option>
                                                <option value="postres">Postres</option>
                                                <option value="otros">Otros</option>
                                            </select>
                                            <input 
                                                type="number" 
                                                placeholder="Descuento %"
                                                value={editForm.discount}
                                                onChange={(e) => setEditForm({...editForm, discount: e.target.value})}
                                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                            />
                                            <input 
                                                type="number" 
                                                placeholder="Stock"
                                                value={editForm.stock}
                                                onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                            />
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    type="checkbox"
                                                    checked={editForm.limitedStock}
                                                    onChange={(e) => setEditForm({...editForm, limitedStock: e.target.checked})}
                                                />
                                                <label className="text-sm">Stock Limitado</label>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    type="checkbox"
                                                    checked={editForm.featured}
                                                    onChange={(e) => setEditForm({...editForm, featured: e.target.checked})}
                                                />
                                                <label className="text-sm">⭐ Producto Destacado</label>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    type="checkbox"
                                                    checked={editForm.isNew}
                                                    onChange={(e) => setEditForm({...editForm, isNew: e.target.checked})}
                                                />
                                                <label className="text-sm">🆕 Producto Nuevo</label>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    type="checkbox"
                                                    checked={editForm.isAvailable}
                                                    onChange={(e) => setEditForm({...editForm, isAvailable: e.target.checked})}
                                                />
                                                <label className="text-sm">Producto Disponible</label>
                                            </div>
                                            <textarea 
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                                rows="2"
                                                placeholder="Descripción"
                                            />
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, true)}
                                                className="w-full px-3 py-2 border rounded-lg mb-2 text-sm"
                                            />
                                            {editForm.image && (
                                                <img src={editForm.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                                            )}
                                            <div className="flex gap-2">
                                                <button onClick={saveEdit} className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-1">
                                                    <Save /> Guardar
                                                </button>
                                                <button onClick={cancelEditing} className="flex-1 bg-gray-500 text-white py-2 rounded-lg flex items-center justify-center gap-1">
                                                    <X /> Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Modo Vista
                                        <>
                                            <div className="relative">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                                                ) : (
                                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                                                        Sin Imagen
                                                    </div>
                                                )}
                                                {item.discount > 0 && (
                                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                        -{item.discount}%
                                                    </div>
                                                )}
                                                {item.featured && (
                                                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                                                        ⭐ Destacado
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
                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-xs">
                                                        {item.category === 'miga' ? '🥪 Miga' : 
                                                         item.category === 'pebete' ? '🍔 Pebete' : 
                                                         item.category === 'bebidas' ? '🥤 Bebida' : 
                                                         item.category === 'postres' ? '🍰 Postre' : '📦 Otro'}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-600 text-sm mb-3">{item.description || 'Sin descripción'}</p>
                                                
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
                                                
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                        <span>Stock: {item.stock}</span>
                                                        {item.limitedStock && <span className="text-orange-600">Limitado</span>}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-2 mb-2">
                                                    <button 
                                                        onClick={() => toggleAvailability(item.id)}
                                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-sm ${item.isAvailable ? 'bg-yellow-500 text-white' : 'bg-gray-300'}`}
                                                    >
                                                        {item.isAvailable ? <Eye /> : <EyeOff />}
                                                        {item.isAvailable ? 'Visible' : 'Oculto'}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleFeatured(item.id)}
                                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-sm ${item.featured ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200'}`}
                                                    >
                                                        <Star />
                                                        {item.featured ? 'Destacado' : 'Normal'}
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => startEditing(item)}
                                                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-1"
                                                    >
                                                        <Edit /> Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteProduct(item.id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                                    >
                                                        <Trash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ventas del Día con Estadísticas */}
                <div className="bg-white rounded-3xl shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">📊 Ventas del Día ({dailySales.length} pedidos)</h2>
                        <button 
                            onClick={exportSalesToCSV}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            📄 Exportar CSV
                        </button>
                    </div>
                    
                    {/* Estadísticas Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-100 p-4 rounded-xl text-center">
                            <h3 className="font-bold text-green-800">Total Vendido</h3>
                            <p className="text-2xl font-extrabold text-green-600">${totalSalesToday.toFixed(0)}</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-xl text-center">
                            <h3 className="font-bold text-blue-800">Pedidos Hoy</h3>
                            <p className="text-2xl font-extrabold text-blue-600">{dailySales.length}</p>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-xl text-center">
                            <h3 className="font-bold text-purple-800">Producto Más Vendido</h3>
                            <p className="text-lg font-extrabold text-purple-600">{getTopSellingProduct()}</p>
                        </div>
                    </div>
                    
                    {dailySales.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            No hay ventas registradas hoy. ¡Esperemos que llegue la primera! 🎉
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dailySales.map(sale => (
                                <div key={sale.id} className="border rounded-xl p-4 bg-gray-50">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold">Pedido ID: {sale.id}</span>
                                        <span className="text-gray-600">{new Date(sale.timestamp.seconds * 1000).toLocaleTimeString()}</span>
                                    </div>
                                    
                                    {/* Mostrar datos del cliente si existen */}
                                    {(sale.customerName || sale.customerLastName || sale.phone || sale.address || sale.preferredTime || sale.paymentMethod) ? (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold text-blue-800 mb-2">📋 Datos del Cliente:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                {sale.customerName && <p><strong>Nombre:</strong> {sale.customerName}</p>}
                                                {sale.customerLastName && <p><strong>Apellido:</strong> {sale.customerLastName}</p>}
                                                {sale.phone && <p><strong>Teléfono:</strong> {sale.phone}</p>}
                                                {sale.address && <p><strong>Dirección:</strong> {sale.address}</p>}
                                                {sale.preferredTime && <p><strong>Horario Preferido:</strong> {sale.preferredTime}</p>}
                                                {sale.paymentMethod && <p><strong>Forma de Pago:</strong> {sale.paymentMethod}</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm mb-4">No hay datos adicionales del cliente para este pedido.</p>
                                    )}
                                    
                                    {/* Lista de items */}
                                    <ul className="mb-2">
                                        {sale.items.map((item, idx) => (
                                            <li key={idx} className="text-sm">
                                                {item.quantity} x {item.name} - ${item.subtotal.toFixed(0)}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="font-bold text-right">Total: ${sale.total.toFixed(0)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;