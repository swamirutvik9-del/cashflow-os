import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, PieChart, Wallet, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Overview', path: '/', icon: LayoutDashboard },
        { name: 'AI CFO', path: '/chat', icon: MessageSquare },
        { name: 'Transactions', path: '/transactions', icon: Wallet },
        { name: 'Reports', path: '/reports', icon: PieChart },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMenu}
                className="fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg lg:hidden shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-slate-900 shadow-2xl z-50 text-slate-300 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Brand Section */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <h1 className="text-xl font-semibold text-white tracking-tight">CashFlow OS</h1>
                    </div>
                    {/* Mobile Close Button inside Sidebar (Optional) */}
                </div>

                <div className="mt-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-8 mb-2">Menu</p>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                                <span className="font-medium">{link.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Section */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="text-slate-400 hover:text-white transition-colors p-2"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
