import React from "react";
import "../style/nouvelle_facture.css"
import {useState, useEffect } from "react";
import axios from 'axios'
import Modal from "react-modal";
import { json, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

const Facture_devis = () => {
  const [showMailModal, setShowMailModal] = useState(false);
  const [subject, setSubject] = useState("Facture");
  const [message, setMessage] = useState("Madame, Monsieur,\r\nVeuillez trouver en pièce jointe votre facture / note de crédit.\r\nBien cordialement,\r\nStudio éventail.");


    const [commandeId, setCommandeId] = useState(0)
    const [numeroFacture, setNumeroFacture] = useState(0)
    const [descriptif, setDescriptif] = useState("")
    const [HTVA6, setHTVA6] = useState("")
    const [HTVA21, setHTVA21] = useState("")
    const [TVA6, setTVA6] = useState("")
    const [TVA21, setTVA21] = useState("")
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
    const [devis, setDevis] = useState({})
    const [produits, setProduits] = useState([])
    useEffect(() => {
      axios.get("http://54.37.9.74:3001/facture_numero").then((res) => {
        setNumeroFacture(res.data.rows[0].max+1)
    })
      axios.get("http://54.37.9.74:3001/devis").then((res) => {
        let arrayclient = res.data.map((data) => ({
          id: data.pk_client_id,
          nom_societe: data.nom_societe,
          nom_commune: data.nom_commune,
          code_postal: data.code_postal,
          pays: data.pays,
          region: data.region,
          rue: data.rue,
          numero: data.numero,
          nom_commande: data.nom_commande,
          description: data.description,
          pk_commande_id: data.pk_commande_id,
          devis_numero: data.devis_numero,
          pk_devis_id:data.pk_devis_id,
          email:data.email,
        }));
        setClient(arrayclient);
      });
    }, []);

    function openClientModal() {
      setShowClientModal(true);
    }
  
    function closeClientModal() {
      setShowClientModal(false);
    }
    
    function handleClientSelection(selectedClient) {
        axios.get("http://54.37.9.74:3001/detail_devis", {params : {"id": selectedClient.pk_devis_id}}).then((res) => {
            setDevis(res.data)
            setProduits(res.data.produits)
            let prehtva6=0
            let prehtva21=0
            res.data.produits.forEach(i => {
                if(i.tva===6){
                    prehtva6+=Number(i.price)*Number(i.quantity)/(1+Number(i.tva)/100)
                }
                else{
                    prehtva21+=Number(i.price)*Number(i.quantity)/(1+Number(i.tva)/100)
                }
            });
            setTVA6( Math.round(prehtva6*0.06*100)/100)
            setTVA21( Math.round(prehtva21*0.216*100)/100)
            setHTVA21( Math.round(prehtva21*100)/100)
            setHTVA6( Math.round(prehtva6*100)/100)
            setHTVATotal( Math.round((prehtva21+prehtva6)*100)/100)
            setTVATotal( Math.round((prehtva6*0.06+ prehtva21*0.216)*100)/100)
            setTotal( Math.round((prehtva21+ prehtva6 + prehtva6*0.06+ prehtva21*0.216)*100)/100)
        })
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
        }
        axios.post("http://54.37.9.74:3001/nouvelle_facture", jsonToSend).catch(
                err => console.warn(err)
        )
        navigate('/historique_factures');
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
        axios.post('http://54.37.9.74:3001/mail_facture', formData);
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
        <button className="bouton light" type="button" onClick={openClientModal}>Choisir un devis</button>

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
      <h2>Choisir un devis</h2>
          <table>
              <thead>
                  <tr>
                      <th>Nom travail</th>
                      <th>Nom Société</th>
                      <th>Numéro devis</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  {currentCommandes.map((i, index) => (
                      <tr key={index}>
                          <td>{i.nom_commande}</td>
                          <td>{i.nom_societe}</td>
                          <td>{i.devis_numero}</td>
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

        <label>
          Date limite de paiement :<input type="date" onChange={(e) => setLimitDate(e.target.value)} required></input>
        </label>
        <h3>Détails des produits : </h3>
        <div>
            <table className="table">
                <thead>
                    <th>Nom</th>
                    <th>Prix</th>
                    <th>TVA</th>
                    <th>Quantité</th>
                </thead>
                {produits.map((i, index) => (
                    <tr key={index}>
                        <td>{i.product}</td>
                        <td>{i.price}</td>
                        <td>{i.tva}</td>
                        <td>{i.quantity}</td>
                    </tr>
                ))}
            </table>
        </div>
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
              <div className="apercu_address">
                Adresse : 
                {selectedAdresseClient}
              </div>
              <div style={{textAlign:"center"}}>
                <h2>Facture numéro {numeroFacture}</h2>
              </div>
            </div>
            <div>
            {selectedClient && (
              <span>Client choisi: {selectedClient.nom_societe}</span>
          )}
            </div>
          </div>
          <div>
            <p>Descriptif :</p>
            <div>
                <table>
                    <thead>
                        <th>Nom</th>
                        <th>Prix</th>
                        <th>TVA</th>
                        <th>Quantité</th>
                    </thead>
            {produits.map((i, index) => (
                      <tr key={index}>
                          <td>{i.product}</td>
                          <td>{i.price}</td>
                          <td>{i.tva}</td>
                          <td>{i.quantity}</td>
                      </tr>
                  ))}
                  </table>
            </div>
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
{/*         <button className="bouton light" onClick={generatePDF}>Générer PDF</button>
 */}      </div>
    </div>
    )
}

export default Facture_devis