import React, {useState, useEffect} from "react";
import axios from "axios";
import {useLocation, useNavigate } from 'react-router-dom';

const DetailProduit = () => {
    let id = useLocation().state[0]

    const [prix, setPrix] = useState(0)
    const [nom, setNom] = useState("")
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false); // Nouvel état pour le chargement des données

    useEffect(() => {
        axios.get("http://localhost:3001/produit", {params : {"id":id}}).then( res => {
            setNom(res.data.rows[0].nom_produit)
            setPrix(res.data.rows[0].prix)    
            setDataLoaded(true); // Marquer les données comme chargées
        })
    },[])
    function modifier_produit(e){
        e.preventDefault()
        let jsonToSend = {
            "id":id,
            "nom":nom,
            "prix":Number(prix),
        }
        axios.post("http://localhost:3001/produit", jsonToSend).catch(
            err => console.warn(err)
        ) 
        navigate('/produits');
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
            <input type="text"  classname="nom" onChange={(e) => setNom(e.target.value)} pattern="[A-Za-z\s]+" maxLength="20" required defaultValue={nom}></input>
            <br></br>
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