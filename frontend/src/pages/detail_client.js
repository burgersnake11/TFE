import React from "react";
import {useState, useEffect} from "react";
import "../style/nouveau_client.css"
import axios from "axios";
import {useLocation, useNavigate } from 'react-router-dom';

const DetailClient = () => {
    let id = useLocation().state[0]
    const [nomSociete, setNomSociete] = useState("")
    const [rue, setRue] = useState("")
    const [numero, setNumero] = useState("")
    const [codePostal, setCodePostal] = useState("")
    const [commune, setCommune] = useState("")
    const [pays, setPays] = useState("")
    const [nomClient, setNomClient] = useState("")
    const [prenomClient, setPrenomClient] = useState("")
    const [gsm, setGsm] = useState("")
    const [fixe, setFixe] = useState("")
    const [email, setEmail] = useState("")
    const [fk_commune_id, setFk_commune_id] = useState(0)
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false); // Nouvel état pour le chargement des données

    useEffect(() => {
        axios.get("https://54.37.9.74:3001/client", {params : {"id":id}}).then( res => {
            setNomSociete(res.data.rows[0].nom_societe)
            setRue(res.data.rows[0].rue)
            setNumero(res.data.rows[0].numero)
            setCodePostal(res.data.rows[0].code_postal)
            setCommune(res.data.rows[0].nom_commune)
            setPays(res.data.rows[0].pays)
            setNomClient(res.data.rows[0].nom)
            setPrenomClient(res.data.rows[0].prenom)
            if(res.data.rows[0].gsm===0){
                setGsm("")
            }
            else{
                setGsm("0"+res.data.rows[0].gsm)
            }
            if(res.data.rows[0].fixe===0){
                setFixe("")
            }
            else{
                setFixe("0"+res.data.rows[0].fixe)
            }
            setEmail(res.data.rows[0].email)      
            setFk_commune_id(res.data.rows[0].fk_commune_id)  
            setDataLoaded(true); // Marquer les données comme chargées
        })
    },[])    
    function modifier_client(e){
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
                "id":id,
                "id_commune":fk_commune_id,
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
            axios.post("https://54.37.9.74:3001/client", jsonToSend).catch(
                    err => console.warn(err)
            )
            navigate('/clients');
        }
    }

    return(
        <form className="form_client secondColor light" onSubmit={modifier_client}>
            <h2>Modifier le client : </h2>
            <label>Nom de la société : </label>
            <input type="text" onChange={(e) =>setNomSociete(e.target.value)}  value={nomSociete}/>
            <br/>
            <label>Nom du client : </label>
            <input type="text" onChange={(e) =>setNomClient(e.target.value)}  value={nomClient}/>
            <br></br>
            <label>Prénom du client : </label>
            <input type="text" onChange={(e) =>setPrenomClient(e.target.value)} defaultValue={prenomClient}/>
            <br></br>
            <label>Numéro de GSM :</label>
            <input
                type="tel"
                pattern="[0-9]{10}"
                min="0"
                title="Veuillez entrer un numéro à 10 chiffres (sans espaces ni caractères spéciaux)"
                onChange={(e) => setGsm(e.target.value)}
                defaultValue={dataLoaded ? gsm : ""}
            />
            <br/>
            <label>Numéro de téléphone fixe :</label>
            <input
                type="tel"
                pattern="[0-9]{9}"
                min="0"
                title="Veuillez entrer un numéro à 9 chiffres (sans espaces ni caractères spéciaux)"
                onChange={(e) => setFixe(e.target.value)}
                defaultValue={dataLoaded ? fixe : ""}
            />      
            <br></br>
            <label>Email : </label>
            <input
            type="email"
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}"
            onChange={(e) => setEmail(e.target.value)}
            required
            defaultValue={email}
            />
            <div className="addresse mainColor dark">
                <h3>Adresse : </h3>
                <label>Rue : </label>
                <input type="text" onChange={(e) =>setRue(e.target.value)} required defaultValue={rue}/>
                <br></br>
                <label>Numéro :</label>
                <input type="number" min="0" onChange={(e) =>setNumero(e.target.value)} value={dataLoaded ? numero : ""}/>
                <br></br>
                <label>Code postal : </label>
                <input type="number" min="0" onChange={(e) =>setCodePostal(e.target.value)} required defaultValue={dataLoaded ? codePostal : ""}/>
                <br></br>
                <label>Commune : </label>
                <input type="text" onChange={(e) =>setCommune(e.target.value)} required defaultValue={commune}/>
                <br></br>
                <label>Pays : </label>
                <input type="text" onChange={(e) =>setPays(e.target.value)}  value={pays}/>
            </div>
            <br></br>
            <button className="button_submit bouton light" type="submit">Valider</button>
        </form>
    )
}

export default DetailClient