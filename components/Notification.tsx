import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 4000 }) => {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(onClose, 400); // Wait for animation to finish
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setExit(true);
    setTimeout(onClose, 400);
  };

  const baseClasses = "flex justify-between items-center p-4 rounded-lg shadow-lg text-white max-w-sm w-full transition-all duration-300 ease-in-out transform";
  const typeClasses = {
    success: "bg-green-500/90 backdrop-blur-sm border border-green-400/50",
    error: "bg-red-500/90 backdrop-blur-sm border border-red-400/50",
    info: "bg-blue-500/90 backdrop-blur-sm border border-blue-400/50",
  };

  const animationClasses = exit ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0";

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${animationClasses}`}>
      <span>{message}</span>
      <button onClick={handleClose} className="ml-4 font-bold text-xl opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

export default Notification;