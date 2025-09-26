'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Modal context interface
interface ModalContextType {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  showModal: (title: string, content: ReactNode) => void;
  hideModal: () => void;
}

// Create context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Modal provider component
export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ReactNode>(null);

  const showModal = (title: string, content: ReactNode) => {
    setTitle(title);
    setContent(content);
    setIsOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const hideModal = () => {
    setIsOpen(false);
    document.body.style.overflow = ''; // Re-enable scrolling
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        hideModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <ModalContext.Provider value={{ isOpen, title, content, showModal, hideModal }}>
      {children}
      <Modal />
    </ModalContext.Provider>
  );
}

// Hook to use modal
export function useModal() {
  const context = useContext(ModalContext);
  
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  
  return context;
}

// Modal component
function Modal() {
  const { isOpen, title, content, hideModal } = useContext(ModalContext)!;

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      hideModal();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-black border border-white border-opacity-10 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white border-opacity-10">
              <h3 className="text-xl font-bold">{title}</h3>
              <button 
                onClick={hideModal}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {content}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Confirmation dialog component (to be used with the modal)
export function ConfirmationDialog({ 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false
}: { 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}) {
  const { hideModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    hideModal();
  };

  const handleCancel = () => {
    onCancel();
    hideModal();
  };

  return (
    <div>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 rounded-lg transition ${
            isDangerous 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-white text-black hover:bg-opacity-90'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}