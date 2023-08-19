import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const commandsPerPage = 5; // Nombre de commandes à afficher par page
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommandes, setFilteredCommandes] = useState([]);

  function navigate_to_nouvelle_commande() {
    navigate('/nouveau_travail');
  }
  useEffect(()=>{
    setCurrentPage(1)
  }, [searchTerm])
  
  function navigate_to_to_do_list(commande_id, client, nom_commande) {
    navigate('/todolist', { state: [commande_id, client, nom_commande] });
  }

  const applySearchFilter = () => {
    const filtered = commandes.filter(commande => 
      commande.nom_societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.nom_commande.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommandes(filtered);
  };

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, commandes]);

  useEffect(() => {
    axios.get('https://studio-eventail.be:3001/commandes').then((res) => {
      setCommandes(res.data);
    });
  }, []);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredCommandes.length / commandsPerPage);

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

  // Calcul de l'index de début et de fin des commandes à afficher sur la page actuelle
  const indexOfLastCommande = currentPage * commandsPerPage;
  const indexOfFirstCommande = indexOfLastCommande - commandsPerPage;
  const currentCommandes = filteredCommandes.slice(indexOfFirstCommande, indexOfLastCommande);

  return (
    <>
    <div style={{textAlign:'center'}}>
      <button className="bouton light" onClick={navigate_to_nouvelle_commande}>
        Nouveau travail
      </button>
        <input
          type="text"
          placeholder="Rechercher un travail"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />


      <table className="table light secondColor">
        <thead>
          <tr>
            <th className="header">Nom du travail</th>
            <th className="header">Client</th>
            <th className="header">To do list</th>
          </tr>
        </thead>
        <tbody>
          {currentCommandes.map((i, index) => (
            <tr key={index} className="item_facture">
              <td>{i["nom_commande"]}</td>
              <td>{i["nom_societe"]}</td>
              <td>
                <button className="bouton light" onClick={() => navigate_to_to_do_list(i["pk_commande_id"], i["nom_societe"], i["nom_commande"])}>
                  To do list
                </button>
              </td>
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
    </>
  );
};

export default Commandes;
