import React from "react";
import "../style/nouvelle_facture.css"
import {useState, useEffect } from "react";
import axios from 'axios'
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom';
/* import html2pdf from 'html2pdf.js';
 */
const Nouvelle_facture = () => {
    
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
    useEffect(() => {
      axios.get("http://localhost:3001/facture_numero").then((res) => {
        setNumeroFacture(res.data.rows[0].max+1)
    })
      axios.get("http://localhost:3001/commandes").then((res) => {
        let arrayclient = res.data.map((data) => ({
          id: data.pk_client_id,
          nom_societe: data.nom_societe,
          nom_commune: data.nom_commune,
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

    function openClientModal() {
      setShowClientModal(true);
    }
  
    function closeClientModal() {
      setShowClientModal(false);
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
        }
        axios.post("http://localhost:3001/nouvelle_facture", jsonToSend).catch(
                err => console.warn(err)
        )
        navigate('/historique_factures');
    }

    function changeValue(e, id){
        e=Number(e)
        
        if (id === 'HTVA6'){
          if(e!==0){
            setHTVA6(Math.round(e*100)/100)
            setTVA6(Math.round(e*0.06*100)/100)
          }
          else{
            setHTVA6("")
            setTVA6("")
          }
          setHTVATotal(Math.round((Number(HTVA21) +e)*100)/100)
          setTVATotal(Math.round((Math.round(e*0.06*100)/100 + Number(TVA21))*100)/100)
          setTotal(Math.round((Number(HTVA21) + Math.round(e*100)/100 + Number(TVA21) + Math.round(e*0.06*100)/100)*100)/100)
        }
        if (id === 'TVA6'){
          if(e!==0){
            setTVA6(Math.round(e*100)/100)
            setHTVA6(Math.round(e/6*100*100)/100)
          }
          else{
            setHTVA6("")
            setTVA6("")
          }
          setTVATotal(Math.round((e + Number(TVA21))*100)/100)
          setHTVATotal(Math.round((Math.round(e/6*100*100)/100 +Number(HTVA21))*100)/100)
          setTotal(Math.round((Number(HTVA21) + Math.round(e*100)/100 + Number(TVA21) + Math.round(e/6*100*100)/100)*100)/100)
        }
        
        if (id=== 'HTVA21'){
          if(e!==0){
            setHTVA21(Math.round(e*100)/100)
            setTVA21(Math.round(e*0.21*100)/100)
          }
          else{
            setHTVA21("")
            setTVA21("")
          }
          setHTVATotal(Math.round((e +Number(HTVA6))*100)/100)
          setTVATotal(Math.round((Math.round(e*0.21*100)/100 + Number(TVA6))*100)/100)
          setTotal(Math.round((Math.round(e*100)/100 + Number(HTVA6) + Math.round(e*0.21*100)/100 + Number(TVA6))*100)/100)
        }
        if (id === 'TVA21'){
          if(e!==0){
            setTVA21(Math.round(e*100)/100)
            setHTVA21(Math.round(e/21*100*100)/100)
          }
          else{
            setHTVA21("")
            setTVA21("")
          }
          setTVATotal(Math.round((Number(TVA6) + e)*100)/100)
          setHTVATotal(Math.round((Math.round(e/21*100*100)/100 +Number(HTVA6))*100)/100)
          setTotal(Math.round((Math.round(e/21*100*100)/100 + Number(HTVA6) + Math.round(e*100)/100 + Number(TVA6))*100)/100)
        }
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

        <label>Descriptif :</label>
        <textarea onChange={(e) => setDescriptif(e.target.value)} />
        <label>
          Date limite de paiement :<input type="date" onChange={(e) => setLimitDate(e.target.value)} required></input>
        </label>

        <div className="montants-container mainColor dark">
          <div className="montants">
            <label>Montants</label>

            <div className="montant-row">
              <label>HTVA :
              <input type="number" min="0" step="any" required onChange={(e) => changeValue(e.target.value, e.target.id)} id="HTVA6" value={HTVA6} /></label>
              <label> 6% :
              <input type="number" min="0" step="any" required onChange={(e) => changeValue(e.target.value, e.target.id)} id="TVA6" value={TVA6} /></label>
            </div>

            <div className="montant-row">
              <label>HTVA : 
              <input type="number" min="0" step="any" required onChange={(e) => changeValue(e.target.value, e.target.id)} id="HTVA21" value={HTVA21} /></label>
              <label> 21% : 
              <input type="number" min="0" step="any" required onChange={(e) => changeValue(e.target.value, e.target.id)} id="TVA21" value={TVA21} /></label>
            </div>

            <div className="montant-row">
              <label>HTVA total :</label>
              <label>{HTVATotal}</label>
              <label>TVA total :</label>
              <label>{TVATotal}</label>
            </div>

            <label>Montant à payer : {total}</label>
          </div>
        </div>

        <button className="bouton light" type="submit">Valider</button>
      </form>
      <div>
        <div className="apercu_devis" id="pdfContent">
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
            <div>{descriptif}</div>
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

export default Nouvelle_facture