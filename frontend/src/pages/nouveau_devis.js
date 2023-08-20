import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "../style/nouveau_devis.css";
import {useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

const NouveauDevis = () => {
  const [produits, setProduits] = useState([]);
  const [client, setClient] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false); // Product modal state
  const [showClientModal, setShowClientModal] = useState(false); // Client modal state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(undefined);
  const [selectedDevisNumero, setSelectedDevisNumero] = useState(0);
  const [selectedAdresseClient, setSelectedAdresseClient] = useState("");
  const [dateCreation, setDateCreation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const facturesPerPage = 5; // Nombre de factures à afficher par page
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [showMailModal, setShowMailModal] = useState(false);
  const [subject, setSubject] = useState("Devis");
  const [message, setMessage] = useState("Madame, Monsieur,\r\nVeuillez trouver en pièce jointe votre devis.\r\nBien cordialement,\r\nStudio éventail.");
  const [text, setText] = useState('');

  const handleTextareaChange = (event) => {
    setText(event.target.value);
  };
  useEffect(()=>{
    setCurrentPage(1)
  }, [searchTerm])
  useEffect(()=>{
    setCurrentPage2(1)
  }, [searchTerm2])
  
  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    setDateCreation(formattedDate);
    axios.get("https://studio-eventail.be:3001/devis_numero").then((res) => {
      setSelectedDevisNumero(res.data.rows[0].max+1)
    })
    axios.get("https://studio-eventail.be:3001/produits").then((res) => {
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
    axios.get("https://studio-eventail.be:3001/commandes").then((res) => {
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
        email:data.email,
      }));
      setClient(arrayclient);
    });
  }, []);
  
  const applySearchFilter = () => {
    const filtered = client.filter(commande => 
      commande.nom_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.nom_societe.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommandes(filtered);
  };
  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, client]);
    
  const applySearchFilter2 = () => {
    const filtered = produits.filter(Produit => 
      Produit.nom.toLowerCase().includes(searchTerm2.toLowerCase())
    );
    setFilteredProduits(filtered);
  };
  useEffect(() => {
    applySearchFilter2();
  }, [searchTerm2, produits]);

  function changeDevis(e) {
    let jsonToSend ={
      "prix_total": calculateTotalPrice(),
      "fk_commande_id":selectedClient.pk_commande_id,
      "devis_numero":selectedDevisNumero,
      "produits":selectedProducts,
      "descripiton":text,
    }
    axios.post("https://studio-eventail.be:3001/devis", jsonToSend).catch(
      err => console.warn(err)
)
  navigate('/historique_devis');  
}

  function openProductModal() {
    setSearchTerm2("")
    setCurrentPage2(1)
    setShowProductModal(true);
  }

  function closeProductModal() {
    setShowProductModal(false);
  }

  function openClientModal() {
    setSearchTerm("")
    setShowClientModal(true);
  }

  function closeClientModal() {
    setShowClientModal(false);
  }

  function handleProductSelection() {
    setSelectedProducts((prevSelectedProducts) => [
      ...prevSelectedProducts,
      {
        product: selectedProduct.nom,
        quantity: selectedQuantity,
        price: selectedProduct.prix || 0,
        id: selectedProduct.id || 0,
      },
    ]);
    setSelectedProduct("");
    setSelectedQuantity(1);
    closeProductModal();
  }

  function handleClientSelection(selectedClient) {
    setSubject("Devis - " + selectedClient.nom_commande)
    setSelectedClient(selectedClient);
    setSelectedAdresseClient(
      `${selectedClient.rue} ${selectedClient.numero}, ${selectedClient.code_postal} ${selectedClient.nom_commune}, ${selectedClient.pays}`
    );
    closeClientModal();
  }
  const totalPages2 = Math.ceil(filteredProduits.length / facturesPerPage);

  // Fonction pour afficher la première page
  const goToFirstPage2 = () => setCurrentPage2(1);

  // Fonction pour afficher la dernière page
  const goToLastPage2 = () => setCurrentPage2(totalPages2);

  // Fonction pour afficher la page précédente
  const goToPreviousPage2 = () => {
    if (currentPage2 > 1) {
      setCurrentPage2(currentPage2 - 1);
    }
  };

  // Fonction pour afficher la page suivante
  const goToNextPage2 = () => {
    if (currentPage2 < totalPages2) {
      setCurrentPage2(currentPage2 + 1);
    }
  };
  const totalPages = Math.ceil(filteredCommandes.length / facturesPerPage);

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
  const currentCommandes = filteredCommandes.slice(indexOfFirstCommande, indexOfLastCommande);

  const indexOfLastProduit = currentPage2 * facturesPerPage;
  const indexOfFirstProduit = indexOfLastProduit - facturesPerPage;
  const currentProduits = filteredProduits.slice(indexOfFirstProduit, indexOfLastProduit);

  function calculateTotalPrice() {
    return selectedProducts.reduce((total, product) => {
      const productPrice = parseFloat(product.price) || 0;
      const productQuantity = parseFloat(product.quantity) || 0;
      return Math.round((total + productPrice * productQuantity)*100)/100;
    }, 0);
  }
  
  function supprimerProduit(e, id){
    let array = selectedProducts.filter(objet => objet.id !== id);
    setSelectedProducts(array)
    e.preventDefault()
  }

  const sendPDFToBackend = async (pdfBlob) => {
    /*       const blobUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = 'apercu.pdf'; // Nom du fichier PDF
          link.click();
          URL.revokeObjectURL(blobUrl); */
    
          const formData = new FormData();
          formData.append('pdf', pdfBlob, 'apercu.pdf');
          formData.append('email', selectedClient.email)
          formData.append('sujet', subject)
          formData.append('message', message)
          try {
            axios.post('https://studio-eventail.be:3001/mail_facture', formData);
          } catch (error) {
            console.error('Erreur lors de l\'envoi du PDF', error);
          }
          changeDevis()
        };
    
        const generatePDF = async () => {
          const element = document.getElementById('apercu_devis');
          const pdfOptions = {
            margin: 10,
            filename: 'apercu.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          };
        
          const pdfBlob = await html2pdf().from(element).set(pdfOptions).output('blob'); // Utilisation de la méthode 'blob' pour obtenir un Blob
        
          // Maintenant, vous pouvez procéder à l'envoi du PDF au backend via Axios
          sendPDFToBackend(pdfBlob);
        };    
        
        const handleGenerateAndSend = async () => {
          const pdfBlob = await generatePDF();
          closeMailModal()
          sendPDFToBackend(pdfBlob);
        };
        
        function openMailModal(e) {
          e.preventDefault()
          setShowMailModal(true);
        }
      
        function closeMailModal() {
          setShowMailModal(false);
        }
  return (
    <div className="container">
      <form className="form_devis secondColor light">
        <h2>Modifier un devis :</h2>
        <label>Numéro du devis : 00{selectedDevisNumero}/{ new Date().getFullYear()}</label>
        <button className="bouton light" type="button" onClick={openClientModal}>Choisir un travail</button>

        {selectedClient && (
          <div>
            <span>Travail choisi: {selectedClient.nom_commande}</span>
            <br/>
            <span>Client choisi: {selectedClient.nom_societe}</span>
          </div>
        )}
        <label>Description : </label>
        <textarea
          rows={10}
          cols={40}
          value={text}
          onChange={handleTextareaChange}
        />        
        <div className="produits_detail">
            <h3>Récapitulatif des produits :</h3>
            <ul>
              {selectedProducts.map((product, index) => (
                <li key={index}>
                  Produit: {product.product}, Quantité: {product.quantity}, Prix: {Math.round(product.price*100)/100} € 
                  <button className="bouton light" onClick={(e) => supprimerProduit(e, product.id)}>Supprimer</button>
                </li>
              ))}
              <li>Total: {calculateTotalPrice()} €</li>
            </ul>
            </div>
        <span>Total: {calculateTotalPrice()} €</span>
        <button className="bouton light" type="button" onClick={openProductModal}>Ajouter un produit</button>
        <Modal
              isOpen={showMailModal}
              onRequestClose={closeMailModal}
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
                  height: "50%",
                },
              }}
              contentLabel="modifier_mail"
            >
              <div>
                {selectedClient && (
                  <div>
                    <h2>Mail à {selectedClient.email}</h2>
                    <label>Objet :</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                    <br />
                    <label>Contenu :</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <br />
                    <button className="bouton light" onClick={handleGenerateAndSend}>
                      Envoyer le mail
                    </button>
                    <button className="bouton light" onClick={closeMailModal}>
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </Modal>

              <button className="bouton light" onClick={openMailModal}>Envoyer le devis par mail</button>
        <button className="button_submit bouton light" onClick={changeDevis}>
          Valider
        </button>
      </form>

      <div className="apercu_devis" id="apercu_devis">
        <div className="entete">
            <span>Date de création : {dateCreation}</span>
            <span className="client_address">{selectedAdresseClient}</span>
            <h1 className="titre">
                Devis numéro 00{selectedDevisNumero}/{ new Date().getFullYear()} pour le client {selectedClient ? selectedClient.nom_societe : ""}
            </h1>
            {selectedClient &&(
              <div style={{  float: "right", width: "40%",position: "relative", left:"0%", top:"0%", lineHeight: "2px"}}> 
                <p>{selectedClient.nom_societe}</p>
                <p>{selectedClient.nom} {selectedClient.prenom}</p>
                <p>{selectedClient.rue} {selectedClient.numero}</p>
                <p>{selectedClient.code_postal} {selectedClient.nom_commune}</p>
                <p>{selectedClient.pays}</p>
              </div>)}
            </div>
            <p>Description :</p>
            <pre>{text}</pre>
            <div className="produits_detail">
            <h3>Récapitulatif des produits :</h3>
            <ul>
              {selectedProducts.map((product, index) => (
                <li key={index}>
                  Produit: {product.product}, Quantité: {product.quantity}, Prix: {Math.round(product.price*100)/100} €
                </li>
              ))}
              <li>Total: {calculateTotalPrice()} €</li>
            </ul>
            </div>
            <div className="signature">
            <span>Signature :</span>
        </div>
        <div style={{fontSize:"7px"}}>
        Studio Eventail s'engage à protéger la vie privée de ses clients. Nous reconnaissons que les données personnelles que vous nous confiez sont précieuses et importantes pour vous, et nous prenons très au sérieux notre responsabilité de protéger vos données. Les données personnelles que vous avez transmises à Studio Eventail sont nécessaires pour la bonne gestion de votre commande, de la livraison à l'envoi des devis et factures. Sans ces données, cela ne serait pas possible. Vous avez le droit de les consulter sur simple demande. Vous pouvez demander que vos données personnelles incorrectes ou incomplètes soient rectifiées et complétées. Vous avez également le droit de demander que vos données personnelles soient supprimées si c’est légalement possible. 
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
              transform: "translate(-50%, -50%)",
              width: "50%",
              padding: "20px",
              borderRadius: "4px",
              height: "50%"
          },
      }}
        contentLabel="Product Modal"
      >
        <h2>Choisir un produit et une quantité</h2>
        <input
        type="text"
        placeholder="Rechercher"
        value={searchTerm2}
        onChange={(e) => setSearchTerm2(e.target.value)}
      />
        <table>
          <thead>
            <th>Nom du produit</th>
            <th>Prix</th>
            <th>Action</th>
          </thead>
          <tbody>
          {currentProduits.map((i, index) => (
                      <tr key={index}>
                          <td>{i.nom}</td>
                          <td>{i.prix}</td>
                          <td>
                              <button
                                  className="bouton light" 
                                  type="button"
                                  onClick={() => setSelectedProduct(i)}
                              >
                                  Sélectionner
                              </button>
                          </td>
                      </tr>
                  ))}
          </tbody>
        </table>
        <div className='pagination'>
          <button className="bouton light" onClick={goToFirstPage2}>Première page</button>
          <button className="bouton light" onClick={goToPreviousPage2}>Page précédente</button>
          <span>Page {currentPage2} sur {totalPages2}</span>
          <button className="bouton light" onClick={goToNextPage2}>Page suivante</button>
          <button className="bouton light" onClick={goToLastPage2}>Dernière page</button>
        </div>
        <div>
          <label>Produit choisi : {selectedProduct.nom}</label>
          <br/>
          <label>Quantité : </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
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
      <input
        type="text"
        placeholder="Rechercher"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
          <table>
              <thead>
                  <tr>
                      <th>Nom travail</th>
                      <th>Nom Société</th>
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
          <button className="bouton light" onClick={goToFirstPage}>Première page</button>
          <button className="bouton light" onClick={goToPreviousPage}>Page précédente</button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button className="bouton light" onClick={goToNextPage}>Page suivante</button>
          <button className="bouton light" onClick={goToLastPage}>Dernière page</button>
        </div>
      </Modal>

    </div>
    );
};
            
export default NouveauDevis;
