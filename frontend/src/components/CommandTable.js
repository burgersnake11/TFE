// CommandesTable.js

import React from "react";

const CommandesTable = ({ currentPage, itemsPerPage, client, handleClientSelection }) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <tbody>
      {client.slice(startIndex, endIndex).map((value, index) => (
        <tr key={index}>
          <td>{value.nom_commande}</td>
          <td>{value.nom_societe}</td>
          <td>{value.description}</td>
          <td>
            <button 
            className="bouton light"
              type="button"
              onClick={() => handleClientSelection(value)}
            >
              Sélectionner
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default CommandesTable;
