import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import SosDashboard from './SosDashboard'; // Assuming SosDashboard.jsx is in the same directory

// Define the shape of an alert object
export interface SosAlert {
  userId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  message?: string;
}

// --- Socket Connection ---
const SOCKET_SERVER_URL = "http://localhost:3000"; // For production, use environment variables
const socket = io(SOCKET_SERVER_URL);

function App() {
  // State to hold all incoming alerts
  const [alerts, setAlerts] = useState<SosAlert[]>([]);

  // Handler for action taken on an alert (e.g., dismissed, acknowledged)
  const handleActionTaken = (alertToRemove: SosAlert) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => 
      // Only remove the exact alert that matches both userId AND timestamp
      !(alert.userId === alertToRemove.userId && 
        alert.timestamp === alertToRemove.timestamp &&
        alert.location.latitude === alertToRemove.location.latitude &&
        alert.location.longitude === alertToRemove.location.longitude)
    ));
  };

  useEffect(() => {
    // Handler for new alerts from the server
    const handleNewAlert = (newAlertData: SosAlert) => {
      console.log("Dashboard received new alert:", newAlertData);
      // Add the new alert to the beginning of the array
      setAlerts(prevAlerts => [newAlertData, ...prevAlerts]);
    };

    // Start listening for the "new-sos" event
    socket.on("new-sos", handleNewAlert);

    // Clean up the listener when the component unmounts
    return () => {
      socket.off("new-sos", handleNewAlert);
    };
  }, []); // Empty array ensures this effect runs only once on mount

  // The App component now simply renders the SosDashboard and passes the alerts data to it.
  return (
    <SosDashboard alerts={alerts} onActionTaken={handleActionTaken} />
  );
}

export default App;

