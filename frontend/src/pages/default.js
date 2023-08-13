import React, { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs'
import { useNavigate } from 'react-router-dom';

export function allComplete(string1, string2) {
    return !(string1 === null || string2 === null ||  string1 ==="" || string2 === "")
}

const Default = ({setIsLoggedIn}) => {
    const [email, setEmail] = useState(null)
    const [mdp, setMdp] = useState(null)
    const navigate = useNavigate();

    const login_verif = async (e) => {
        if(allComplete(email, mdp)) {
            e.preventDefault();
            const hashedPassword = bcrypt.hashSync(mdp, "$2a$10$sZk/IsTrgMV.iO0dRgU/xu");        
            let values = {
                "email":email,
                "password": hashedPassword
            }
            axios.post("http://localhost:3001/connexion", {"email":email,"password": hashedPassword}, { withCredentials: true })
                .then(response => {
                    alert("Vous êtes connecté")
                    setIsLoggedIn(true)
                    navigate('/');
                })
                .catch(response => {
                    console.log(response.response.status)
                    setIsLoggedIn(true)
                    alert("Email ou mot de passe incorrect")
                })
        } else {
            alert("Veuillez compléter tous les champs")
        }
        
    }
/*     function test(){
        axios.post("http://localhost:3001/test", {"email":"louisguiot11@gmail.com", "password":bcrypt.hashSync("#Rammus201975", "$2a$10$sZk/IsTrgMV.iO0dRgU/xu")}).then(res => {
            console.log(res)
        })
    } */
    
    return (
        <div id="connection" className='secondColor light' style={{
            textAlign:"center",
            marginTop:"15%",
            width:"10%",
            marginLeft:"45%",
            padding:"10px",
            borderRadius:"10px",
        }}>
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
{/*                 <button onClick={test}>
                    test 
                </button> */}
            </form>
        </div>
    )
}

export default Default;