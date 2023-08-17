import React from "react";
import {useState } from "react";
import "../style/nouveau_client.css"
import axios from "axios";
import {useNavigate } from 'react-router-dom';

const NouveauClient = () => {
    const [nomSociete, setNomSociete] = useState("")
    const [rue, setRue] = useState("")
    const [numero, setNumero] = useState(0)
    const [codePostal, setCodePostal] = useState(0)
    const [commune, setCommune] = useState("")
    const [pays, setPays] = useState("")
    const [nomClient, setNomClient] = useState("")
    const [prenomClient, setPrenomClient] = useState("")
    const [gsm, setGsm] = useState(0)
    const [fixe, setFixe] = useState(0)
    const [email, setEmail] = useState("")
    const navigate = useNavigate();

    function create_client(e){
        e.preventDefault()
        if (!gsm && !fixe) {
            alert("Veuillez saisir au moins un numéro de contact (GSM ou fixe).");
            return;
          }
        else if(!nomSociete && !nomClient){
            alert("Veuillez saisir au moins un nom de société ou un nom de client.");
            return;
        }
        else{
            let jsonToSend = {
                "nom_societe" : nomSociete,
                "rue" : rue,
                "numero" : numero,
                "code_postal" : codePostal,
                "commune" : commune,
                "pays" : pays,
                "nom" : nomClient,
                "prenom" : prenomClient,
                "gsm" : gsm,
                "fixe" : fixe,
                "email" : email
            }
            axios.post("https://54.37.9.74:3001/nouveau_client", jsonToSend).catch(
                    err => console.warn(err)
            )
            navigate('/clients');
        }
    }

    return(
        <form className="form_client light secondColor" onSubmit={create_client}>
            <h2>Nouveau client : </h2>
            <label>Nom de la société : </label>
            <input type="text" onChange={(e) =>setNomSociete(e.target.value)} value={nomSociete}/>
            <br></br>
            <label>Nom du client : </label>
            <input type="text" onChange={(e) =>setNomClient(e.target.value)} value={nomClient}/>
            <br></br>
            <label>Prénom du client : </label>
            <input type="text" onChange={(e) =>setPrenomClient(e.target.value)} />
            <br></br>
            <label>Numéro de GSM :</label>
            <input
                type="tel"
                pattern="[0-9]{10}"
                min="0"
                title="Veuillez entrer un numéro à 10 chiffres (sans espaces ni caractères spéciaux)"
                onChange={(e) => setGsm(e.target.value)}
            />
            <br/>
            <label>Numéro de téléphone fixe :</label>
            <input
                type="tel"
                pattern="[0-9]{9}"
                min="0"
                title="Veuillez entrer un numéro à 9 chiffres (sans espaces ni caractères spéciaux)"
                onChange={(e) => setFixe(e.target.value)}
            />      
            <br></br>
            <label>Email : </label>
            <input
            type="email"
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}"
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <div className="addresse mainColor dark">
                <h3>Adresse : </h3>
                <label>Rue : </label>
                <input type="text" onChange={(e) =>setRue(e.target.value)} required/>
                <br></br>
                <label>Numéro :</label>
                <input type="number" min="0" onChange={(e) =>setNumero(e.target.value)}/>
                <br></br>
                <label>Code postal : </label>
                <input type="number" min="0" onChange={(e) =>setCodePostal(e.target.value)} required/>
                <br></br>
                <label>Commune : </label>
                <input type="text" onChange={(e) =>setCommune(e.target.value)} required/>
                <br></br>
                <label>Pays : </label>
                <input type="text" onChange={(e) =>setPays(e.target.value)} value={"Belgique"} required/>
            </div>
            <br/>
            <button className="button_submit bouton light" type="submit">Valider</button>
        </form>
    )
}

export default NouveauClient