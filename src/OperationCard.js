// src/OperationCard.js
import React, { useState, useEffect } from 'react';

function OperationCard({ ipAddress }) {
  const [operations, setOperations] = useState([]);

  // Simulate fetching operation data
  useEffect(() => {
    const intervalId = setInterval(() => {
      const operation = `Operation ${Math.floor(Math.random() * 100)} completed`;
      setOperations(prevOps => [...prevOps, operation]);
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="operation-card">
      <ul>
        {operations.map((op, index) => (
          <li key={index}>{op}</li>
        ))}
      </ul>
    </div>
  );
}

export default OperationCard;
