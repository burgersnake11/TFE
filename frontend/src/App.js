import React, {useState, useEffect} from "react";
import Default from "./pages/default.js" 
import Commandes from './pages/commandes';
import Clients from './pages/clients';
import Agenda from './pages/agenda';
import Navbar from './components/Navbar';
import NouvelleFacture from './pages/nouvelle_facture.js';
import NouveauClient from './pages/nouveau_client.js';
import NouvelleCommande from './pages/nouvelle_commande.js';
import Produits from './pages/produits.js';
import "./style/app.css"
import HistoriqueFactures from './pages/historique_factures.js';
import Facture from './pages/facture.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NouveauProduit from './pages/nouveau_produit.js';
import NouveauDevis from './pages/nouveau_devis.js';
import HistoriqueDevis from './pages/historique_devis.js'
import DetailDevis from './pages/detail_devis.js'
import TodoList from "./pages/ToDoList.js";
import ThemeCustomizer from './components/ThemeCustomizer.js';
import Modal from "react-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import DetailProduit from "./pages/detail_produit.js";
import DetailClient from "./pages/detail_client.js";
import Facture_devis from "./pages/facture_devis.js";
import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showThemeCustomizerModal, setShowThemeCustomizerModal] = useState(false); // Product modal state

  useEffect(() => {
    axios.get("http:/studio-eventail.be:3001/getcookie", { withCredentials: true })
      .then(res => {
        setIsLoggedIn(true);
      })
      .catch(error => {
        setIsLoggedIn(false);
      });
  }, []);

  function openThemeCustomizerModalModal() {
    setShowThemeCustomizerModal(true);
  }

  function closeThemeCustomizerModal() {
    setShowThemeCustomizerModal(false);
  }

  function handleLogout(){
    axios.post("http://54.37.9.74:3001/logout", { withCredentials: true }).then(res => {
      setIsLoggedIn(false);
    })
    .catch(error => {
      console.log(error)
    });
  }
  return (
    <div className='main'>
      <BrowserRouter>
      <p className='title dark'>
        <a href="http://54.37.9.74:3000" style={{color:"inherit", textDecoration:"none"}}>Studio éventail</a>       
        {isLoggedIn &&<button className="bouton light" style={{float:"right" }} onClick={handleLogout}>Déconnexion</button>}
      </p>
      <div className="element">
        {isLoggedIn && <Navbar className="navbar" />}
      </div>
            <Routes>
              <Route path="/login" element={<Default setIsLoggedIn={setIsLoggedIn}/>} />
                <Route element={<ProtectedRoute/>}>
                  <Route path="/">
                  <Route path="/clients" element={<Clients/>}/>
                  <Route path="/travaux" element={<Commandes/>}/>
                  <Route path="/agenda" element={<Agenda/>}/>
                  <Route path="/historique_factures" element={<HistoriqueFactures/>}/>
                  <Route path="/nouvelle_facture" element={<NouvelleFacture/>}/>
                  <Route path="/nouveau_client" element={<NouveauClient/>}/>
                  <Route path="/nouveau_travail" element={<NouvelleCommande/>}/>
                  <Route path='/facture' element={<Facture/>}/>
                  <Route path='/produits' element={<Produits/>}/>
                  <Route path='/nouveau_produit' element={<NouveauProduit/>}/>
                  <Route path='/nouveau_devis' element={<NouveauDevis/>}/>
                  <Route path='/historique_devis' element={<HistoriqueDevis/>}/>
                  <Route path='/detail_devis' element={<DetailDevis/>}/>
                  <Route path='/todolist' element={<TodoList/>}/>
                  <Route path='/detail_produit' element={<DetailProduit/>}/>
                  <Route path='/detail_client' element={<DetailClient/>}/>
                  <Route path='/facture_devis' element={<Facture_devis/>}/>
                </Route>
              </Route>
            </Routes>
        </BrowserRouter>
        {isLoggedIn && <><button className="bouton light CustomButton" onClick={openThemeCustomizerModalModal} >  <FontAwesomeIcon icon={faWandMagicSparkles} /></button>
        <Modal 
        isOpen={showThemeCustomizerModal}
        onRequestClose={closeThemeCustomizerModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            padding: "20px",
            borderRadius: "4px",
          },
        }}>
          <ThemeCustomizer/>
        </Modal></>}
        
    </div>
  );
}

export default App;
