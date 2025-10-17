import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'; 
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

// Iconos simples con emojis
const Trash2 = () => <span>🗑️</span>;
const Edit = () => <span>✏️</span>;
const Save = () => <span>💾</span>;
const X = () => <span>❌</span>;
const Eye = () => <span>👁️</span>;
const EyeOff = () => <span>🚫</span>;
const Plus = () => <span>➕</span>;
const Star = () => <span>⭐</span>;

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
        featured: false // Cambiado de hasOffer a featured
    });
    
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [addProductMessage, setAddProductMessage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    
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
                    featured: docSnap.data().featured || false
                });
            });
            setMenuItems(items);
        }, (error) => {
            console.error("Error al cargar el menú:", error);
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
                featured: newProduct.featured
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
                featured: false
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
                featured: editForm.featured
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
                        <p className={`mt-4 text-center font-semibold ${addProductMessage.includes('Éxito') || addProductMessage.includes('exitosamente') ? 'text-green-600' : 'text-red-600'}`}>
                            {addProductMessage}
                        </p>
                    )}
                </div>

                {/* Lista de Productos */}
                <div className="bg-white rounded-3xl shadow-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Productos del Menú ({menuItems.length})</h2>
                    
                    {menuItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            No hay productos agregados todavía. ¡Agrega el primero! 🎉
                        </div>
                    ) : (
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
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    type="checkbox"
                                                    checked={editForm.featured}
                                                    onChange={(e) => setEditForm({...editForm, featured: e.target.checked})}
                                                />
                                                <label className="text-sm">⭐ Producto Destacado</label>
                                            </div>
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
            </div>
        </div>
    );
}

export default AdminPanel;