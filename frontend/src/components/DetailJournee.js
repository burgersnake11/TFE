import React, { useState } from 'react';
import axios from 'axios';
import '../style/detail_journee.css'; // Importez le fichier CSS
import { useNavigate } from 'react-router-dom';

const DetailJournee = ({ activities }) => {
  const navigate = useNavigate();

  // Trie les activités par heure de début (du plus tôt au plus tard)
  activities.sort((a, b) => {
    if (a.heure_debut && b.heure_debut) {
      return a.heure_debut.localeCompare(b.heure_debut);
    } else if (a.heure_debut) {
      return -1;
    } else if (b.heure_debut) {
      return 1;
    } else {
      return 0;
    }
  });
  function navigate_to_to_do_list(commande_id) {
    navigate('/todolist', { state: [commande_id] });
  }
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}h${minutes.padStart(2, '0')}`;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
  
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    
    const start = new Date(2023, 6, 25, parseInt(startParts[0]), parseInt(startParts[1]));
    const end = new Date(2023, 6, 25, parseInt(endParts[0]), parseInt(endParts[1]));
  
    if (isNaN(start) || isNaN(end)) return '';
  
    const duration = (end - start) / (1000 * 60); // Durée en minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `(${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')})`;
  };
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activityToDeleteId, setActivityToDeleteId] = useState(null);
  const [expandedActivityId, setExpandedActivityId] = useState(null);

  const handleActivityClick = (activityId) => {
    if (expandedActivityId === activityId) {
      // Si l'activité est déjà développée, on la réduit en cliquant à nouveau dessus
      setExpandedActivityId(null);
    } else {
      // Sinon, on développe l'activité
      setExpandedActivityId(activityId);
    }
  };

  const handleDeleteConfirmation = (activityId) => {
    setActivityToDeleteId(activityId);
    setShowConfirmation(true);
  };

  const deleteActivity = (activityId) => {
    axios.delete(`http://localhost:3001/activite/${activityId}`)
      .then((response) => {
        // Recharger la page après la suppression
        window.location.reload();
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression de l\'activité:', error);
      });
  };

  return (
    <div className='dark'>
      <div style={{  padding: '10px', height:'90%'}}> 
        <div>
          {activities.map((activity) => {
            const startTime = activity.heure_debut ? formatTime(activity.heure_debut) : '';
            const endTime = activity.heure_fin ? formatTime(activity.heure_fin) : '';
            const duration = calculateDuration(activity.heure_debut, activity.heure_fin);
            return (
              <div key={activity.pk_activite_id}>
                <div
                  className={`secondcColor activity-item ${expandedActivityId === activity.pk_activite_id ? 'expanded' : ''}`} 
                  onClick={() => handleActivityClick(activity.pk_activite_id)}
                >
                  <span style={{ fontSize: '15px' }}>{activity.nom}</span>
                  <span style={{ fontSize: '15px' }}>
                    {startTime} {endTime && ` - ${endTime}`} {duration}
                  </span>
                  <button className="bouton light" onClick={() => handleDeleteConfirmation(activity.pk_activite_id)}>Supprimer</button>
                </div>
                {expandedActivityId === activity.pk_activite_id && (
                  <div>
                    {activity["fk_commande_id"] ? (
                      <div className="activity-description">
                      <button className="bouton light" onClick={() => navigate_to_to_do_list(activity["fk_commande_id"])}>
                      To do list
                    </button>
                    </div>
                    ) : (
                      <div className="activity-description">
                      <span style={{ fontSize: '20px', fontWeight: 'bold'}}>Description :</span>
                      <br/>
                      <span style={{ fontSize: '15px' }}>
                        {activity.description ? activity.description : "Pas de description"}
                      </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {showConfirmation && (
        <div className="confirmation-popup"> {/* Ajoutez la classe du popup de confirmation */}
          <div className="confirmation-popup-content"> {/* Ajoutez la classe du contenu du popup */}
            Êtes-vous sûr de vouloir supprimer cette activité ?
            <div className="confirmation-popup-buttons"> {/* Ajoutez la classe des boutons du popup */}
              <button className="bouton light" onClick={() => setShowConfirmation(false)}>Annuler</button>
              <button className="bouton light" onClick={() => { deleteActivity(activityToDeleteId); setShowConfirmation(false); }}>Oui</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailJournee;
