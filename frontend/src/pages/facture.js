import React from "react";
import { useEffect, useState, useRef } from "react";
import {useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Facture = () => {
    let id = useLocation().state[0]

    const [numeroFacture, setNumeroFacture] = useState("")
    const [descriptif, setDescriptif] = useState("")
    const [HTVA6, setHTVA6] = useState("")
    const [HTVA21, setHTVA21] = useState("")
    const [TVA6, setTVA6] = useState("")
    const [TVA21, setTVA21] = useState("")
    const [HTVATotal, setHTVATotal] = useState(0)
    const [total, setTotal] = useState(0)
    const [TVATotal, setTVATotal] = useState(0)
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedAdresseClient, setSelectedAdresseClient] = useState("");
    const navigate = useNavigate();


    useEffect(() => {
        axios.get("http://localhost:3001/facture", {params : {"id":id}}).then(res => {
            setSelectedClient(res.data.rows[0])
            setNumeroFacture(res.data.rows[0].facture_numero)
            setSelectedAdresseClient(res.data.rows[0].pays + " " + res.data.rows[0].numero + " " + res.data.rows[0].rue + " " + res.data.rows[0].code_postal + " " + res.data.rows[0].nom)
            setHTVA6(Number(res.data.rows[0].htva6))
            setHTVA21(Number(res.data.rows[0].htva21))
            setTVA6(Number(res.data.rows[0].htva6) * 0.06)
            setTVA21(Number(res.data.rows[0].htva21) * 0.21)
            setHTVATotal(Number(res.data.rows[0].htva6) + Number(res.data.rows[0].htva21))
            setTVATotal(Number(res.data.rows[0].htva6) * 0.06 + Number(res.data.rows[0].htva21) * 0.21)
            setTotal(Number(res.data.rows[0].htva6) + Number(res.data.rows[0].htva21) + Number(res.data.rows[0].htva6) * 0.06 + Number(res.data.rows[0].htva21) * 0.21)
        })
    }, [])

    function changeValue(e, id){
        e=Number(e)
        if (id === 'HTVA6'){
            setHTVA6(Math.round(e*100)/100)
            setTVA6(Math.round(e*0.6*100)/100)
        }
        if (id === 'TVA6'){
            setTVA6(Math.round(e*100)/100)
            setHTVA6(Math.round(e/1.06*100)/100)
        }
        if (id=== 'HTVA21'){
            setHTVA21(Math.round(e*100)/100)
            setTVA21(Math.round(e*0.21*100)/100)
        }
        if (id === 'TVA21'){
            setTVA21(Math.round(e*100)/100)
            setHTVA21(Math.round(e/1.21*100)/100)
        }
        
        setHTVATotal(Math.round((Number(HTVA21) +Number(HTVA6))*100)/100)
        setTVATotal(Math.round((Number(TVA6) + Number(TVA21))*100)/100)
        setTotal(Math.round((Number(HTVA21) + Number(HTVA6) + Number(TVA21) + Number(TVA6))*100)/100)
    }

    function changeFacture(){
        let jsonToSend = { 
            "id" : numeroFacture,
            "HTVA6": HTVA6,
            "HTVA21": HTVA21,
            "descriptif": descriptif 
        }
        axios.post("http://localhost:3001/facture", jsonToSend).catch(
            err => console.warn(err)
        )
        navigate("/historique_factures")
    }
    function changeValue(e, id){
        e=Number(e)
        if (id === 'HTVA6'){
            if(e!==0){
                setHTVA6(Math.round(e*100)/100)
                setTVA6(Math.round(e*0.06*100)/100)
            }
            else{
                setHTVA6(0)
                setTVA6(0)
            }
            setHTVATotal(Math.round((Number(HTVA21) +e)*100)/100)
            setTVATotal(Math.round((Math.round(e*0.06*100)/100 + Number(TVA21))*100)/100)
            setTotal(Math.round((Number(HTVA21) + Math.round(e*100)/100 + Number(TVA21) + Math.round(e*0.06*100)/100)*100)/100)
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
    }
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
      
              <label>Descriptif :</label>
              <textarea defaultValue={descriptif} onChange={(e) => setDescriptif(e.target.value)} />
      
              <div className="montants-container">
                <div className="montants">
                  <label>Montants</label>
      
                  <div className="montant-row">
                    <label>HTVA :
                    <input type="number" min="0" step="any" required onChange={(e) => changeValue(e.target.value, e.target.id)} id="HTVA6"  defaultValue={HTVA6} /></label>
                    <label> 6% : {TVA6}€ </label>
                  </div>
      
                  <div className="montant-row">
                    <label>HTVA : 
                    <input type="number" min="0" step="any" required onChange={(e) => changeValue(e.target.value, e.target.id)} id="HTVA21" defaultValue={HTVA21} /></label>
                    <label> 21% : {TVA21}€</label>
                  </div>
      
                  <div className="montant-row light">
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
              <div className="apercu_devis">
              <div className="apercu_header">
                <div className="apercu_header_left">
                  <p>Date : {new Date().toLocaleDateString()}</p>
                  <h2>Facture numéro {numeroFacture}</h2>
                </div>
                <div className="apercu_header_right">
                {selectedClient && (
                <div>
                  <span>Client choisi: {selectedClient.nom_societe}</span>
                </div>
              )}
                </div>
              </div>
              <div className="apercu_address">
                Adresse : 
                {selectedAdresseClient}
              </div>
              <div className="apercu_descriptif">
                <p>Descriptif :</p>
                <div>{descriptif}</div>
              </div>
              <div className="montants-container">
                <h3>Montants :</h3>
                <div className="montant-row">
                  <p>HTVA (6%) :</p>
                  <div>{HTVA6}</div>
                  <p>TVA (6%) :</p>
                  <div>{TVA6}</div>
                </div>
                <div className="montant-row">
                  <p>HTVA (21%) :</p>
                  <div>{HTVA21}</div>
                  <p>TVA (21%) :</p>
                  <div>{TVA21}</div>
                </div>
                <div className="montant-row">
                  <p>HTVA Total :</p>
                  <div>{HTVATotal}</div>
                  <p>TVA Total :</p>
                  <div>{TVATotal}</div>
                </div>
                <div className="apercu_montant_item">
                  <p>Montant à payer :</p>
                  <div>{total}</div>
                </div>
              </div>
              <div className="apercu_signature">
                Signature : ____________________________________________
              </div>
            </div>
          </div>
          )
      }

export default Facture