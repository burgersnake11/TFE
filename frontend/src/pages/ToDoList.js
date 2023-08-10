import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const TodoList = () => {
  let commandNumber = useLocation().state[0]
  let client = useLocation().state[1]
  let nom_commande = useLocation().state[2]
  const [tasks, setTasks] = useState([]);
  const [taches_principales_id, setTaches_principales_id] = useState([])
  const [taches_secondaires_id, setTaches_secondaires_id] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    let id_principales = []
    let id_secondaires = []
    axios.get("http://localhost:3001/todo", { params: { "commande_id": commandNumber } }).then((res) => {
      res.data.forEach(tache => {
        id_principales.push(tache.pk_tache_principale_id)
        tache.subTasks.forEach(sous_tache => {
          id_secondaires.push(sous_tache.pk_tache_secondaire_id)
        })
      });
      setTasks(res.data);
      setTaches_principales_id(id_principales)
      setTaches_secondaires_id(id_secondaires)
    });
  }, []);

  const handleAddTask = () => {
    setTasks([...tasks, { title: '', completed: false, subTasks: [], date:"" }]);
  };

  const handleDeleteTask = (taskIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(taskIndex, 1);
    setTasks(updatedTasks);
  };

  const handleUpdateTaskTitle = (taskIndex, newTitle) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].title = newTitle;
    setTasks(updatedTasks);
  };

  const handleToggleTaskComplete = (taskIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;
    setTasks(updatedTasks);
  };

  const handleAddSubTask = (taskIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subTasks.push({ text: '', completed: false, date:"" });
    setTasks(updatedTasks);
  };

  const handleUpdateSubTask = (taskIndex, subTaskIndex, newSubTask) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subTasks[subTaskIndex].text = newSubTask;
    setTasks(updatedTasks);
  };

  const handleUpdateSubTaskDate = (taskIndex, subTaskIndex, date) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subTasks[subTaskIndex].date = date;
    setTasks(updatedTasks);
  };

  const handleDeleteSubTask = (taskIndex, subTaskIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subTasks.splice(subTaskIndex, 1);
    setTasks(updatedTasks);
  };

  const handleToggleSubTaskComplete = (taskIndex, subTaskIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subTasks[subTaskIndex].completed = !updatedTasks[taskIndex].subTasks[subTaskIndex].completed;
    setTasks(updatedTasks);
  };

  const handleUpdateTaskDate = (taskIndex, date) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].date = date;
    setTasks(updatedTasks);
  };
  const handleSaveTasks = () => {
    // Créer un objet pour stocker les tâches principales et sous-tâches
    const tasksToSave = tasks.map((task) => ({
      title: task.title,
      completed: task.completed,
      date:task.date,
      subTasks: task.subTasks.map((subTask) => ({
        text: subTask.text,
        completed: subTask.completed,
        date: subTask.date,
      })),
    }));
    // Stocker l'objet dans le stockage local (localStorage)
    axios.post('http://localhost:3001/todo', {"taches": tasksToSave, "commande_id":commandNumber, "taches_secondaire_id":taches_secondaires_id, "taches_principales_id":taches_principales_id}).catch((err) => {
      console.warn(err);
    });
    // Rafraîchir la page pour réinitialiser la to-do list
    navigate('/travaux');
  };

  const handleCancel = () => {
    // Rafraîchir la page pour annuler les modifications
    window.location.reload();
  };

  return (
    <div className="todo-list dark">
      <h2>To Do List pour la commande "{nom_commande}" pour le client "{client}"</h2>
      <button className="button-todo bouton light" onClick={handleAddTask}>Ajouter une tâche</button>
      <div className="tasks-container">
        {tasks.map((task, taskIndex) => (
          <div key={taskIndex} className="column">
            <div className="task-header">
              Tâche {taskIndex+1}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTaskComplete(taskIndex)}
              />
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleUpdateTaskTitle(taskIndex, e.target.value)}
              />
              <input type="date" value={task.date ? new Date(task.date).toISOString().split('T')[0] : ''} onChange={(e) => handleUpdateTaskDate(taskIndex, e.target.value)}></input>
              <button className="button-todo bouton light" onClick={() => handleDeleteTask(taskIndex)}>Supprimer la tâche</button>
            </div>
            <div className="sub-tasks">
              Sous-tâches :
              {task.subTasks.map((subTask, subTaskIndex) => (
                <div key={subTaskIndex} className={`sub-task ${subTask.completed ? 'completed' : ''}`}>
                  Sous-tâche {subTaskIndex+1}
                  <input
                    type="checkbox"
                    checked={subTask.completed}
                    onChange={() => handleToggleSubTaskComplete(taskIndex, subTaskIndex)}
                  />
                  <input
                    type="text"
                    value={subTask.text}
                    onChange={(e) => handleUpdateSubTask(taskIndex, subTaskIndex, e.target.value)}
                  />
                  <input type="date" value={subTask.date ? new Date(subTask.date).toISOString().split('T')[0] : ''} onChange={(e) => handleUpdateSubTaskDate(taskIndex, subTaskIndex, e.target.value)}></input>
                  <button className="button-todo bouton light" onClick={() => handleDeleteSubTask(taskIndex, subTaskIndex)}>Supprimer la sous tâche</button>
                </div>
              ))}
            </div>
            <button className="bouton light" onClick={() => handleAddSubTask(taskIndex)}>Ajouter une sous-tâche</button>
          </div>
        ))}
      </div>
      <div className="buttons-container">
        <button className="button-todo bouton light" onClick={handleSaveTasks}>Sauvegarder</button>
        <button className="button-todo bouton light" onClick={handleCancel}>Annuler</button>
      </div>
    </div>
  );
};

export default TodoList;
