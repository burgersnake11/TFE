import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../style/historique_factures.css"

const Historique_factures = () => {
  const [factures, setFactures] = useState([]);
  const [paye, setPaye] = useState(0);
  const [nonPaye, setNonPaye] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const facturesPerPage = 5; // Nombre de factures à afficher par page
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [factureToDeleteId, setFactureToDeleteId] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFactures, setFilteredFactures] = useState([]);
  useEffect(()=>{
    setCurrentPage(1)
  }, [searchTerm])
  
  const applySearchFilter = () => {
    const filtered = factures.filter(facture => 
      facture.nom_societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(facture.facture_numero).includes(searchTerm)
    );
    setFilteredFactures(filtered);
  };

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, factures]);
  
  useEffect(() => {
    axios.get('https://54.37.9.74:3001/factures').then((res) => {
      setFactures(res.data.rows);
    });
    axios.get('https://54.37.9.74:3001/montant').then((res) => {
      if(res.data[0].payer===true){
        setPaye(Math.round((Number(res.data[0].htva6) + Number(res.data[0].htva21) + Number(res.data[0].htva6)*0.06 + Number(res.data[0].htva21)*0.21) *100)/100);
        setNonPaye(Math.round((Number(res.data[1].htva6) + Number(res.data[1].htva21) + Number(res.data[1].htva6)*0.06 + Number(res.data[1].htva21)*0.21) *100)/100);
      }
      else{
        setNonPaye(Math.round((Number(res.data[0].htva6) + Number(res.data[0].htva21) + Number(res.data[0].htva6)*0.06 + Number(res.data[0].htva21)*0.21) *100)/100);
        setPaye(Math.round((Number(res.data[1].htva6) + Number(res.data[1].htva21) + Number(res.data[1].htva6)*0.06 + Number(res.data[1].htva21)*0.21) *100)/100);
      }
      //setNonPaye(Number(res.data.rows[1]["prix_plein"]))
    });
  }, []);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredFactures.length / facturesPerPage);

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

  function setPayer(id){
    axios.post("https://54.37.9.74:3001/payer_facture", {"id":id}).catch(
        err => console.warn(err)
    )
    window.location.reload()
  }
  // Calcul de l'index de début et de fin des factures à afficher sur la page actuelle
  const indexOfLastFacture = currentPage * facturesPerPage;
  const indexOfFirstFacture = indexOfLastFacture - facturesPerPage;
  const currentFactures = filteredFactures.slice(indexOfFirstFacture, indexOfLastFacture);

  function navigate_to_facture(id) {
    navigate('/facture', { state: [id] });
  }
  function navigate_to_nouvelle_facture(){
    navigate('/nouvelle_facture')
  }
  function navigate_to_facture_devis(){
    navigate('/facture_devis')
  }
  
  function showPopup(id){
    setFactureToDeleteId(id)
    setShowConfirmation(true)
  }
  function archiver(){
      axios.post("https://54.37.9.74:3001/archiver_facture", {"id":factureToDeleteId}).catch(
        err => console.warn(err)
    )
    window.location.reload()
  }
  function formatteDate(date){
    const now = new Date(date)
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
    return formattedDate
  }
  return (
    <div style={{textAlign:'center'}}>
      <button className="light bouton" onClick={navigate_to_facture_devis}>
        Nouvelle facture à partir d'un devis
      </button>
      <input
        type="text"
        placeholder="Rechercher une facture"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className="light bouton" onClick={navigate_to_nouvelle_facture}>
        Nouvelle facture sans devis
      </button>
      <table className='table light secondColor'>
        <thead>
          <tr>
            <th className='header'>Client</th>
            <th className='header'>Numéro de factures</th>
            <th className='header'>Montant TVAC</th>
            <th className='header'>Echéance</th>
            <th className='header'>Payée</th>
            <th className='header'>Détails</th>
            <th className='header'>Archiver</th>
          </tr>
        </thead>
        <tbody>
          {currentFactures.map((i, index) => (
            <tr key={index} className='item_facture'>
              <td>{i['nom_societe']}</td>
              <td>{i['facture_numero']}</td>
              <td>{Math.round((Number(i['htva6']) + Number(i['htva21']) + Number(i['htva6'])*0.06 + Number(i['htva21'])*0.21)*100)/100}</td>
              <td>{formatteDate(i['date_limite'])}</td>
              <td>
                <input type="checkbox" onChange={() => setPayer(i['pk_facture_id'])} defaultChecked={i['payer']}></input></td>
              <td>
                <button className="bouton light" onClick={() => navigate_to_facture(i['pk_facture_id'])}>Détails</button>
              </td>
              <td>
                <button className="bouton light" onClick={() => showPopup(i['pk_facture_id'])}>Archiver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Boutons de pagination */}
      <div className='pagination'>
      <button className="bouton light" onClick={goToFirstPage}>Première page</button>
        <button className="bouton light" onClick={goToPreviousPage}>Page précédente</button>
        <span>Page {currentPage} sur {totalPages}</span>
        <button className="bouton light" onClick={goToNextPage}>Page suivante</button>
        <button className="bouton light" onClick={goToLastPage}>Dernière page</button>
      </div>

      <div className='totaux mainColor light'>
        <span>Total payé :</span> <span className='prix'>{paye}</span>
        <br />
        <span>Total non payé :</span> <span className='prix'>{nonPaye}</span>
        <br />
        <span>Total :</span> <span className='prix'>{Number(paye) + Number(nonPaye)}</span>
      </div>
      {showConfirmation && (
        <div className="confirmation-popup"> {/* Ajoutez la classe du popup de confirmation */}
          <div className="confirmation-popup-content"> {/* Ajoutez la classe du contenu du popup */}
            Êtes-vous sûr de vouloir archiver cette facture ?
            <div className="confirmation-popup-buttons"> {/* Ajoutez la classe des boutons du popup */}
              <button className="bouton light" onClick={() => setShowConfirmation(false)}>Annuler</button>
              <button className="bouton light" onClick={() => { archiver(factureToDeleteId); setShowConfirmation(false); }}>Oui</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historique_factures;
