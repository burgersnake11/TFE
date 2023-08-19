import React, { useState } from 'react';
import '../style/nouvelle_activite.css'; // Assurez-vous d'avoir le bon chemin vers votre fichier CSS
import axios from 'axios';

const formattedDate = (selectedDay) => {
  // Convert the date-like string to a valid Date object
  const [day, month, year] = selectedDay.split('/');
  const validDate = new Date(`${year}-${month}-${day}`);

  // Check if validDate is a valid Date object
  if (isNaN(validDate)) {
    console.error('Invalid date');
    return null;
  }

  // Use toLocaleDateString on validDate
  return validDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
};

const NouvelleActivite = ({ selectedDay }) => {
  const [activity, setActivity] = useState({
    nom: '',
    heure_debut: '',
    heure_fin: '',
    description: '',
    date: ''
  });
  const formatted = formattedDate(selectedDay);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity((prevActivity) => ({ ...prevActivity, [name]: value, ['date']:selectedDay}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Réinitialiser le formulaire après la soumission
    setActivity({ nom: '', heure_debut: '', heure_fin: '', description: '', date: '' });

    // Utilisez l'objet avec les nouvelles propriétés pour l'envoi de données
    axios.post('https://studio-eventail.be:3001/activite', activity).catch((err) => {
      console.warn(err);
    });
    window.location.reload();
  };

  return (
    <div className="App dark">
      <h1>Ajouter une activité pour le {formatted}</h1>
      <form onSubmit={handleSubmit} className='activite_form'>
        <label htmlFor="nom">Nom de l'activité:</label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={activity.nom}
          onChange={handleChange}
          required
        />

        <label htmlFor="heure_debut">Heure de début:</label>
        <input
          type="time"
          id="heure_debut"
          name="heure_debut"
          value={activity.heure_debut}
          onChange={handleChange}
        />

        <label htmlFor="heure_fin">Heure de fin:</label>
        <input
          type="time"
          id="heure_fin"
          name="heure_fin"
          value={activity.heure_fin}
          onChange={handleChange}
        />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={activity.description}
          onChange={handleChange}
          className="description-input"
        ></textarea>

        <button className="bouton light" type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default NouvelleActivite;
