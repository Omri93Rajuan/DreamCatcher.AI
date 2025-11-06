import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../providers/ThemeProvider";
import { useAuth } from "../../../providers/QueryProvider";
import Logo from "../logo/Logo";
export default function NavBar() {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    return (<nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-600 text-white">
      <div className="flex items-center justify-between px-8 py-3 max-w-7xl mx-auto">
        
        <div className="flex-shrink-0">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        
        <div className="flex-1 flex justify-center space-x-10 text-lg font-semibold tracking-wide">
          <Link to="/home" className="hover:text-red-400 transition-colors">
            Home
          </Link>
          <Link to="/about" className="hover:text-red-400 transition-colors">
            About
          </Link>
          <Link to="/store" className="hover:text-red-400 transition-colors">
            Store
          </Link>
          <div className="relative">
            <Link to="/checkout" className="hover:text-red-400 transition-colors">
              Cart
            </Link>
            {cartCount > 0 && (<div className="absolute -top-3 -right-6 bg-red-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                {cartCount}
              </div>)}
          </div>
        </div>

        
        <div className="flex items-center gap-4">
          {!user ? (<>
              <Link to="/login" className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-bold shadow-md">
                Login
              </Link>
              <Link to="/register" className="px-6 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition-colors font-bold shadow-md">
                Register
              </Link>
            </>) : (<>
              <span className="font-medium text-gray-300">
                Welcome, {user.firstName || user.email}
              </span>
              <button onClick={logout} className="px-6 py-2 rounded-md bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-colors font-bold shadow-md">
                Logout
              </button>
            </>)}
        </div>
      </div>
    </nav>);
}
