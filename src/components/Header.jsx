// Header.jsx
import { useState } from 'react';
// IMPORTANTE: Necesitas el componente Link para la navegación de React Router
import { Link } from 'react-router-dom'; 
import logo from '../assets/logo1.png'; // Asegúrate de que la ruta a tu logo sea correcta

export default function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleContactClick = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const modalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="flex flex-col md:flex-row items-center w-full p-4 bg-gradient-to-l from-yellow-800 to-yellow-600 shadow-lg">
            {/* Contenedor del logo: se mantiene a la izquierda */}
            <div className="w-full md:w-auto flex justify-center md:justify-start mb-4 md:mb-0">
                {/* Usar Link en el logo es una buena práctica para volver al inicio */}
                <Link to="/">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-24 md:h-24 rounded-lg border-4 border-orange-950 shadow-lg transition-transform transform hover:scale-105"
                    />
                </Link>
            </div>
            
            {/* Navegación */}
            <nav className="flex-grow flex justify-center">
                <ul className="flex flex-col md:flex-row mx-0 md:mx-2 font-medium items-center">
                    
                    {/* ENLACE HOME */}
                    <li className="p-2 flex justify-center">
                        <Link
                            to="/" 
                            className="w-28 h-10 flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        >
                            Home
                        </Link>
                    </li>
                    
                    {/* ENLACE CONTACTO */}
                    <li className="p-2 flex justify-center">
                        <button
                            onClick={handleContactClick}
                            className="w-28 h-10 flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        >
                            Contacto
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Modal para Contacto */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="contact-modal-title"
                >
                    <div
                        className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative"
                        onClick={modalContentClick}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label="Cerrar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 id="contact-modal-title" className="text-xl font-semibold mb-4 text-yellow-900">Contacto:</h2>
                        <p className="mb-2 text-gray-700"><strong>✉️E-mail:</strong> entrepanesvcp@Gmail.com</p>
                        <p className="text-gray-700"><strong>📸Instagram:</strong> @Entrepanes_VCP</p>
                    </div>
                </div>
            )}
        </div>
    );
}