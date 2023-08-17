import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HistoriqueDevis = () => {
  const [devis, setDevis] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const devisPerPage = 5; // Nombre de devis à afficher par page
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [devisToDeleteId, setDevisToDeleteId] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDevis, setFilteredDevis] = useState([]);
  useEffect(()=>{
    setCurrentPage(1)
  }, [searchTerm])
  
  function navigate_to_detail_devis(id) {
        navigate('/detail_devis', { state: [id] });
  }
  const applySearchFilter = () => {
    const filtered = devis.filter(devi => 
      devi.nom_societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devi.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devi.nom_commande.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDevis(filtered);
  };
  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, devis]);
    
  useEffect(() => {
    axios.get('https://54.37.9.74:3001/devis').then((res) => {
      setDevis(res.data);
    });
  }, []);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredDevis.length / devisPerPage);

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

  // Calcul de l'index de début et de fin des devis à afficher sur la page actuelle
  const indexOfLastDevis = currentPage * devisPerPage;
  const indexOfFirstDevis = indexOfLastDevis - devisPerPage;
  const currentDevis = filteredDevis.slice(indexOfFirstDevis, indexOfLastDevis);

  function navigate_to_nouveau_devis(){
    navigate('/nouveau_devis')
  }

  function showPopup(id){
    setDevisToDeleteId(id)
    setShowConfirmation(true)
  }
  function archiver(){
      axios.post("https://54.37.9.74:3001/archiver_devis", {"id":devisToDeleteId}).catch(
        err => console.warn(err)
    )
    window.location.reload()
  }

  return (
    <div style={{textAlign:'center'}}>
      <button className="light bouton" onClick={navigate_to_nouveau_devis}>
        Nouveau devis
      </button>
      <input
        type="text"
        placeholder="Rechercher un devis"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="table light secondColor">
        <thead>
          <tr>
            <th className="petit">Numéro de devis</th>
            <th className="grand">Société</th>
            <th className="grand">Client</th>
{/*             <th className="header">Description</th>
            <th className="version">Version</th> */}
            <th className="petit">Numéro du travail</th>
            <th className='grand'>Nom du travail</th>
            <th className="moyen">Détail</th>
            <th className='moyen'>Archiver</th>
          </tr>
        </thead>
        <tbody>
          {currentDevis.map((i, index) => (
            <tr key={index} className="item_facture">
              <td>{i["devis_numero"]}</td>
              <td>{i["nom_societe"]}</td>
              <td>{i["nom"]}</td>
{/*               <td>{i["description"]}</td>
              <td>{i["version"]}</td>
 */}              <td>{i["fk_commande_id"]}</td>
                  <td>{i["nom_commande"]}</td>
              <td>
                <button className="bouton light" onClick={() => navigate_to_detail_devis(i["pk_devis_id"])}>
                  Détail
                </button>
              </td>
              <td><button className="bouton light" onClick={() => showPopup(i["pk_devis_id"])}>
                  Archiver
                </button></td>
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
      {showConfirmation && (
        <div className="confirmation-popup"> {/* Ajoutez la classe du popup de confirmation */}
          <div className="confirmation-popup-content"> {/* Ajoutez la classe du contenu du popup */}
            Êtes-vous sûr de vouloir archiver ce devis ?
            <div className="confirmation-popup-buttons"> {/* Ajoutez la classe des boutons du popup */}
              <button className="bouton light" onClick={() => setShowConfirmation(false)}>Annuler</button>
              <button className="bouton light" onClick={() => { archiver(devisToDeleteId); setShowConfirmation(false); }}>Oui</button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default HistoriqueDevis;
