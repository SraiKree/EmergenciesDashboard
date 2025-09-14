import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Siren, UserCircle2, MessageSquareWarning, MapPin, Clock, Map as MapIcon, CheckCircle } from 'lucide-react';

// Define the shape of a single alert object to be used as a type
interface SosAlert {
  userId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  message?: string;
}

// Update the props interface
interface SosDashboardProps {
  alerts: SosAlert[];
  onActionTaken: (alert: SosAlert) => void;
}

// --- Ground-Up Animation Variants ---
// This defines a simple, clean "pop-in" effect.
const itemVariants = {
  // State before the card enters
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  // State when the card is visible
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      // THE TYPESCRIPT FIX: 'as const' tells TypeScript this is the literal
      // string 'spring', not any generic string.
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
    },
  },
  // State when the card is removed
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
    },
  },
};
// --- END of variants ---


export default function SosDashboard({ alerts, onActionTaken }: SosDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="bg-gray-900 text-gray-200 fixed inset-0 font-sans flex flex-col" 
         style={{ background: 'radial-gradient(circle at top, #1a1a2a 0%, #0f0f14 100%)' }}>
      <style>{`
        @keyframes pulse-live {
          0%, 100% { transform: scale(1); box-shadow: 0 0 5px #ef4444, 0 0 10px #ef4444; }
          50% { transform: scale(1.1); box-shadow: 0 0 15px #ef4444, 0 0 25px #ef4444; }
        }
        .live-indicator::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background-color: #ef4444;
          border-radius: 50%;
          animation: pulse-live 1.5s infinite;
        }
      `}</style>

      {/* Header */}
      <header className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-4 sm:px-6 lg:px-8 border-b-2 border-red-500/20">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-4">
            <span className="relative w-10 h-10 flex items-center justify-center live-indicator"></span>
            LIVE SOS DASHBOARD
          </h1>
          <p className="text-red-300/70 mt-1">Real-time alert monitoring system engaged.</p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
            <p className="text-xl font-mono bg-black/30 px-4 py-2 rounded-md border border-gray-700">{currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p className="text-xs text-gray-400 mt-1">{currentTime.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
            <ShieldCheck size={64} className="mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold">ALL SYSTEMS NORMAL</h2>
            <p className="mt-2">Standing by for incoming alerts. The dashboard is live and listening.</p>
          </div>
        ) : (
          // THE CORE FIX: This is now a regular 'div', not 'motion.div'.
          // It has NO animation props. Its only job is to be a CSS Grid container.
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {alerts.map((alert) => (
                // THE CORE FIX: The 'layout' prop is REMOVED from the card.
                // The card is now ONLY responsible for its own pop-in/out animation.
                <motion.div
                  key={`${alert.userId}-${alert.timestamp}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-gray-800/50 backdrop-blur-sm border border-red-500/40 rounded-lg shadow-lg shadow-red-900/20 hover:border-red-400 hover:shadow-red-700/30 transition-all duration-300 flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Siren className="text-red-500 animate-pulse" />
                      <h3 className="font-bold text-lg text-red-400">INCOMING ALERT</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-grow">
                    {[
                      { icon: <UserCircle2 className="text-gray-400 mt-1 flex-shrink-0" />, label: 'User ID', value: alert.userId, mono: true },
                      { icon: <MessageSquareWarning className="text-gray-400 mt-1 flex-shrink-0" />, label: 'Message', value: alert.message || 'No message provided' },
                      { icon: <MapPin className="text-gray-400 mt-1 flex-shrink-0" />, label: 'Last Known Location', value: `${alert.location.latitude}, ${alert.location.longitude}`, mono: true },
                      { icon: <Clock className="text-gray-400 mt-1 flex-shrink-0" />, label: 'Timestamp', value: new Date(alert.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) }
                    ].map(item => (
                      <div className="flex items-start gap-3" key={item.label}>
                        {item.icon}
                        <div>
                          <p className="text-sm text-gray-400">{item.label}</p>
                          <p className={`text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 mt-auto border-t border-red-500/20 flex flex-col gap-3">
                    <button 
                      className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                    >
                      <MapIcon size={20} strokeWidth={2.5} />
                      View on Map
                    </button>
                    <button 
                      onClick={() => onActionTaken(alert)}
                      className="w-full bg-green-600/80 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                    >
                      <CheckCircle size={20} strokeWidth={2.5} />
                      Action Taken
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

