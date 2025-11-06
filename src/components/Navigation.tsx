"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NavbarMenu, NavbarMenuItem } from './NavbarMenu';
import { 
  Home, 
  ShoppingBag, 
  BookOpen, 
  Mail, 
  Menu, 
  X,
  User,
  Search,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white/70 backdrop-blur-md'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm lg:text-base">A</span>
              </div>
              <h1 className={`text-xl lg:text-2xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-gray-900'
              }`}>
                APHRODITE
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 h-full items-center">
              <NavbarMenu className="gap-8">
                <NavbarMenuItem href="#home">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </NavbarMenuItem>
                <NavbarMenuItem href="#sellers">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Shop
                </NavbarMenuItem>
                <NavbarMenuItem href="#news">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Blog
                </NavbarMenuItem>
                <NavbarMenuItem href="#contact">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
                </NavbarMenuItem>
              </NavbarMenu>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <motion.button
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Wishlist */}
              <motion.button
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="h-5 w-5" />
              </motion.button>

              {/* Cart */}
              <motion.button
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.button>

              {/* User */}
              <motion.button
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-5 w-5" />
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={handleMobileMenuToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`lg:hidden ${isScrolled ? 'bg-white' : 'bg-white'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            height: isMobileMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-6 space-y-4">
            <motion.a
              href="#home"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isScrolled 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5" />
                <span className="font-medium">Home</span>
              </div>
            </motion.a>
            
            <motion.a
              href="#sellers"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isScrolled 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag className="h-5 w-5" />
                <span className="font-medium">Shop</span>
              </div>
            </motion.a>
            
            <motion.a
              href="#news"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isScrolled 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Blog</span>
              </div>
            </motion.a>
            
            <motion.a
              href="#contact"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isScrolled 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Contact</span>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </motion.nav>
    </>
  );
};

export default Navigation;
