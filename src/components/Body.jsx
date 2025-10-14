// Body.jsx
import { Link } from 'react-router-dom'; // Importa Link
import amz from '../assets/amazon.png';
import flp from '../assets/flipkart.png';
import shoe from '../assets/imagen3.png';

export default function Body() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-yellow-700 p-4">
            {/* Hero Background Image with gradient overlay */}
            <img 
                src={shoe} 
                alt="Hero Background" 
                className='absolute inset-0 w-full h-full object-cover brightness-75 saturate-150 contrast-110' 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/80 via-yellow-700/60 to-yellow-900/80"></div>

            {/* Hero Content */}
            <div className='relative z-10 max-w-4xl w-full md:w-3/4 p-6 rounded-lg bg-yellow-900/60 backdrop-blur-sm shadow-lg text-center'>
                <h1 className='font-serif text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 select-none'>
                    SANDWICHERIA
                </h1>
                <h2 className='font-serif text-4xl md:text-6xl font-extrabold text-yellow-400 drop-shadow-lg mb-6 select-none'>
                    ENTRE PANES
                </h2>
                <p className='font-serif text-lg md:text-xl font-medium text-yellow-100 mb-8 select-none'>
                    ¡LOS MEJORES SANDWICHES DE CARLOS PAZ!
                </p>
                <div className="flex justify-center gap-6">
                    <Link to="/catalogo"> {/* Cambia el botón a un Link */}
                        <button className='bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-semibold uppercase font-serif px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300'>
                        Compra Ahora
                        </button>
                    </Link>
                    <Link to="/catalogo"> {/* Cambia el botón a un Link */}
                        <button className='bg-transparent border-2 border-yellow-500 hover:border-yellow-400 text-yellow-300 hover:text-yellow-100 font-semibold uppercase font-serif px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300'>
                            Catalogo
                        </button>
                    </Link>
                    
                    
                </div>
            </div>
        </div>
    );
}
