import React from "react";
import "../style/nouvelle_facture.css"
import {useState, useEffect } from "react";
import axios from 'axios'
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Nouvelle_facture = () => {
    const [showProductModal, setShowProductModal] = useState(false); // Product modal state
    const [showMailModal, setShowMailModal] = useState(false);
    const [currentPage2, setCurrentPage2] = useState(1);
    const [searchTerm2, setSearchTerm2] = useState('');
    const [filteredProduits, setFilteredProduits] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [produits, setProduits] = useState([]);
    const [subject, setSubject] = useState("Facture");
    const [message, setMessage] = useState("Madame, Monsieur,\r\nVeuillez trouver en pièce jointe votre facture / note de crédit.\r\nBien cordialement,\r\nStudio éventail.");

    const [commandeId, setCommandeId] = useState(0)
    const [numeroFacture, setNumeroFacture] = useState(0)
    const [descriptif, setDescriptif] = useState("")
    const [HTVA6, setHTVA6] = useState(0)
    const [HTVA21, setHTVA21] = useState(0)
    const [TVA6, setTVA6] = useState(0)
    const [TVA21, setTVA21] = useState(0)
    const [HTVATotal, setHTVATotal] = useState(0)
    const [total, setTotal] = useState(0)
    const [TVATotal, setTVATotal] = useState(0)
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedAdresseClient, setSelectedAdresseClient] = useState("");
    const [client, setClient] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const facturesPerPage = 5; // Nombre de factures à afficher par page
    const navigate = useNavigate();
    const [limitDate,setLimitDate] = useState(1);

    useEffect(()=>{
      setCurrentPage2(1)
    }, [searchTerm2])

    const applySearchFilter2 = () => {
      const filtered = produits.filter(Produit => 
        Produit.nom.toLowerCase().includes(searchTerm2.toLowerCase())
      );
      setFilteredProduits(filtered);
    };
    
    useEffect(() => {
      applySearchFilter2();
    }, [searchTerm2, produits]);

    useEffect(() => {
      axios.get("http://localhost:3001/facture_numero").then((res) => {
        setNumeroFacture(res.data.rows[0].max+1)
    })
      axios.get("http://localhost:3001/commandes").then((res) => {
        let arrayclient = res.data.map((data) => ({
          id: data.pk_client_id,
          nom_societe: data.nom_societe,
          nom_commune: data.nom_commune,
          email:data.email,
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
      axios.get("http://localhost:3001/produits").then((res) => {
      let nom_produit = [];
      for (let i = 0; i < res.data.length; i += 1) {
        nom_produit.push({
          "nom" :res.data[i]["nom_produit"],
          "prix" : res.data[i]["prix"],
          "id":res.data[i]["pk_produits_id"],
          "tva":res.data[i]["tva"]
        });
      }
      setProduits(nom_produit);
    });
    }, []);

    function openMailModal(e) {
      e.preventDefault()
      setShowMailModal(true);
    }
  
    function closeMailModal() {
      setShowMailModal(false);
    }
    function openClientModal() {
      setShowClientModal(true);
    }
  
    function closeClientModal() {
      setShowClientModal(false);
    }
    function openProductModal() {
      setSearchTerm2("")
      setCurrentPage2(1)
      setShowProductModal(true);
    }
  
    function closeProductModal() {
      setShowProductModal(false);
    }
    function handleProductSelection() {
      setSelectedProducts((prevSelectedProducts) => [
        ...prevSelectedProducts,
        {
          product: selectedProduct.nom,
          quantity: selectedQuantity,
          tva: selectedProduct.tva,
          price: selectedProduct.prix || 0,
          id: selectedProduct.id || 0,
        },
      ]);
      if(selectedProduct.tva===6){
        setTVA6(Math.round((TVA6 + selectedProduct.prix*selectedQuantity*selectedProduct.tva/100/(1+selectedProduct.tva/100))*100)/100)
        setHTVA6(Math.round((HTVA6 + selectedProduct.prix*selectedQuantity/(1+selectedProduct.tva/100))*100)/100)
      }
      else{
        setTVA21(Math.round((TVA21 + selectedProduct.prix*selectedQuantity*selectedProduct.tva/100/(1+selectedProduct.tva/100))*100)/100)
        setHTVA21(Math.round((HTVA21 +selectedProduct.prix*selectedQuantity/(1+selectedProduct.tva/100))*100)/100)  
      }
      setHTVATotal(Math.round((HTVATotal + selectedProduct.prix*selectedQuantity/(1+selectedProduct.tva))*100)/100)
      setTVATotal(Math.round((TVATotal + selectedProduct.prix*selectedQuantity*selectedProduct.tva/(1+selectedProduct.tva))*100)/100)
      setTotal(Math.round((total + selectedProduct.prix*selectedQuantity/(1+selectedProduct.tva) +  selectedProduct.prix*selectedQuantity*selectedProduct.tva/(1+selectedProduct.tva))*100)/100)
      setSelectedProduct("");
      setSelectedQuantity(1);
      closeProductModal();
    }

    function handleClientSelection(selectedClient) {
      setSelectedClient(selectedClient);
      setCommandeId(selectedClient.pk_commande_id)
      setSelectedAdresseClient(
        `${selectedClient.rue} ${selectedClient.numero}, ${selectedClient.code_postal} ${selectedClient.nom_commune}, ${selectedClient.pays}`
      );
      closeClientModal();
    }

    function createFacture(e){
        let jsonToSend = {
            "client" : selectedClient, 
            "numeroFacture": numeroFacture, 
            "descriptif":descriptif,
            "HTVA6":HTVA6,
            "HTVA21": HTVA21,
            "TVA6":TVA6,
            "TVA21":TVA21,
            "fk_commande_id": commandeId,
            "date_limite":limitDate,
            "produits":selectedProducts,
        }
        axios.post("http://localhost:3001/nouvelle_facture", jsonToSend).catch(
                err => console.warn(err)
        )
        navigate('/historique_factures');
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
    const indexOfLastProduit = currentPage2 * facturesPerPage;
    const indexOfFirstProduit = indexOfLastProduit - facturesPerPage;
    const currentProduits = filteredProduits.slice(indexOfFirstProduit, indexOfLastProduit);  

    const indexOfLastCommande = currentPage * facturesPerPage;
    const indexOfFirstCommande = indexOfLastCommande - facturesPerPage;
    const currentCommandes = client.slice(indexOfFirstCommande, indexOfLastCommande);
    
/*     function generatePDF(){
      const content = document.getElementById('pdfContent');
      
      const opt = {
        margin: 10,
        filename: 'preview.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().from(content).set(opt).save();
    }; */
    function calculateTotalPrice() {
      return selectedProducts.reduce((total, product) => {
        const productPrice = parseFloat(product.price) || 0;
        const productQuantity = parseFloat(product.quantity) || 0;
        return Math.round((total + productPrice * productQuantity)*100)/100;
      }, 0);
    }

/*     const generatePDF = async () => {
      const divToCapture = document.getElementById('apercu_devis');
      const canvas = await html2canvas(divToCapture);
      const pdf = new jsPDF();
    
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 250);
    
      const pdfOutput = pdf.output('blob');
      return pdfOutput;
    }; */
  
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
        axios.post('http://localhost:3001/mail_facture', formData);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du PDF', error);
      }
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

/*     const sendPDFToBackend = async (pdfBlob) => {
      try {
        const formData = new FormData();
        formData.append('pdf', pdfBlob, 'apercu.pdf');
        formData.append('email', selectedClient.email);


        axios.post('http://localhost:3001/mail_facture', formData).then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
        console.log('PDF envoyé au backend avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du PDF au backend', error);
      }
    }; */
  
    const handleGenerateAndSend = async () => {
      const pdfBlob = await generatePDF();
      closeMailModal()
      sendPDFToBackend(pdfBlob);
    };

    return(
    <div className="container">
      <form className="form_facture secondColor light" onSubmit={createFacture}>
        <h2>Créer une facture :</h2>

        <label>Numéro de la facture : {numeroFacture}</label>
        <button className="bouton light" type="button" onClick={openClientModal}>Choisir un travail</button>

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
          <button className="bouton light" onClick={goToPreviousPage}>Page précédente</button>
          <button className="bouton light" onClick={goToFirstPage}>1</button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button className="bouton light" onClick={goToLastPage}>{totalPages}</button>
          <button className="bouton light" onClick={goToNextPage}>Page suivante</button>
        </div>
      </Modal>

        <div className="client-info">
        {selectedClient && (
          <div>
            <span>Travail choisi : {selectedClient.nom_commande}</span>
            <br/>
            <span>Client choisi: {selectedClient.nom_societe}</span>
          </div>
        )}
        <span className="droite">
          Adresse : {selectedAdresseClient}
        </span>
        </div>
        <h3>Détails des produits : </h3>
        <div>
            <table className="table" style={{border:"3px solid white"}}>
                <thead>
                    <th>Nom</th>
                    <th>Prix</th>
                    <th>TVA</th>
                    <th>Quantité</th>
                </thead>
                {selectedProducts.map((i, index) => (
                    <tr key={index}>
                        <td>{i.product}</td>
                        <td>{i.price}</td>
                        <td>{i.tva}</td>
                        <td>{i.quantity}</td>
                    </tr>
                ))}
            </table>
        </div>
        <button className="bouton light" type="button" onClick={openProductModal}>Ajouter un produit</button>

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
      <label>
        Date limite de paiement :<input type="date" onChange={(e) => setLimitDate(e.target.value)} required></input>
      </label>
      <div className="montants-container mainColor">
          <h3>Montants :</h3>
          <div className="montant-row">
          <label>HTVA (6%) : {HTVA6}€</label>
          <label>TVA (6%) : {TVA6}€</label>
          </div>
          <div className="montant-row">
          <label>HTVA (21%) : {HTVA21}€</label>
          <label>TVA (21%) : {TVA21}€</label>
          </div>
          <div className="montant-row">
          <label>HTVA Total : {HTVATotal}€</label>
          <label>TVA Total : {TVATotal}€</label>
          </div>
          <div className="apercu_montant_item">
          <label>Montant à payer : {total}€</label>
          </div>
      </div>
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

        <button className="bouton light" onClick={openMailModal}>Envoyer la facture par mail</button>
        <button className="bouton light" type="submit">Valider</button>
      </form>
      <div>
        <div className="apercu_devis" id="apercu_devis">
          <div className="apercu_header">
            <div className="apercu_header_left">
              <label>Date : {new Date().toLocaleDateString()}</label>
              <div style={{textAlign:"center"}}>
              Facture numéro 00{numeroFacture}/{new Date().getFullYear() } pour le client {selectedClient ? selectedClient.nom_societe : ""}
              </div>
            </div>
          </div>
          {selectedClient &&(
              <div className="apercu_address"> 
                <p>{selectedClient.nom_societe}</p>
                <p>{selectedClient.nom} {selectedClient.prenom}</p>
                <p>{selectedClient.rue} {selectedClient.numero}</p>
                <p>{selectedClient.code_postal} {selectedClient.nom_commune}</p>
                <p>{selectedClient.pays}</p>
              </div>)}
          <div style={{border:"3px solid black", padding:"5px 5px 300px 5px", borderRadius:"10px", }}>
            <p>Descriptif :</p>
            <ul>
              {selectedProducts.map((product, index) => (
                <li key={index}>
                  Produit: {product.product}, Quantité: {product.quantity}, Prix: {Math.round(product.price*100)/100} €
                </li>
              ))}
              <li>Total: {calculateTotalPrice()} €</li>
            </ul>
          </div>
          <div className="montants-container">
            <h3>Montants :</h3>
            <div className="montant-row">
              <label>HTVA (6%) : {HTVA6}€</label>
              <label>TVA (6%) : {TVA6}€</label>
            </div>
            <div className="montant-row">
              <label>HTVA (21%) : {HTVA21}€</label>
              <label>TVA (21%) : {TVA21}€</label>
            </div>
            <div className="montant-row">
              <label>HTVA Total : {HTVATotal}€</label>
              <label>TVA Total : {TVATotal}€</label>
            </div>
            <div className="apercu_montant_item">
              <label>Montant à payer : {total}€</label>
            </div>
          </div>
          <div className="apercu_signature">
            Signature : ____________________________________________
          </div>
        </div>
      </div>
    </div>
    )
}

export default Nouvelle_facture