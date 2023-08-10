import React from 'react'
import { NavLink } from 'react-router-dom'
import "../style/navbar.css"

function Navbar() {

    return (
            <div>
                    <ul className="list mainColor">
                        <li className='item'>
                                <NavLink to="/produits" className="bouton">
                                    <label className='light' style={{cursor:"pointer"}}>Produits</label>
                                </NavLink>
                        </li>
                        <li className='item'>
                                <NavLink to="/clients" className="bouton">
                                <label className='light' style={{cursor:"pointer"}}>Clients</label>
                                </NavLink>
                        </li>
                        <li className='item'>
                                <NavLink to="/travaux" className="bouton">
                                <label className='light' style={{cursor:"pointer"}}>Travaux</label>
                                </NavLink>
                        </li>
                        <li className='item'>
                                <NavLink to="/historique_devis" className="bouton">
                                <label className='light' style={{cursor:"pointer"}}>Devis</label>
                                </NavLink>
                        </li>
                        <li className='item'>
                                <NavLink to="/historique_factures" className="bouton light">
                                <label className='light' style={{cursor:"pointer"}}>Factures</label>
                                </NavLink>
                        </li>
                        <li className='item'>
                                <NavLink to="/agenda" className="bouton">
                                <label className='light' style={{cursor:"pointer"}}>Agenda</label>
                                </NavLink>
                        </li>
                    </ul>
            </div>
    )

}

export default Navbar
