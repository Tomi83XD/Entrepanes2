// App.jsx
import './App.css';
// Renombra Router a BrowserRouter para claridad, aunque el alias funciona
import { BrowserRouter, Route, Routes } from 'react-router-dom'; 
import Header from './components/Header';
import Body from './components/Body';
import HeaderBodyDivider from './components/HeaderBodyDivider';
import Catalogo from './components/Catalogo';
// Se asume que el AdminPanel también sirve como la página de Login
import AdminPanel from './components/Admin'; 


function App() {
    return (
        // Usamos BrowserRouter directamente, en lugar del alias Router
        <BrowserRouter> 
            <>
                <Header />
                <HeaderBodyDivider />
                <Routes> 
                    <Route path="/" element={<Body />} /> 
                    <Route path="/catalogo" element={<Catalogo />} /> 
                    
                    {/* ******************************************* */}
                    {/* NUEVA RUTA: El botón de Login dirige aquí */}
                    <Route path="/login" element={<AdminPanel />} /> 
                    {/* ******************************************* */}
                    
                </Routes>
            </>
        </BrowserRouter>
    );
}

if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/service-worker.js')
         .then(registration => console.log('SW registrado'))
         .catch(error => console.log('Error en SW:', error));
     }
     
export default App;