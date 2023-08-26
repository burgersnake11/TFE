import React from "react";
import { useEffect, useState, useRef } from "react";
import {useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Modal from "react-modal";
import html2pdf from 'html2pdf.js';

const Facture = () => {
    let id = useLocation().state[0]
    const [showProductModal, setShowProductModal] = useState(false); // Product modal state
    const [currentPage2, setCurrentPage2] = useState(1);
    const [searchTerm2, setSearchTerm2] = useState('');
    const [filteredProduits, setFilteredProduits] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [produits, setProduits] = useState([]);
    const facturesPerPage = 5; // Nombre de factures à afficher par page
    const [limitDate,setLimitDate] = useState(1);
    const [showMailModal, setShowMailModal] = useState(false);
    const [subject, setSubject] = useState("Facture");
    const [message, setMessage] = useState("Madame, Monsieur,\r\nVeuillez trouver en pièce jointe votre facture / note de crédit.\r\nBien cordialement,\r\nStudio éventail.");

    const [numeroFacture, setNumeroFacture] = useState("")
    const [descriptif, setDescriptif] = useState("")
    const [HTVA6, setHTVA6] = useState(0)
    const [HTVA21, setHTVA21] = useState(0)
    const [TVA6, setTVA6] = useState(0)
    const [TVA21, setTVA21] = useState(0)
    const [HTVATotal, setHTVATotal] = useState(0)
    const [total, setTotal] = useState(0)
    const [TVATotal, setTVATotal] = useState(0)
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedAdresseClient, setSelectedAdresseClient] = useState("");
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false); // Nouvel état pour le chargement des données
    const [text, setText] = useState('');

    const handleTextareaChange = (event) => {
      setText(event.target.value);
    };

    useEffect(() => {
        axios.get("https://studio-eventail.be:3001/facture",{params : {"id":id} , withCredentials: true }).then(res => {
            setSelectedClient(res.data)
            setNumeroFacture(res.data.facture_numero)
            setSelectedAdresseClient(res.data.pays + " " + res.data.numero + " " + res.data.rue + " " + res.data.code_postal + " " + res.data.nom)
            setHTVA6(res.data.htva6 ? Number(res.data.htva6) : 0)
            setHTVA21(res.data.htva21 ? Number(res.data.htva21) : 0)
            setTVA6(res.data.htva6 ? Math.round((Number(res.data.htva6) * 0.06)*100)/100 : 0)
            setTVA21(res.data.htva21 ? Math.round((Number(res.data.htva21) * 0.21)*100)/100 : 0)
            setLimitDate(res.data.date_limite)
            setText(res.data.description)
            if(res.data.htva6){
              if(res.data.htva21){
                setHTVATotal(Number(res.data.htva6) + Number(res.data.htva21))
                setTVATotal(Math.round((Number(res.data.htva6) * 0.06 + Number(res.data.htva21) * 0.21)*100)/100)
                setTotal(Math.round((Number(res.data.htva6) + Number(res.data.htva21) + Number(res.data.htva6) * 0.06 + Number(res.data.htva21) * 0.21)*100)/100)
              }
              else{
                setHTVATotal(Number(res.data.htva6) + Number(res.data.htva21))
                setTVATotal(Math.round((Number(res.data.htva6) * 0.06)*100)/100)
                setTotal(Math.round((Number(res.data.htva6) + Number(res.data.htva6) * 0.06)*100)/100)
              }
            }
            else{
              setHTVATotal(Number(res.data.htva21))
              setTVATotal(Math.round(Number(res.data.htva21) * 0.21*100)/100)
              setTotal(Math.round((Number(res.data.htva21) + Number(res.data.htva21) * 0.21)*100)/100)
            }
            
            // Marquer les données comme chargées
            setSelectedProducts(res.data.produits)
            setDataLoaded(true);         
	    console.log(res.data.produits)
	    console.log(res.data)
	 })
        axios.get("https://studio-eventail.be:3001/produits", { withCredentials: true }).then((res) => {
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
    }, [])

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
        setTVA6(Math.round((TVA6 + selectedProduct.prix*selectedQuantity*selectedProduct.tva/100)*100)/100)
        setHTVA6(Math.round((HTVA6 + selectedProduct.prix*selectedQuantity)*100)/100)
      }
      else{
        setTVA21(Math.round((TVA21 + selectedProduct.prix*selectedQuantity*selectedProduct.tva/100)*100)/100)
        setHTVA21(Math.round((HTVA21 +selectedProduct.prix*selectedQuantity)*100)/100)  
      }
      setHTVATotal(Math.round((HTVATotal + selectedProduct.prix*selectedQuantity)*100)/100)
      setTVATotal(Math.round((TVATotal + selectedProduct.prix*selectedQuantity*selectedProduct.tva/100)*100)/100)
      setTotal(Math.round((total + selectedProduct.prix*selectedQuantity+  selectedProduct.prix*selectedQuantity*selectedProduct.tva/100)*100)/100)
      setSelectedProduct("");
      setSelectedQuantity(1);
      closeProductModal();
    }

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

    function changeFacture(){
        let jsonToSend = { 
            "id" : numeroFacture,
            "HTVA6": HTVA6,
            "HTVA21": HTVA21,
            "descriptif": descriptif,
            "produits": selectedProducts,
            "date":limitDate,
        }
        axios.post("https://studio-eventail.be:3001/facture", jsonToSend).catch(
            err => console.warn(err)
        )
        navigate("/historique_factures")
    }
    function calculateTotalPrice() {
      return selectedProducts.reduce((total, product) => {
        const productPrice = parseFloat(product.price) || 0;
        const productQuantity = parseFloat(product.quantity) || 0;
        return Math.round((total + productPrice * productQuantity)*100)/100;
      }, 0);
    }

    const indexOfLastProduit = currentPage2 * facturesPerPage;
    const indexOfFirstProduit = indexOfLastProduit - facturesPerPage;
    const currentProduits = filteredProduits.slice(indexOfFirstProduit, indexOfLastProduit);  

    function formatteDate(date){
      const now = new Date(date)
      const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
      return formattedDate
    }
    function openMailModal(e) {
      e.preventDefault()
      setShowMailModal(true);
    }
  
    function closeMailModal() {
      setShowMailModal(false);
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
      changeFacture()
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
          return(
          <div className="container">
            <form className="form_facture secondColor light" onSubmit={changeFacture}>
              <h2>Créer une facture :</h2>
      
              <label>Numéro de la facture : {numeroFacture}</label>             
              <div className="client-info">
              {selectedClient && (
                <div>
                  <span>Client choisi: {selectedClient.nom_societe}</span>
                </div>
              )}
                <span className="droite">
                    Adresse : {selectedAdresseClient}
                </span>
              </div>
              <label>Remarques : </label>
              <textarea
                rows={10}
                cols={40}
                value={text}
                onChange={handleTextareaChange}
              />
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
                Date limite de paiement :<input type="date" value={dataLoaded ? limitDate.split("T")[0] : ""} onChange={(e) => setLimitDate(e.target.value)} required></input>
              </label>
              <label>
                Date de paiement : {dataLoaded ? selectedClient.payer ? selectedClient.date_paiement ? formatteDate(selectedClient.date_paiement) : "Pas encore payé" : "Pas encore payé" :""}
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
              <div className="apercu_devis" id="apercu_devis">
              <div className="apercu_header">
                <div className="apercu_header_left">
                  <p>Date : {new Date().toLocaleDateString()}
                  </p>
                  <h1 className="titre">
                      Devis numéro 00{dataLoaded ? selectedClient.facture_numero : ""}/{dataLoaded ? selectedClient.annee : ""} pour le client {selectedClient ? selectedClient.nom_societe : ""}
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
              </div>
              <div className="apercu_descriptif">
                <p>Remarques :</p>
                <pre>{text}</pre>
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
              <div style={{fontSize:"7px"}}>
              Studio Eventail s'engage à protéger la vie privée de ses clients. Nous reconnaissons que les données personnelles que vous nous confiez sont précieuses et importantes pour vous, et nous prenons très au sérieux notre responsabilité de protéger vos données. Les données personnelles que vous avez transmises à Studio Eventail sont nécessaires pour la bonne gestion de votre commande, de la livraison à l'envoi des devis et factures. Sans ces données, cela ne serait pas possible. Vous avez le droit de les consulter sur simple demande. Vous pouvez demander que vos données personnelles incorrectes ou incomplètes soient rectifiées et complétées. Vous avez également le droit de demander que vos données personnelles soient supprimées si c’est légalement possible. 
              </div>
            </div>
          </div>
          )
      }

export default Facture
