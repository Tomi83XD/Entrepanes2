export default function HeaderBodyDivider() {
    return (
        <div className="w-full bg-yellow-600">
            {/* Divider with subtle wave shape and a warm darker color */}
            <svg
                className="block w-full"
                viewBox="0 0 1440 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0,40 C480,120 960,0 1440,80 L1440 100 L0 100 Z"
                    fill="#92400e" /* Tailwind yellow-800, warm and dark but not too bright */
                />
            </svg>
        </div>
    );
}
