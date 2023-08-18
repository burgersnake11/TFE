import React, {useEffect, useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const NouvelleCommande = () => {
    const [clients, setClients] = useState([])
    const [clientChosen, setClientChosen] = useState()
    const [nomCommande, setNomCommande] = useState("")
    const navigate = useNavigate();

    useEffect(() => {
        let arrayclient=[]
        let singleClient = {}
        axios.get("https://studio-eventail.be:3001/clients").then(res => {
            for(let i = 0; i<res.data.length;i++ ){
                singleClient = {
                    "id":res.data[i].pk_client_id,
                    "nom_societe": res.data[i].nom_societe,
                    "nom_commune" : res.data[i].nom_commune,
                    "code_postal" : res.data[i].code_postal,
                    "pays" : res.data[i].pays,
                    "region": res.data[i].region,    
                    "rue" : res.data[i].rue,     
                    "numero" : res.data[i].numéro   
            }
                arrayclient.push(singleClient)
            }
            setClients(arrayclient)
        })
    }, [])

    function create_client(e){
        e.preventDefault()
        if(nomCommande.indexOf("'") !== -1 || nomCommande.indexOf('"') !== -1){
            alert("Veuillez saisir un nom de produit sans guillement.");
            return;
        }
        else{
            let jsonToSend = {}
            for(let i=0;i<clients.length;i++){
                if (clients[i].id===Number(clientChosen)){
                    jsonToSend = clients[i]
                }
            }
            jsonToSend["nom_commande"] = nomCommande
            axios.post("https://studio-eventail.be:3001/nouvelle_commande", jsonToSend).catch(
                err => console.warn(err)
            )
            navigate('/travaux');
        }
    }
    return(
        <form className="form_facture secondColor light" onSubmit={create_client}>
            <h2>Nouveau travail : </h2>
            <label>Sélectionner le client : </label>
            <select onChange={(e) => {setClientChosen(e.target.value)}}>
                <option value = ""> Choisir un client</option>
                {clients.map((i) => {
                    return <option value = {i.id}>{i.nom_societe}</option>
                })}
            </select>
            <br></br>
            <label>Nom du travail : </label>
            <br></br>
            <input type="text" onChange={(e) => setNomCommande(e.target.value)} maxlength="100" required></input>
            <br></br>
            <button type="submit" className="button_submit bouton light" >Valider</button>
        </form>
    )
}

export default NouvelleCommande