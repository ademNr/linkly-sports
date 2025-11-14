import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children, className = '', ...props }) => {
    return (
        <select
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
            {...props}
        >
            {children}
        </select>
    );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`relative ${className}`}>
            {children}
        </div>
    );
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {children}
        </div>
    );
};

export const SelectItem: React.FC<{
    children: React.ReactNode;
    value: string;
    className?: string;
}> = ({ children, value, className = '' }) => {
    return (
        <option value={value} className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${className}`}>
            {children}
        </option>
    );
};