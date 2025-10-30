import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseClasses = 'bg-[#1a183d]/50 border border-[#4d4a8f] rounded-2xl p-6 shadow-lg transition-all duration-300';
  const interactiveClasses = onClick ? 'cursor-pointer hover:border-[#00ff00] hover:shadow-[#00ff00]/20' : '';
  
  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;