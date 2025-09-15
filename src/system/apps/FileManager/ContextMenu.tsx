import React, { useEffect } from 'react';
import { Icon, ICON_16 } from '@/system/ui/Icon';

type MenuItem = {
  label: string;
  icon: string;
  action: () => void;
  separator?: boolean;
};

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  items: MenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  visible,
  items,
  onClose
}) => {
  useEffect(() => {
    const handleClick = () => {
      if (visible) onClose();
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div 
      className="fixed bg-white border border-gray-300 rounded shadow-lg py-1 z-50"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.separator && <hr className="my-1" />}
          <button
            className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              item.action();
              onClose();
            }}
          >
            <Icon name={item.icon} size={ICON_16} className="mr-2" />
            <span>{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
