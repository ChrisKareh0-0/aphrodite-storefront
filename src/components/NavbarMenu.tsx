"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface NavbarMenuItemProps {
  children: React.ReactNode;
  href: string;
  setActive?: (href: string) => void;
  active?: string | null;
  className?: string;
  isActive?: boolean;
  onMouseEnter?: () => void;
}

interface NavbarMenuProps {
  className?: string;
  children: React.ReactNode;
}

const NavbarMenu: React.FC<NavbarMenuProps> = ({ className, children, ...props }) => {
  const [active, setActive] = useState<string | null>(null);
  
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      onMouseLeave={() => setActive(null)}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<NavbarMenuItemProps>, {
          onMouseEnter: () => setActive((child as React.ReactElement<NavbarMenuItemProps>).props.href),
          setActive,
          active,
        })
      )}
    </div>
  );
};

const NavbarMenuItem: React.FC<NavbarMenuItemProps> = ({ 
  children, 
  href, 
  setActive, 
  active, 
  className,
  isActive 
}) => {
  const isItemActive = isActive || active === href;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <motion.div
      onMouseEnter={() => setActive && setActive(href)}
      className="relative"
    >
      <a 
        href={href} 
        onClick={handleClick}
        className="block"
      >
        <motion.p
          className={cn(
            "relative z-10 flex items-center space-x-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 px-3 py-2 rounded-lg cursor-pointer",
            className
          )}
          animate={{
            color: isItemActive ? "#000000" : "#6B7280",
          }}
        >
          {children}
        </motion.p>
      </a>
      {isItemActive && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-lg bg-gray-100"
          layoutId="activeBackground"
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            bounce: 0.2,
            duration: 0.6,
          }}
        />
      )}
    </motion.div>
  );
};

export { NavbarMenu, NavbarMenuItem };
