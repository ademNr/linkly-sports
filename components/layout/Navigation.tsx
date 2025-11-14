'use client';

import { Home, Dumbbell, History, User, Bell } from 'lucide-react';

interface NavigationProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
    const NavButton = ({ page, icon: Icon, label }: { page: string; icon: any; label: string }) => {
        const isActive = currentPage === page;
        return (
            <button
                onClick={() => onNavigate(page)}
                className="flex-1 py-2 px-2 flex flex-col items-center justify-center transition-all relative"
            >
                {isActive ? (
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center mb-1">
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                ) : (
                    <Icon className="h-6 w-6 text-gray-400 mb-1" />
                )}
                <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {label}
                </span>
            </button>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 safe-area-bottom">
            <div className="max-w-md mx-auto">
                <div className="flex justify-around items-center py-2">
                    <NavButton page="home" icon={Home} label="Home" />
                    <NavButton page="history" icon={History} label="History" />
                    <button
                        onClick={() => onNavigate('workout')}
                        className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shadow-lg -mt-6 transition-transform active:scale-95"
                    >
                        <Dumbbell className="h-6 w-6 text-white" />
                    </button>
                    <NavButton page="notifications" icon={Bell} label="Notifications" />
                    <NavButton page="profile" icon={User} label="Profile" />
                </div>
            </div>
        </nav>
    );
}