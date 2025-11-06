// App.jsx
import './App.css';
import { useState, useEffect } from 'react';  // Agrega estos imports para el estado offline
import { BrowserRouter, Route, Routes } from 'react-router-dom'; 
import Header from './components/Header';
import Body from './components/Body';
import HeaderBodyDivider from './components/HeaderBodyDivider';
import Catalogo from './components/Catalogo';
import AdminPanel from './components/Admin'; 

function App() {
    // Estado para detectar si está online
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // useEffect para escuchar cambios de conectividad
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <BrowserRouter> 
            <>
                {/* Banner de offline: Se muestra solo si no está online */}
                {!isOnline && (
                    <div className="bg-yellow-500 text-black p-4 text-center font-bold">
                        ⚠️ Estás offline. Algunas funciones pueden no estar disponibles. Conéctate para sincronizar pedidos.
                    </div>
                )}
                
                <Header />
                <HeaderBodyDivider />
                <Routes> 
                    <Route path="/" element={<Body />} /> 
                    <Route path="/catalogo" element={<Catalogo />} /> 
                    <Route path="/login" element={<AdminPanel />} /> 
                </Routes>
            </>
        </BrowserRouter>
    );
}

// Removí el registro manual de service worker aquí, ya que Vite PWA lo maneja automáticamente.
// Si lo dejas, podría causar conflictos, así que elimínalo.

export default App;