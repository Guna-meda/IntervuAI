import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, TrendingUp, Target,
  LogOut, Menu, X, Sparkles
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { logout } from '../../firebase/auth';
  import { useUserStore } from '../../store/userStore';
import useAuthStore from '../../store/authStore';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  const { user: firebaseUser, mongoUser } = useAuthStore();
const { user } = useUserStore();

// 🔥 final user (priority order)
const finalUser = user || mongoUser || firebaseUser;

 const userInitial =
  finalUser?.displayName?.charAt(0)?.toUpperCase() ||
  finalUser?.profile?.fullName?.charAt(0)?.toUpperCase() ||
  finalUser?.email?.charAt(0)?.toUpperCase() ||
  "U";

const userName =
  finalUser?.displayName ||
  finalUser?.profile?.fullName ||
  finalUser?.email?.split("@")[0] ||
  "User";
  
  const navItems = [
    { href: '/overview', icon: BarChart2, label: 'Dashboard' },
    { href: '/intervuai', icon: Target, label: 'IntervuAI' },
    { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

 return (
  <>
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-40"
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-75"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 w-10 h-10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  IntervuAI
                </div>
                <div className="text-xs text-gray-500">powered by Veda</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.href;
            return (
              <motion.div key={idx} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <Link to="/profile">
            <motion.div
  className="flex items-center px-1 py-3 min-h-[52px] rounded-xl hover:bg-gray-100 cursor-pointer transition-all"
              whileHover={{ scale: 1.02 }}
            >
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
  {userInitial}
</div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="font-semibold px-4 text-gray-800">{userName}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          <motion.button
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all mt-2"
            whileHover={{ scale: 1.02, x: 4 }}
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="mt-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600 mx-auto"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </motion.aside>
  </>
);
}