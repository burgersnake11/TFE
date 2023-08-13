import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import NouvelleActivite from "../components/NouvelleActivite";
import DetailJournee from "../components/DetailJournee";
import axios from "axios";

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const Agenda = () => {
  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year, month) => {
    // Correction : Décalage pour que lundi soit 0, mardi soit 1, etc.
    return (new Date(year, month, 1).getDay() + 6) % 7;
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const numDaysInMonth = getDaysInMonth(currentYear, currentDate.getMonth());
  const firstDayOfWeek = getFirstDayOfWeek(currentDate.getFullYear(), currentDate.getMonth());

  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const monthNumber = String(currentDate.getMonth() + 1).padStart(2, "0"); // Obtenir le numéro du mois en deux chiffres (07 pour juillet)
    let taches = []
    axios.get("http://54.37.9.74:3001/agenda", { params: { mois: monthNumber } }).then((res) => {
      taches = res.data;
      axios.get("http://54.37.9.74:3001/taches", { params: { mois: monthNumber } }).then((res2) => {
        res2.data.forEach((tache)=>{
          taches.push(tache)
        })
        setActivities(taches);
      });
    });

    setSelectedDay(new Date());
  }, []);

  const handleDayClick = (day) => {
    setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const prevMonth = () => {
    setSelectedDay(null); // Réinitialise selectedDay avant de changer de mois
    setCurrentDate((prevDate) => {
      const prevMonthDate = new Date(prevDate);
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      prevMonthDate.setDate(1); // Met à jour le jour actuellement affiché au premier jour du mois
      setSelectedDay(new Date(prevMonthDate));
      return prevMonthDate;
    });

    // Effectuer une nouvelle requête axios avec le mois précédent
    const prevMonthNumber = String(currentDate.getMonth()).padStart(2, "0"); // Obtenir le numéro du mois précédent en deux chiffres
    axios.get("http://54.37.9.74:3001/agenda", { params: { mois: prevMonthNumber } }).then((res) => {
      let taches = res.data;
      axios.get("http://54.37.9.74:3001/taches", { params: { mois: prevMonthNumber } }).then((res2) => {
        res2.data.forEach((tache)=>{
          taches.push(tache)
        })
        setActivities(taches);
      });
    });
  };

  // Fonction appelée lorsque le mois suivant est sélectionné
  const nextMonth = () => {
    setSelectedDay(null); // Réinitialise selectedDay avant de changer de mois
    setCurrentDate((prevDate) => {
      const nextMonthDate = new Date(prevDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      nextMonthDate.setDate(1); // Met à jour le jour actuellement affiché au premier jour du mois
      setSelectedDay(new Date(nextMonthDate));
      return nextMonthDate;
    });

    // Effectuer une nouvelle requête axios avec le mois suivant
    const nextMonthNumber = String(currentDate.getMonth() + 2).padStart(2, "0"); // Obtenir le numéro du mois suivant en deux chiffres
    axios.get("http://54.37.9.74:3001/agenda", { params: { mois: nextMonthNumber } }).then((res) => {
      let taches = res.data;
      axios.get("http://54.37.9.74:3001/taches", { params: { mois: nextMonthNumber } }).then((res2) => {
        res2.data.forEach((tache)=>{
          taches.push(tache)
        })
        setActivities(taches);
      });
    });
  };

  const formatDate = (date) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getActivitiesOfDay = () => {
    const dayDate = selectedDay.toDateString();
    return activities.filter((activity) => new Date(activity.date).toDateString() === dayDate);
  };

  const renderDays = () => {
    return daysOfWeek.map((day, index) => (
      <th key={index} className="agenda_colonne">
        {day}
      </th>
    ));
  };

  const renderCalendar = () => {
    const calendar = [];
    let day = 1;
  
    const renderCell = (day) => {
      const currentDay = day;
      const dayDate = new Date(currentYear, currentDate.getMonth(), currentDay);
      const activitiesForCurrentDay = activities.filter(
        (activity) =>
          new Date(activity.date).toDateString() === dayDate.toDateString()
      );
    
      activitiesForCurrentDay.sort((a, b) => {
        return a.heure_debut?.localeCompare(b.heure_debut) || 0;
      });
    
      const MAX_ACTIVITIES_TO_DISPLAY = 2;
      const additionalActivitiesCount = activitiesForCurrentDay.length - MAX_ACTIVITIES_TO_DISPLAY;
    
      return (
        <td onClick={() => handleDayClick(currentDay)} className="agenda_ligne">
          <div>
            <span >{day}</span>
            <div >
              {activitiesForCurrentDay.slice(0, MAX_ACTIVITIES_TO_DISPLAY).map((activity, index) => (
                <div key={index} >
                  {activity.heure_debut ? activity.heure_debut.substring(0, 5) : ""} - {activity.nom}
                </div>
              ))}
              {additionalActivitiesCount > 0 && (
                <button className="bouton light">
                  + {additionalActivitiesCount} autres
                </button>
              )}
            </div>
          </div>
        </td>
      );
    };

    
    for (let week = 0; day <= numDaysInMonth; week++) {
      const days = [];
  
      for (let dayIndex = 0; dayIndex < daysOfWeek.length; dayIndex++) {
        if (week === 0 && dayIndex < firstDayOfWeek) {
          days.push(<td ></td>);
        } else if (day > numDaysInMonth) {
          break;
        } else {
          days.push(renderCell(day));
          day++;
        }
      }
  
      calendar.push(<tr>{days}</tr>);
    }
  
    return calendar;
  };
  

  const renderDayDetails = () => {
    
    // Formatte la date dans le format souhaité
    const formattedDate = formatDate(selectedDay);
    const activitiesOfDay = getActivitiesOfDay();
    return (
      <div >
        <h3>{formattedDate}</h3>
        <DetailJournee activities={activitiesOfDay}/>
        <div style={{textAlign:"center"}}>
        <button onClick={openModal} className="bouton light">+</button>
        </div>
        <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
          <NouvelleActivite selectedDay={selectedDay.toLocaleDateString(undefined, { day: "numeric", month: "numeric", year: "numeric" })}/>
        </Modal>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "78vh" }} className="dark">
      <div style={{ flex: 3, padding: "5px", margin: "5px" }}>
        <div style={{ textAlign: "center" }}>
          <button className="bouton light" onClick={prevMonth}>Mois précédent</button>
          <span>{`${currentMonth} ${currentYear}`}</span>
          <button className="bouton light" onClick={nextMonth}>Mois suivant</button>
        </div>
        <table className="agenda_table">
          <thead>
            <tr>{renderDays()}</tr>
          </thead>
          <tbody>{renderCalendar()}</tbody>
        </table>
      </div>
      <div className="detail_border" style={{ flex: 1, padding: "5px", margin: "50px 5px 5px 5px", height: '92%'}}>
        {renderDayDetails()}
      </div>
    </div>
  );
};

export default Agenda;
