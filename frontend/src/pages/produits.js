import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Produits() {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const produitsPerPage = 5; // Nombre de produits à afficher par page
  const [searchTerm, setSearchTerm] = useState('');

  function navigate_to_nouveau_produit() {
    navigate('/nouveau_produit');
  }

  useEffect(()=>{
    setCurrentPage(1)
  }, [searchTerm])
  
  function navigate_to_modifier_produit(id){
    navigate('/detail_produit', { state: [id] })
  }
  useEffect(() => {
    axios.get('http://localhost:3001/produits').then((res) => {
      setProduits(res.data);
    });
  }, []);

  // Calcul du nombre total de pages

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
  const filteredProduits = produits.filter(
    (produit) =>
      produit.nom_produit.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // Calcul de l'index de début et de fin des produits à afficher sur la page actuelle
  const indexOfLastProduit = currentPage * produitsPerPage;
  const indexOfFirstProduit = indexOfLastProduit - produitsPerPage;
  const currentProduits = filteredProduits.slice(
    indexOfFirstProduit,
    indexOfLastProduit
  );

  const totalPages = Math.ceil(filteredProduits.length / produitsPerPage);

  return (
    <div style={{textAlign:'center'}}>
      <button className="bouton light" onClick={navigate_to_nouveau_produit}>
        Ajouter un nouveau produit
      </button>
      <input
        type="text"
        placeholder="Rechercher un produit"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="table light secondColor">
        <thead>
          <tr>
            <th className="header">Produits</th>
            <th className="header">Prix</th>
            <th className='header'>TVA</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentProduits.map((i, index) => (
            <tr key={index} className="item_facture">
              <td>{i["nom_produit"]}</td>
              <td>{i["prix"]}</td>
              <td>{i["tva"]}</td>
              <td><button className="bouton light" onClick={() => navigate_to_modifier_produit(i["pk_produits_id"])}>Détails</button></td>
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
}

export default Produits;
