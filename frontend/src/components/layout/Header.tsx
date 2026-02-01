"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Calendar, Moon, Sun } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  // Pages with dark hero backgrounds where white text is needed initially
  const isHeroPage = pathname === "/";

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Check for user on mount
    checkAuth();

    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    // Listen for storage changes (login/logout from other tabs)
    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);

    // Also check periodically for same-tab changes
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Determine if we should use dark text (for light backgrounds)
  const useDarkText = !isHeroPage || isScrolled;

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 lg:h-20" />
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        useDarkText
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span
              className={`text-xl font-bold ${useDarkText ? "text-gray-800" : "text-white"}`}
            >
              StayEase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/rooms"
              className={`font-medium transition-colors hover:text-orange-500 ${
                useDarkText ? "text-gray-800" : "text-white/90"
              }`}
            >
              Rooms
            </Link>
            <Link
              href="/#amenities"
              className={`font-medium transition-colors hover:text-orange-500 ${
                useDarkText ? "text-gray-800" : "text-white/90"
              }`}
            >
              Amenities
            </Link>
            <Link
              href="/#about"
              className={`font-medium transition-colors hover:text-orange-500 ${
                useDarkText ? "text-gray-800" : "text-white/90"
              }`}
            >
              About
            </Link>
            <Link
              href="/#contact"
              className={`font-medium transition-colors hover:text-orange-500 ${
                useDarkText ? "text-gray-800" : "text-white/90"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Dark Mode Toggle & Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                useDarkText
                  ? "text-gray-800 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/user/bookings"
                  className={`flex items-center gap-2 font-medium hover:text-orange-500 transition-colors ${
                    useDarkText ? "text-gray-800" : "text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-orange-500 text-white text-sm py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 font-medium hover:text-orange-500 transition-colors ${
                    useDarkText ? "text-gray-800" : "text-white"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`font-medium transition-colors hover:text-orange-500 ${
                    useDarkText ? "text-gray-800" : "text-white"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm py-2 px-4"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X
                className={`w-6 h-6 ${useDarkText ? "text-gray-900" : "text-white"}`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${useDarkText ? "text-gray-900" : "text-white"}`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col p-4 gap-4">
            <Link
              href="/rooms"
              className="text-gray-700 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Rooms
            </Link>
            <Link
              href="/#amenities"
              className="text-gray-700 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Amenities
            </Link>
            <Link
              href="/#about"
              className="text-gray-700 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/#contact"
              className="text-gray-700 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <hr className="my-2" />
            {user ? (
              <>
                <Link
                  href="/user/bookings"
                  className="text-gray-700 font-medium py-2 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-orange-500 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left text-gray-700 font-medium py-2 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-center py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
