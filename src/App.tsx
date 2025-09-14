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
  const [alerts, setAlerts] = useState<SosAlert[]>([]);

  const handleActionTaken = (alertToRemove: SosAlert) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => 
      !(alert.userId === alertToRemove.userId && 
        alert.timestamp === alertToRemove.timestamp &&
        alert.location.latitude === alertToRemove.location.latitude &&
        alert.location.longitude === alertToRemove.location.longitude)
    ));
  };

  useEffect(() => {
    const handleNewAlert = (newAlertData: SosAlert) => {
      console.log("Dashboard received new alert:", newAlertData);
      
      setAlerts(prevAlerts => {
        // Check if we already have an alert from this user at this location
        const existingAlertIndex = prevAlerts.findIndex(alert => 
          alert.userId === newAlertData.userId &&
          Math.abs(alert.location.latitude - newAlertData.location.latitude) < 0.0001 && // About 11 meters
          Math.abs(alert.location.longitude - newAlertData.location.longitude) < 0.0001
        );

        // If we found an existing alert
        if (existingAlertIndex !== -1) {
          // Create a new array with the updated alert at the beginning
          const updatedAlerts = [...prevAlerts];
          updatedAlerts.splice(existingAlertIndex, 1);
          return [newAlertData, ...updatedAlerts];
        }

        // If no existing alert was found, add the new one at the beginning
        return [newAlertData, ...prevAlerts];
      });
    };

    socket.on("new-sos", handleNewAlert);

    return () => {
      socket.off("new-sos", handleNewAlert);
    };
  }, []);

  return (
    <SosDashboard alerts={alerts} onActionTaken={handleActionTaken} />
  );
}

export default App;

