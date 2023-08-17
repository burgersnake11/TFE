import React, {useState, useEffect} from "react";
import axios from "axios";
import {useLocation, useNavigate } from 'react-router-dom';

const DetailProduit = () => {
    let id = useLocation().state[0]

    const [prix, setPrix] = useState(0)
    const [nom, setNom] = useState("")
    const [tva, setTVA] = useState(0)
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false); // Nouvel état pour le chargement des données

    useEffect(() => {
        axios.get("https://54.37.9.74:3001/produit", {params : {"id":id}}).then( res => {
            setNom(res.data.rows[0].nom_produit)
            setPrix(res.data.rows[0].prix)
            setTVA(res.data.rows[0].tva)    
            setDataLoaded(true); // Marquer les données comme chargées
        })
    },[])
    function modifier_produit(e){
        e.preventDefault()
        if(nom.indexOf("'") !== -1 || nom.indexOf('"') !== -1){
            alert("Veuillez saisir un nom de produit sans guillement.");
            return;
        }
        else{
        let jsonToSend = {
            "id":id,
            "nom":nom,
            "prix":Number(prix),
            "tva":Number(tva)
        }
        axios.post("https://54.37.9.74:3001/produit", jsonToSend).catch(
            err => console.warn(err)
        ) 
        navigate('/produits');
        }
    }
    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
      };

    return(
        <form className="form_facture secondColor light" onSubmit={modifier_produit}>
            <h2>Modifier produit : </h2>
            <br></br>
            <label>Nom : </label>
            <br></br>
            <input type="text" style={{width:"35%"}} classname="nom" onChange={(e) => setNom(e.target.value)} maxLength="100" required defaultValue={nom}></input>
            <br></br>
            <label>TVA (en pourcentage):</label>
            <select onChange={(e) => setTVA(e.target.value)} value={tva}>
                <option value={6}>6%</option>
                <option value={21}>21%</option>
            </select>
            <br/>
            <label>Prix : </label>
            <br></br>
            <input type="number" classname="prix" min="0" step="any" onChange={(e) => setPrix(e.target.value)} required defaultValue={dataLoaded ? prix : ""}></input>
            <br></br>
           {/*  <label>Image : </label>
            <input type="file" accept="image/*" onChange={handleImageChange} /> */}
            <button type="submit" className="button_submit bouton light">Valider</button>
        </form>
    )
}

export default DetailProduit