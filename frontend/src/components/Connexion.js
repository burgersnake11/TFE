import React, { useState } from 'react';
import axios from 'axios';

export function allComplete(string1, string2) {
    return !(string1 === null || string2 === null ||  string1 ==="" || string2 === "")
}

const Default = () => {
    const [email, setEmail] = useState(null)
    const [mdp, setMdp] = useState(null)

    
    const login_verif = async (e) => {
        if(allComplete(email, mdp)) {
            e.preventDefault();
            let values = {
                "email":email,
                "password": mdp
            }
            console.log(values)
        } else {
            alert("Veuillez compléter tous les champs")
        }
    }
    
    return (
        <div id="connection">
            <h2>Se connecter</h2>
            <form className='form_connection'>
                <div className="text_zone">
                    <i className="fa-sharp fa-solid fa-envelope"></i>
                    <input type="string" placeholder='Email du compte' onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="text_zone">
                    <i className="fa-sharp fa-solid fa-lock"></i>
                    <input type="password" placeholder='Mot de passe' onChange={(e) => setMdp(e.target.value)} />
                </div>
                <button className="bouton light" onClick={login_verif}>
                    Connexion
                </button>
                <button className="text_zone_button bouton light">
                    Mot de passe oublié ?
                </button>
            </form>
        </div>
    )
}

export default Default;