import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "../style/nouveau_devis.css";
import { useLocation } from "react-router-dom";
import {useNavigate } from 'react-router-dom';

const NouveauDevis = () => {
  let id = useLocation().state[0]
  const [produits, setProduits] = useState([]);
  const [client, setClient] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false); // Product modal state
  const [showClientModal, setShowClientModal] = useState(false); // Client modal state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAdresseClient, setSelectedAdresseClient] = useState("");
  const [dateCreation, setDateCreation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const facturesPerPage = 5; // Nombre de factures à afficher par page
  const [dataLoaded, setDataLoaded] = useState(false); // Nouvel état pour le chargement des données
  const navigate = useNavigate();

  useEffect(() => {
    
    axios.get("http://localhost:3001/detail_devis", {params : {"id":id}}).then( res => {
        const now = new Date(res.data.date_creation)
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`; 
        setDateCreation(formattedDate);
        setSelectedProducts(res.data.produits)
        setSelectedClient(res.data)
        setDataLoaded(true); // Marquer les données comme chargées
        setSelectedAdresseClient(`${res.data.rue} ${res.data.numero}, ${res.data.code_postal} ${res.data.nom_commune}, ${res.data.pays}`)
    })
    axios.get("http://localhost:3001/produits").then((res) => {
      let nom_produit = [];
      for (let i = 0; i < res.data.length; i += 1) {
        nom_produit.push({
          "nom" :res.data[i]["nom_produit"],
          "prix" : res.data[i]["prix"],
          "id":res.data[i]["pk_produits_id"],
        });
      }
      setProduits(nom_produit);
    });
    axios.get("http://localhost:3001/commandes").then((res) => {
      let arrayclient = res.data.map((data) => ({
        id: data.pk_client_id,
        nom_societe: data.nom_societe,
        nom_commune: data.nom,
        code_postal: data.code_postal,
        pays: data.pays,
        region: data.region,
        rue: data.rue,
        numero: data.numero,
        nom_commande:data.nom_commande,
        description:data.description,
        pk_commande_id:data.pk_commande_id,
      }));
      setClient(arrayclient);
    });
  }, []);
  
  function changeDevis(e) {
    let jsonToSend ={
      "prix_total": Number(calculateTotalPrice()),
      "commande_id":Number(selectedClient.pk_commande_id),
      "devis_numero":Number(selectedClient.devis_numero),
      "produits":selectedProducts,
      "id":id,
    }
    axios.post("http://localhost:3001/modifier_devis", jsonToSend).catch(
      err => console.warn(err)
)
  navigate('/historique_devis');  
  }

  function openProductModal() {
    setShowProductModal(true);
  }

  function closeProductModal() {
    setShowProductModal(false);
  }

  function openClientModal() {
    setShowClientModal(true);
  }

  function closeClientModal() {
    setShowClientModal(false);
  }

  function handleProductSelection() {
    setSelectedProducts((prevSelectedProducts) => [
      ...prevSelectedProducts,
      {
        product: selectedProduct,
        quantity: selectedQuantity,
        price: produits.find((p) => p.nom === selectedProduct)?.prix || 0,
        id: produits.find((p) => p.nom === selectedProduct)?.id || 0,
      },
    ]);
    setSelectedProduct("");
    setSelectedQuantity(0);
    closeProductModal();
  }

  function handleClientSelection(selectedClient) {
    setSelectedClient(selectedClient);
    setSelectedAdresseClient(
      `${selectedClient.rue} ${selectedClient.numero}, ${selectedClient.code_postal} ${selectedClient.nom_commune}, ${selectedClient.pays}`
    );
    closeClientModal();
  }

  const totalPages = Math.ceil(client.length / facturesPerPage);

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

    const indexOfLastCommande = currentPage * facturesPerPage;
    const indexOfFirstCommande = indexOfLastCommande - facturesPerPage;
    const currentCommandes = client.slice(indexOfFirstCommande, indexOfLastCommande);

    function calculateTotalPrice() {
      return selectedProducts.reduce((total, product) => {
        const productPrice = parseFloat(product.price) || 0;
        const productQuantity = parseInt(product.quantity) || 0;
        return total + productPrice * productQuantity;
      }, 0);
    }
    
  return (
    <div className="container">
      <form className="form_devis secondColor light">
        <h2>Modifier un devis :</h2>
        <label>Numéro du devis : 00{dataLoaded ? selectedClient.devis_numero : ""}/{dataLoaded ? selectedClient.annee : ""}</label>
        <button className="bouton light" type="button" onClick={openClientModal}>Choisir un travail</button>

        {selectedClient && (
          <div>
            <span>Travail choisi: {selectedClient.nom_commande}</span>
            <br/>
            <span>Client choisi: {selectedClient.nom_societe}</span>
          </div>
        )}
{/*         <label>Description :</label>
        <textarea/> */}
        <div className="produits_detail">
            <h3>Récapitulatif des produits :</h3>
            <ul>
                {selectedProducts.map((product, index) => (
                <li key={index}>
                    Produit: {product.product}, Quantité: {product.quantity}, Prix: {product.price} €
                </li>
                ))}
                <li>Total: {calculateTotalPrice()} €</li>
            </ul>
        </div>
        <button className="bouton light" type="button" onClick={openProductModal}>Ajouter un produit</button>
        <button className="button_submit bouton light" onClick={changeDevis}>
          Valider
        </button>
      </form>

      <div className="apercu_devis">
        <div className="entete">
            <span>Date de création : {dateCreation}</span>
            <span className="client_address">{selectedAdresseClient}</span>
            <h1 className="titre">
                Devis numéro 00{dataLoaded ? selectedClient.devis_numero : ""}/{dataLoaded ? selectedClient.annee : ""} pour le client {selectedClient ? selectedClient.nom_societe : ""}
            </h1>
            </div>
            <div className="produits_detail">
            <h3>Récapitulatif des produits :</h3>
            <ul>
              {selectedProducts.map((product, index) => (
                <li key={index}>
                  Produit: {product.product}, Quantité: {product.quantity}, Prix: {product.price} €
                </li>
              ))}
              <li>Total: {calculateTotalPrice()} €</li>
            </ul>
            </div>
            <div className="signature">
            <span>Signature :</span>
        </div>
      </div>

      <Modal
        isOpen={showProductModal}
        onRequestClose={closeProductModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            padding: "20px",
            borderRadius: "4px",
          },
        }}
        contentLabel="Product Modal"
      >
        <h2>Choisir un produit et une quantité</h2>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Choisissez un produit à ajouter</option>
          {produits.map((product, index) => (
            <option key={index} value={product.nom}>
              {product.nom} - {product.prix} €
            </option>
          ))}
        </select>
        <div>
          <label>Quantité : </label>
          <input
            type="number"
            min="1"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(e.target.value)}
          />
        </div>
        <button className="bouton light" onClick={handleProductSelection}>Valider</button>
      </Modal>
      <Modal
          isOpen={showClientModal}
          onRequestClose={closeClientModal}
          style={{
              overlay: {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1000,
              },
              content: {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "50%",
                  padding: "20px",
                  borderRadius: "4px",
                  height: "50%"
              },
          }}
          contentLabel="Client Modal"
      >
      <h2>Choisir un travail</h2>
          <table>
              <thead>
                  <tr>
                      <th>Nom du travail</th>
                      <th>Nom de la société</th>
                      <th>Description</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  {currentCommandes.map((i, index) => (
                      <tr key={index}>
                          <td>{i.nom_commande}</td>
                          <td>{i.nom_societe}</td>
                          <td>{i.description}</td>
                          <td>
                              <button
                                  className="bouton light" 
                                  type="button"
                                  onClick={() => handleClientSelection(i)}
                              >
                                  Sélectionner
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        <div className='pagination'>
          <button className="bouton light" onClick={goToPreviousPage}>Page précédente</button>
          <button className="bouton light" onClick={goToFirstPage}>1</button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button className="bouton light" onClick={goToLastPage}>{totalPages}</button>
          <button className="bouton light" onClick={goToNextPage}>Page suivante</button>
        </div>
      </Modal>

    </div>
    );
};
            
export default NouveauDevis;
