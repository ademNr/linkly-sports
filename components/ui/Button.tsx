import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    children: React.ReactNode;
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}: ButtonProps) {
    const baseClass = 'px-4 py-3 rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50';

    const variants = {
        primary: 'bg-black text-white',
        secondary: 'bg-gray-200 text-black',
        ghost: 'bg-transparent text-gray-700'
    };

    return (
        <button
            className={`${baseClass} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
