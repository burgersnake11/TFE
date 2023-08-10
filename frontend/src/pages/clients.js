import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 5; // Nombre de clients à afficher par page
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  function navigate_to_nouveau_client() {
    navigate('/nouveau_client');
  }

  useEffect(() => {
    axios.get('http://localhost:3001/clients').then((res) => {
      setClients(res.data);
    });
  }, []);

  function navigate_to_modifier_client(id){
    navigate('/detail_client', { state: [id] })
  }
  // Fonction pour afficher la première page
  const goToFirstPage = () => setCurrentPage(1);

  // Fonction pour afficher la dernière page
  const goToLastPage = () => setCurrentPage(totalPages);

  // Fonction pour afficher la page précédente
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fonction pour afficher la page suivante
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const filteredClients = clients.filter(
    (client) =>
      client.nom_societe.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Calcul de l'index de début et de fin des clients à afficher sur la page actuelle
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <div style={{textAlign:'center'}}>
      <button className="bouton light" onClick={navigate_to_nouveau_client}>
        Ajouter client
      </button>
      <input
        type="text"
        placeholder="Rechercher un client"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="table light secondColor">
        <thead>
          <tr>
            <th className="header">Client</th>
            <th className="header">Email</th>
            <th className="header">Numéro de téléphone</th>
            <th className="header">Adresse</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentClients.map((i, index) => (
            <tr key={index} className="item_facture">
              <td>{i["nom_societe"]}</td>
              <td>{i["email"]}</td>
              <td>0{i["fixe"] !== 0 ? i["fixe"] : i["gsm"]}</td>
              <td>{i["numero"] + " " + i["rue"] + " " + i["code_postal"] + " " + i["nom_commune"]+", "+i["pays"]}</td>
              <td><button className="bouton light" onClick={() => navigate_to_modifier_client(i["pk_client_id"])}>Détail</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Boutons de pagination */}
      <div className="pagination">
        <button className="bouton light" onClick={goToFirstPage}>Première page</button>
        <button className="bouton light" onClick={goToPreviousPage}>Page précédente</button>
        <span>Page {currentPage} sur {totalPages}</span>
        <button className="bouton light" onClick={goToNextPage}>Page suivante</button>
        <button className="bouton light" onClick={goToLastPage}>Dernière page</button>
      </div>
    </div>
  );
};

export default Clients;
