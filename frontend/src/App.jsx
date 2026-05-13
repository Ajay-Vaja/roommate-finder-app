import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';

function App() {
  const { toasts } = useToasterStore();

  // Limit visible toasts to 1
  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= 1) // All except the first one (newest is usually at the start or end depending on reverseOrder)
      .forEach((t) => toast.dismiss(t.id)); // Dismiss them
  }, [toasts]);

  return (
    <div className="app">
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 80,
          zIndex: 999999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1b4b',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            fontSize: '14px',
            padding: '12px 24px',
            maxWidth: '350px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AppRoutes />
    </div>
  );
}

export default App;

