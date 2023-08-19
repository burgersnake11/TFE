import React, {useState} from "react";
import axios from "axios";
import {useNavigate } from 'react-router-dom';

const NouveauProduit = () => {
    const [prix, setPrix] = useState(0)
    const [nom, setNom] = useState("")
    const [TVA, setTVA] = useState(0)
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    function create_produit(e){
        e.preventDefault()
        if(nom.indexOf("'") !== -1 || nom.indexOf('"') !== -1){
            alert("Veuillez saisir un nom de produit sans guillement.");
            return;
        }
        else{
            let jsonToSend = {
                "nom_produit":nom,
                "prix":Number(prix),
                "TVA":Number(TVA)
            }
            axios.post("https://studio-eventail.be:3001/produits", jsonToSend).catch(
                err => console.warn(err)
            ) 
            navigate('/produits');
        }
    }
    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
      };

    return(
        <form className="form_facture secondColor light" onSubmit={create_produit}>
            <h2>Nouveau produit : </h2>
            <br></br>
            <label>Nom : </label>
            <br></br>
            <input style={{width:"35%"}} type="text"  classname="nom" onChange={(e) => setNom(e.target.value)} required></input>
            <br></br>
            <label>TVA (en pourcentage):</label>
            <br/>
            <select onChange={(e) => setTVA(e.target.value)}>
                <option value={6}>6%</option>
                <option value={21}>21%</option>
            </select>
            <br/>
            <label>Prix : </label>
            <br></br>
            <input type="number" classname="prix" min="0" step="any" onChange={(e) => setPrix(e.target.value)} required></input>
            <br></br>
           {/*  <label>Image : </label>
            <input type="file" accept="image/*" onChange={handleImageChange} /> */}
            <button type="submit" className="button_submit bouton light">Valider</button>
        </form>
    )
}

export default NouveauProduit