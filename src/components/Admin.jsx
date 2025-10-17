// src/components/Admin.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'; 
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';

function AdminPanel() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [adminMessage, setAdminMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    
    // Nuevos estados para agregar productos
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [addProductMessage, setAddProductMessage] = useState('');

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
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, name: doc.data().name, price: doc.data().price });
            });
            setMenuItems(items);
            if (items.length > 0) {
                setSelectedItem(items[0].id);
            }
        }, (error) => {
            console.error("Error al cargar el menú para el Admin:", error);
            setAdminMessage("Error al cargar lista del menú. Revise la conexión a Firestore.");
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

    const handleLogout = () => {
        signOut(auth);
    };

    // FUNCIÓN MODIFICADA: Actualizar precio directamente en Firestore
    const updateSandwichPrice = async () => {
        const itemId = selectedItem;
        const priceInput = document.getElementById('sandwich-price').value;
        const newPrice = Number(priceInput);

        if (!user || !itemId || priceInput === "" || isNaN(newPrice) || newPrice <= 0) {
             setAdminMessage("Por favor, selecciona un producto e introduce un precio numérico válido y positivo.");
             return;
        }
        
        setAdminMessage('Actualizando...');
        
        try {
            const itemRef = doc(db, 'menu', itemId);
            await updateDoc(itemRef, {
                price: newPrice
            });
            
            setAdminMessage(`Éxito: Precio actualizado correctamente`);
            document.getElementById('sandwich-price').value = ''; 
        } catch (error) {
            console.error("Error al actualizar precio:", error);
            setAdminMessage(`Error: ${error.message}`);
        }
    };

    // FUNCIÓN MODIFICADA: Agregar producto directamente en Firestore
    const addNewProduct = async () => {
        const name = newProductName.trim();
        const price = Number(newProductPrice);

        if (!user || !name || newProductPrice === "" || isNaN(price) || price <= 0) {
            setAddProductMessage("Por favor, introduce un nombre válido y un precio numérico positivo.");
            return;
        }

        setAddProductMessage('Agregando producto...');

        try {
            await addDoc(collection(db, 'menu'), {
                name: name,
                price: price
            });
            
            setAddProductMessage(`Éxito: Producto agregado correctamente`);
            setNewProductName('');
            setNewProductPrice('');
        } catch (error) {
            console.error("Error al agregar producto:", error);
            setAddProductMessage(`Error: ${error.message}`);
        }
    };

    // --- Renderizado ---

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
                <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-500 ease-in-out">
                    
                    <h2 className="text-3xl font-extrabold text-yellow-900 mb-6 text-center select-none">
                        Acceso de Administrador
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
        <div className="min-h-screen bg-yellow-700 p-8 sm:p-12">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold text-yellow-900">Panel de Administración</h1>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full py-2 px-6 shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                        Cerrar Sesión
                    </button>
                </div>
                
                <p className="text-gray-700 mb-10">Bienvenido, Administrador. Aquí puedes gestionar el menú.</p>
                
                {/* SECCIÓN: Agregar Producto */}
                <section className="bg-green-100 p-6 rounded-2xl shadow-inner mb-8">
                    <h3 className="text-2xl font-bold text-green-800 mb-4">Agregar Nuevo Producto</h3>
                    <div className="space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="new-product-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                            <input 
                                type="text" 
                                id="new-product-name"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                placeholder="Ej: Hamburguesa Clásica"
                                className="w-full px-4 py-2 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="new-product-price" className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                            <input 
                                type="number" 
                                id="new-product-price"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                                placeholder="Ej: 3000"
                                className="w-full px-4 py-2 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <button 
                            onClick={addNewProduct}
                            className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-2 px-6 shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                            Agregar Producto
                        </button>
                    </div>
                    {addProductMessage && (
                        <p className={`mt-4 font-semibold ${addProductMessage.includes('Éxito') ? 'text-green-600' : 'text-red-600'}`}>
                            {addProductMessage}
                        </p>
                    )}
                </section>

                {/* Sección: Actualizar Precio */}
                <section className="bg-yellow-100 p-6 rounded-2xl shadow-inner">
                    <h3 className="text-2xl font-bold text-yellow-800 mb-4">Actualizar Precio de Producto</h3>
                    <div className="space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="sandwich-select" className="block text-sm font-medium text-gray-700 mb-1">Producto a Actualizar</label>
                            <select 
                                id="sandwich-select"
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                className="w-full px-4 py-2 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 bg-white"
                            >
                                {menuItems.length === 0 && <option value="" disabled>Cargando productos...</option>}
                                {menuItems.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} (${item.price})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="sandwich-price" className="block text-sm font-medium text-gray-700 mb-1">Nuevo Precio ($)</label>
                            <input 
                                type="number" 
                                id="sandwich-price" 
                                placeholder="Ej: 2500"
                                className="w-full px-4 py-2 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <button 
                            onClick={updateSandwichPrice}
                            disabled={!selectedItem || menuItems.length === 0}
                            className={`w-full md:w-auto font-semibold rounded-xl py-2 px-6 shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 
                                ${!selectedItem ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900'}
                            `}
                        >
                            Actualizar Precio
                        </button>
                    </div>
                    {adminMessage && (
                        <p className={`mt-4 font-semibold ${adminMessage.includes('Éxito') ? 'text-green-600' : 'text-red-600'}`}>
                            {adminMessage}
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminPanel;