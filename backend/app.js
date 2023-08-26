const { query } = require('express');
const express = require('express');
const app = express();
const argon2 = require('argon2');
app.use(express.json())
//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const {Client} = require('pg')
const { exit } = require('process');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
app.use(bodyParser.json());
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cookieParser = require('cookie-parser')
const session = require('express-session');

app.use(session({
  secret: '9748hb654g654k654j5s3q41fg6h54jk6l5k12s3q1ffg465jyfhdg54', // Remplacez par une clé secrète forte
  resave: false,
  saveUninitialized: false
}));


app.use(cookieParser('df4ds65f465sd4f65d4sf64s65f4s6d5f465s4f65s4f654s65f4s6f3s1df984a651q3524d68q4'));
const client =  new Client({
    host: "next_postgres",
    user: "postgres",
    port: 5432,
    password: "postgres",
    database: "TFE"

})
//=============================================DB==================================
client.connect()
    .then(()=> console.log('Connexion à PostgresSQL réussie !'))
    .catch((error) => console.error(error))

//=============================================CORS==================================
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://studio-eventail.be');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
function addBackslashes(inputString) {
  try {
  const escapedString = inputString.replace(/['"]/g, '\\$&');
  return escapedString;
  } catch (error) {
  return inputString;
  }
}
//app.set('trust proxy', 1);

/* var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://example.com/', true);
xhr.withCredentials = true;
xhr.send(null); */
app.use(express.json());
//=============================================ROUTE==================================

app.get('/test', (req, res) => {
    result = {}
    //show the saved cookies
    client.query("Select * from commune where pays = 'test'", (err, response)=>{
        if(!err){
            client.end;
            return res.status(200).json(response.rows);
        }
        else{
            console.log(err.message);
        }
    })
});

app.get("/factures", (req, res) => {
    client.query(
        "Select client.nom_societe, facture.pk_facture_id, facture.HTVA6, facture.HTVA21, facture.date_limite, facture.facture_numero, facture.payer, facture.description\
        from facture join commande on facture.fk_commande_id = commande.pk_commande_id\
        join client on commande.fk_client_id = client.pk_client_id\
        WHERE archiver_facture = false\
        order by facture.facture_numero DESC", (err, response)=>{
            return res.status(200).json(response)
    })
})

app.get("/montant", (req, res) => { 
    client.query(
        "select sum(facture.HTVA6) as HTVA6, sum(facture.HTVA21) as HTVA21\
        from facture\
        WHERE archiver_facture = false\
        group by payer", (err, response)=>{
            return res.status(200).json(response.rows)
    })
})



app.post('/nouvelle_facture', (req, res) => {
  let produits = req.body.produits

  client.query(
      "INSERT INTO public.facture (\
          facture_numero, description, fk_status_id, date_limite, fk_commande_id, fk_type_id, htva6, htva21, annee) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9\
            WHERE NOT EXISTS (SELECT 1 FROM public.facture WHERE facture_numero = $1)\
            returning pk_facture_id;",[req.body.numeroFacture, addBackslashes(req.body.descriptif),1, req.body.date_limite, req.body.fk_commande_id,1, req.body.HTVA6, req.body.HTVA21, new Date().getFullYear()],(err, response) => {
              if(err){
                console.error(err)
              }
              else{
                const pk_facture_id = response.rows[0].pk_facture_id;
  
                const insertProductsQuery = `
                  INSERT INTO public.produits_devis (fk_facture_id, fk_produit_id, quantite)
                  VALUES ($1, $2, $3);
                `;
            
                produits.forEach((produit) => {
                  const insertProductsValues = [pk_facture_id, produit.id, produit.quantity];
                  client.query(insertProductsQuery, insertProductsValues, (insertError) => {
                    if (insertError) {
                      console.error(insertError);
                    }
                  });
                });
              }
    }
  )

})

app.get('/clients',(req, res) => {
    client.query(
        "SELECT *\
        FROM public.client\
        join commune on fk_commune_id = pk_commune_id", (err, response)=>{
            return res.status(200).json(response.rows)
        }
    )
} )

/* app.get('/commandes',(req, res) => {
    client.query(
        "SELECT commande.pk_commande_id, commande.description, client.nom_societe\
        FROM public.commande\
        join client on pk_client_id = fk_client_id", (err, response)=>{
            return res.status(200).json(response.rows)
        }
    )
} ) */
app.post("/nouveau_client", (req, res) => {
    client.query(
        "INSERT INTO public.commune (\
         nom_commune, code_postal, pays) VALUES ($1,$2,$3)\
        returning pk_commune_id;",[addBackslashes(req.body.commune), req.body.code_postal, addBackslashes(req.body.pays)], (err, response)=>{
            let id = response.rows[0].pk_commune_id

            client.query(
                "INSERT INTO public.client (\
                nom_societe, nom, prenom, gsm, fixe, email, rue, numero, status, fk_commune_id) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10\
                WHERE NOT EXISTS (SELECT 1 FROM public.client WHERE email = $6)\
                returning pk_client_id;",[addBackslashes(req.body.nom_societe), addBackslashes(req.body.nom), addBackslashes(req.body.prenom), req.body.gsm, req.body.fixe, req.body.email, addBackslashes(req.body.rue), req.body.numero, 'test', id], (err, response)=>{
                    console.log(err)
                }
            )
        }
    )
})

app.post("/nouvelle_commande", (req, res) => {
  client.query( 
      "INSERT INTO public.commande (\
      fk_client_id, nom_commande) SELECT $1,$2\
      WHERE NOT EXISTS (SELECT 1 FROM public.commande WHERE nom_commande = $2)", [req.body.id, addBackslashes(req.body.nom_commande)], (err, response)=>{
          console.log(err)
      }
  )
})

app.get("/facture", (req, res) => {
    client.query(
        "SELECT * FROM public.facture\
		join commande on commande.pk_commande_id = facture.fk_commande_id\
		join client on client.pk_client_id = commande.fk_client_id\
		join commune on commune.pk_commune_id = client.fk_commune_id\
		where facture.pk_facture_id ="+req.query.id, (err, response)=>{
            facture = response.rows[0]
            facture["produits"] = []
            client.query(
              "SELECT * FROM public.produits_devis\
              JOIN produits on produits.pk_produits_id = produits_devis.fk_produit_id\
              WHERE fk_facture_id = "+req.query.id, (err, response)=>{
                produits = response.rows
                produits.forEach((produit) => {
                  facture["produits"].push({"product":produit.nom_produit, "price": produit.prix, "quantity":produit.quantite, "id":produit.fk_produit_id, "tva":produit.tva})
                })
                return res.status(200).json(facture)
              }
            )
        }
    )
})

app.post("/facture", (req, res) => {
  let produits = req.body.produits
  client.query(
    `DELETE FROM produits_devis WHERE fk_facture_id = $1`,
    [req.body.id],
  )
    client.query(
        "UPDATE facture\
        SET htva6 = "+req.body.HTVA6 +", htva21 = "+req.body.HTVA21+", description = '"+addBackslashes(req.body.descriptif)+"', date_limite = '"+req.body.date+"'\
        WHERE pk_facture_id = "+ req.body.id, (err, response) => {
            console.log(err)
        }
    )
    const insertProductsQuery = `
    INSERT INTO public.produits_devis (fk_facture_id, fk_produit_id, quantite)
    VALUES ($1, $2, $3);
  `;

  produits.forEach((produit) => {
    const insertProductsValues = [req.body.id, produit.id, produit.quantity];

    client.query(insertProductsQuery, insertProductsValues, (insertError) => {
      if (insertError) {
        console.error(insertError);
      }
    });
  });
})

/* app.post('/produits', (req, res) => {
    console.log(req.body)
    const image = req.files.image;
    fs.readFile(image.tempFilePath, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors de la lecture de l\'image');
      }
  
      // Continuez avec l'étape suivante pour stocker les données binaires de l'image dans la base de données
    });
  }); */

app.get('/devis', (req, res) => {
    client.query(
        "SELECT * FROM public.devis \
        JOIN public.commande on devis.fk_commande_id = commande.pk_commande_id \
        JOIN public.client on client.pk_client_id = commande.fk_client_id\
        JOIN public.commune on commune.pk_commune_id = client.fk_commune_id\
        WHERE archiver = false\
        order by devis_numero DESC", (err, response)=>{
            return res.status(200).json(response.rows)
        }
    )
})

app.get('/produits', (req, res) => {
    client.query(
        "SELECT * FROM public.produits\
        order by nom_produit", (err, response)=>{
            return res.status(200).json(response.rows)
        })
})


app.post('/produits', (req, res) => {
  client.query(
    `INSERT INTO public.produits (nom_produit, prix, tva) SELECT $1, $2, $3\
    WHERE NOT EXISTS (SELECT 1 FROM public.produits WHERE nom_produit = $1)`,
    [addBackslashes(req.body.nom_produit), req.body.prix, req.body.TVA], (err, response) => {
      console.log(err)
  }
  )
})

app.get('/agenda', (req, res) => {
    client.query(
        "SELECT * FROM public.agenda\
        WHERE EXTRACT(MONTH FROM date) = "+req.query.mois, (err, response) => {
            return res.status(200).json(response.rows)
        })
})

app.post('/activite', (req, res) => {
    let str_request = "INSERT INTO public.agenda (\
        nom, date" 
    let str_values = ") VALUES ($1,$2"
    let date = req.body.date.split("/")[2]+"-"+req.body.date.split("/")[1]+"-"+req.body.date.split("/")[0]
    let values = [addBackslashes(req.body.nom), date]
    if(req.body.heure_debut){
        str_request+=", heure_debut"
        str_values+="$"+(values.length())
        values.push(req.body.heure_debut)
    }
    if(req.body.heure_fin){
        str_request+=", heure_fin"
        str_values+="$"+(values.length())
        values.push(req.body.heure_fin)
    }
    if(req.body.description){
        str_request+=", description"
        str_values+="$"+(values.length())
        values.push(addBackslashes(req.body.description))
    }
    client.query(
        str_request+str_values+")",values, (err, response) => {
                console.log(err)
            }
        )
} )

app.delete('/activite/:activityId', (req, res) => {
    const activityId = req.params.activityId;
  
    client.query(
      "DELETE FROM agenda\
      WHERE pk_activite_id = $1",
      [activityId],
      (err, response) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'activité:', err);
          res.status(500).json({ error: 'Erreur lors de la suppression de l\'activité' });
        } else {
          res.status(200).json({ message: 'Activité supprimée avec succès!' });
        }
      }
    );
  });

app.post('/todo', (req, res) => {
  
    // Supprimer les tâches secondaires liées aux tâches principales à supprimer
    req.body.taches_secondaire_id.forEach((idTacheSecondaire) => {
      client.query(
        `DELETE FROM tache_secondaire WHERE pk_tache_secondaire_id = $1`,
        [idTacheSecondaire],
        (err) => {
          if (err) {
            console.error('Erreur lors de la suppression de la sous-tâche :', err);
          }
        }
      );
    });
  
    // Supprimer les tâches principales à supprimer (et leurs sous-tâches seront supprimées automatiquement en cascade)
    req.body.taches_principales_id.forEach((idTachePrincipale) => {
      client.query(
        `DELETE FROM tache_principale WHERE pk_tache_principale_id = $1`,
        [idTachePrincipale],
        (err) => {
          if (err) {
            console.error('Erreur lors de la suppression de la tâche principale :', err);
          }
        }
      );
    });
    // Ajouter les tâches principales et sous-tâches
    req.body.taches.forEach((task) => {
      const { title, completed, date, subTasks } = task;
      if(!date){
        client.query(
          `INSERT INTO tache_principale (titre, finie, fk_commande_id) VALUES ($1, $2, $3) RETURNING pk_tache_principale_id`,
          [addBackslashes(title), completed, req.body.commande_id], // Remplacez "commande_id" par l'ID de la commande appropriée
          (err, response) => {
            if (err) {
              console.error('Erreur lors de l\'insertion de la tâche principale :', err);
            } else {
              const tachePrincipaleId = response.rows[0].pk_tache_principale_id;
    
              // Ajouter les sous-tâches liées à la tâche principale
              subTasks.forEach((subTask) => {
                const { text, completed, date } = subTask;
                if(!date){
                  client.query(
                    `INSERT INTO tache_secondaire (titre, finie, fk_tache_principale_id) VALUES ($1, $2, $3)`,
                    [addBackslashes(text), completed, tachePrincipaleId],
                    (err) => {
                      if (err) {
                        console.error('Erreur lors de l\'insertion de la sous-tâche :', err);
                      }
                    }
                  );
                }
                else{
                client.query(
                  `INSERT INTO tache_secondaire (titre, finie, fk_tache_principale_id, date) VALUES ($1, $2, $3, $4)`,
                  [addBackslashes(text), completed, tachePrincipaleId, date],
                  (err) => {
                    if (err) {
                      console.error('Erreur lors de l\'insertion de la sous-tâche :', err);
                    }
                  }
                );
                }
              });
            }
          }
        );
      }
      else{
        client.query(
          `INSERT INTO tache_principale (titre, finie, fk_commande_id, date) VALUES ($1, $2, $3, $4) RETURNING pk_tache_principale_id`,
          [addBackslashes(title), completed, req.body.commande_id, date], // Remplacez "commande_id" par l'ID de la commande appropriée
          (err, response) => {
            if (err) {
              console.error('Erreur lors de l\'insertion de la tâche principale :', err);
            } else {
              const tachePrincipaleId = response.rows[0].pk_tache_principale_id;
    
              // Ajouter les sous-tâches liées à la tâche principale
              subTasks.forEach((subTask) => {
                const { text, completed, date } = subTask;
                if(!date){
                  date=""
                }
                client.query(
                  `INSERT INTO tache_secondaire (titre, finie, fk_tache_principale_id, date) VALUES ($1, $2, $3, $4)`,
                  [addBackslashes(text), completed, tachePrincipaleId, date],
                  (err) => {
                    if (err) {
                      console.error('Erreur lors de l\'insertion de la sous-tâche :', err);
                    }
                  }
                );
              });
            }
          }
        );
      }
    });
  
    res.send('Les tâches ont été mises à jour dans la base de données.');
  });
  

app.get('/todo', async (req, res) => {
    try {
  
      // Récupérer les tâches principales de la table "tache_principale"
      const queryPrincipale = `SELECT * FROM tache_principale WHERE fk_commande_id = $1`;
      const valuesPrincipale = [req.query.commande_id];
      const resultPrincipale = await client.query(queryPrincipale, valuesPrincipale);
  
      // Pour stocker les tâches principales et leurs sous-tâches
      const tasks = [];
  
      // Pour chaque tâche principale, récupérer les sous-tâches associées de la table "tache_secondaire"
      for (const taskPrincipale of resultPrincipale.rows) {
        const querySecondaire = `SELECT * FROM tache_secondaire WHERE fk_tache_principale_id = $1`;
        const valuesSecondaire = [taskPrincipale.pk_tache_principale_id];
        const resultSecondaire = await client.query(querySecondaire, valuesSecondaire);
  
        // Transformer les données pour le format souhaité
        const subTasks = resultSecondaire.rows.map((row) => ({
          text: row.titre,
          completed: row.finie,
          date: new Date(row.date).toLocaleDateString('fr-FR').split('/').reverse().join('-'),
          pk_tache_secondaire_id: row.pk_tache_secondaire_id,
        }));
        // Ajouter la tâche principale et ses sous-tâches à la liste des tâches
        tasks.push({
          pk_tache_principale_id: taskPrincipale.pk_tache_principale_id,
          title: taskPrincipale.titre,
          completed: taskPrincipale.finie,
          date: new Date(taskPrincipale.date).toLocaleDateString('fr-FR').split('/').reverse().join('-'),
          subTasks,
        });
      }
      // Retourner la liste des tâches principales et sous-tâches
      res.json(tasks);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches :', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
    }
  });

  app.get('/commandes', async (req, res) => {
    client.query("select * from public.commande \
    join client on pk_client_id=fk_client_id \
    join commune on pk_commune_id=fk_commune_id\
    order by nom_commande", (err, response) => {
      return res.status(200).json(response.rows)
    })
  });

  app.post('/devis', (req, res) => {
    console.log(req.body)
    let produits = req.body.produits
    const createDevisQuery = `
      INSERT INTO public.devis (prix_total, fk_commande_id, devis_numero, annee, date_creation, description)
      SELECT $1, $2, $3 ,$4, $5, $6
      WHERE NOT EXISTS (SELECT 1 FROM public.devis WHERE devis_numero = $3)
      RETURNING pk_devis_id;
    `;
  
    const devisValues = [req.body.prix_total, req.body.fk_commande_id, req.body.devis_numero, new Date().getFullYear(), new Date(), addBackslashes(req.body.description)];
  
    client.query(createDevisQuery, devisValues, (devisError, devisResult) => {
      if (devisError) {
        console.error(devisError);
        res.status(500).json({ error: 'An error occurred while creating the devis.' });
        return;
      }
  
      const pk_devis_id = devisResult.rows[0].pk_devis_id;
  
      const insertProductsQuery = `
        INSERT INTO public.produits_devis (fk_devis_id, fk_produit_id, quantite)
        VALUES ($1, $2, $3);
      `;
  
      produits.forEach((produit) => {
        const insertProductsValues = [pk_devis_id, produit.id, produit.quantity];
        client.query(insertProductsQuery, insertProductsValues, (insertError) => {
          if (insertError) {
            console.error(insertError);
          }
        });
      });
  
      res.status(201).json({ message: 'Devis created successfully.' });
    });
  });

  app.get("/produit", (req, res) => {
    client.query(
        "SELECT * FROM public.produits\
		    where produits.pk_produits_id ="+req.query.id, (err, response)=>{
            return res.status(200).json(response)
        }
    )
})

app.post("/produit", (req, res) => {
    client.query(
        "UPDATE produits\
        SET nom_produit = '"+req.body.nom +"', prix = "+req.body.prix+", tva = "+req.body.tva+"\
        WHERE pk_produits_id = "+ req.body.id, (err, response) => {
            console.log(err)
        }
    )
})

app.get("/client", (req, res) => {
  client.query(
      "SELECT * FROM public.client\
      JOIN commune on pk_commune_id =fk_commune_id\
      where client.pk_client_id ="+req.query.id, (err, response)=>{
          return res.status(200).json(response)
      }
  )
})

app.post("/client", (req, res) => {
  client.query(
    "UPDATE commune\
    SET nom_commune = '"+req.body.commune +"', code_postal = "+req.body.code_postal+", pays = '"+req.body.pays+"'\
    WHERE pk_commune_id = "+ req.body.id_commune, (err, response) => {
        console.log(err)
    }
  )
  client.query(
      "UPDATE client\
      SET nom_societe = '"+req.body.nom_societe +"',\
      nom = '"+req.body.nom +"',\
      prenom = '"+req.body.prenom +"',\
      gsm = "+req.body.gsm +",\
      fixe = "+req.body.fixe +",\
      email = '"+req.body.email +"',\
      rue = '"+req.body.rue +"',\
      numero = "+req.body.numero +"\
      WHERE pk_client_id = "+ req.body.id, (err, response) => {
          console.log(err)
      }
  )
})

app.get("/detail_devis", (req, res) => {
  let devis ={}
  let produits = {}
  client.query(
      "SELECT * FROM public.devis\
      JOIN commande on pk_commande_id =fk_commande_id\
      JOIN client on pk_client_id = fk_client_id\
      JOIN commune on pk_commune_id = fk_commune_id\
      where pk_devis_id ="+req.query.id, (err, response)=>{
          devis = response.rows[0]
          devis["produits"] = []
          client.query(
            "SELECT * FROM public.produits_devis\
            JOIN produits on produits.pk_produits_id = produits_devis.fk_produit_id\
            WHERE fk_devis_id = "+req.query.id, (err, response)=>{
              produits = response.rows
              produits.forEach((produit) => {
                devis["produits"].push({"product":produit.nom_produit, "price": produit.prix, "quantity":produit.quantite, "id":produit.fk_produit_id, "tva":produit.tva})
              })
              return res.status(200).json(devis)
            }
          )
      }
  )
})

app.post("/modifier_devis", (req, res) => {
  let produits = req.body.produits
  client.query(
    `DELETE FROM produits_devis WHERE fk_devis_id = $1`,
    [req.body.id],
  )
  client.query(
      "UPDATE devis\
      SET prix_total = "+Number(req.body.prix_total)+", fk_commande_id="+req.body.commande_id+"\
      WHERE pk_devis_id = "+ req.body.id, (err, response) => {
          console.log(err)
      }
  )
  const insertProductsQuery = `
        INSERT INTO public.produits_devis (fk_devis_id, fk_produit_id, quantite)
        VALUES ($1, $2, $3);
      `;
  
      produits.forEach((produit) => {
        const insertProductsValues = [req.body.id, produit.id, produit.quantity];
  
        client.query(insertProductsQuery, insertProductsValues, (insertError) => {
          if (insertError) {
            console.error(insertError);
          }
        });
      });
})
app.post("/archiver_devis", (req, res) => {
  client.query(
    "UPDATE devis\
    SET archiver=true\
    WHERE pk_devis_id = "+ req.body.id, (err, response) => {
        console.log(err)
    })
})
app.post("/archiver_facture", (req, res) => {
  client.query(
    "UPDATE facture\
    SET archiver_facture=true\
    WHERE pk_facture_id = "+ req.body.id, (err, response) => {
        console.log(err)
    })
})
app.post("/payer_facture", (req, res) => {
  client.query(
    "UPDATE facture\
    SET payer= NOT payer, date_paiement = '"+new Date().toISOString()+"'\
    WHERE pk_facture_id = "+ req.body.id, (err, response) => {
        console.log(err)
    })
})
app.get("/devis_numero", (req, res) => {
  client.query(
    "SELECT MAX(devis_numero) FROM devis\
    WHERE annee = "+new Date().getFullYear(), (err, response)=>{
      return res.status(200).json(response)
  }
  )
})

app.get("/facture_numero", (req, res) => {
  client.query(
    "SELECT MAX(facture_numero) FROM facture\
    WHERE annee = "+new Date().getFullYear(), (err, response)=>{
      return res.status(200).json(response)
  }
  )
})

app.get("/taches", (req,res) => {
  client.query(
    "SELECT titre as nom, date, fk_commande_id, nom_societe, nom_commande FROM public.tache_principale\
    JOIN commande on pk_commande_id = fk_commande_id\
    JOIN client on pk_client_id = fk_client_id\
    WHERE EXTRACT(MONTH FROM date)= "+req.query.mois+" AND finie=false", (err, response) => {
      let taches = response.rows
      client.query(
        "SELECT tache_secondaire.titre as nom, tache_secondaire.date, fk_commande_id, nom_societe, nom_commande FROM public.tache_secondaire\
        JOIN public.tache_principale on fk_tache_principale_id = pk_tache_principale_id\
        JOIN commande on pk_commande_id = fk_commande_id\
        JOIN client on pk_client_id = fk_client_id\
        WHERE EXTRACT(MONTH FROM tache_secondaire.date)= "+req.query.mois+" AND tache_secondaire.finie=false", (err, response2) => {
          response2.rows.forEach((tache)=>{
            taches.push(tache)
          })
          return res.status(200).json(taches)
      })
  })
  
})

app.post('/mail_facture', upload.single('pdf'), async (req, res) => {
  try {
    const regex = /\r\n|\r|\n/g;
    const pdfFileBuffer = req.file.buffer; // Contenu du fichier PDF en tant que Buffer
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: '',
      },
    });
    const emailContent = `
    <p>`+req.body.message.replace(regex, '<br></br>')+`</p>
    <img src="cid:logo">
    <p><br></br>Ce message est susceptible de contenir des informations confidentielles strictement réservées à l’usage de la personne à qui il est adressé. <br></br>Si vous n’êtes pas le destinataire visé, toute lecture, utilisation, divulgation ou copie du contenu de ce message est interdite. <br></br> Si vous avez reçu ce courriel par erreur, veuillez en aviser l’expéditeur sur-le-champ."</p>
  `;
    const mailOptions = {
      from: 'studio.eventail.facture@gmail.com',
      to: [req.body.email],
      cc: ['louisguiot11@gmail.com'],
      subject: req.body.sujet,
      html: emailContent,
      attachments: [
        {
          filename: 'apercu.pdf',
          content: pdfFileBuffer,
        },
        {
          filename: 'Logo.png',
          path: 'signature.jpg',
          cid: 'logo'
        }
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send('Email envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email depuis le backend', error);
      res.status(500).send('Une erreur est survenue lors de l\'envoi de l\'email');
    }
  } catch (error) {
    console.error('Erreur lors de la réception du PDF', error);
    res.status(500).send('Une erreur est survenue lors de la réception du PDF');
  }
});

app.get("/connexion", (req, res)=>{
  client.query("SELECT * from public.user where email = '"+req.query.email+"'",(err, response) => {
    if(response){
      if(response.rows[0].password === req.query.password){
        return res.status(200).json("Connexion réussie")
      }
      else{
        return res.status(200).json("Connexion échouée")
      }
    }     
    else{
      return res.status(200).json("Connexion échouée")
    }
  })
});

app.post("/connexion", (req, res)=> {
  let mailCrypt;
  client.query("SELECT * from public.user where email = '"+req.body.email+"'",(err, response) => {
    if(response.rows[0]){
      argon2.verify(response.rows[0].password, req.body.password)
      .then(mdp => {
        res.cookie('id', response.rows[0].pk_user_id, {
          maxAge: 500000,
          // expires works the same as the maxAge
          //secure: false, // mettre l'attribut à true une fois que le site est en HTTPS
          httpOnly: true,
          SameSite: 'None',
          signed: true,
        });
        req.session.userId = response.rows[0].pk_user_id;

        res.status(200).json("test");
      })
      }
      else {
        res.status(401).json();
      }
  })
});

app.get('/getcookie', (req, res) => {
  // Obtenez l'ID de l'utilisateur côté serveur (si stocké dans la session)
  client.query("SELECT * from public.user where email = '"+req.body.email+"'",(err, response) => {
  })
  const userIdServer = req.session.userId;

  // Vérifiez si le cookie signé correspond à l'ID de l'utilisateur
  const signedCookie = req.signedCookies.id;
  if(signedCookie!== undefined){
    if (String(signedCookie) === String(userIdServer)) {
      // Renvoyez les cookies signés
      return res.status(200).json(req.signedCookies);
    } else {
      return res.status(401).json({ message: 'Non autorisé' });
    }
  } else {
    return res.status(401).json({ message: 'Non autorisé' });
  }

});

app.post('/logout', (req, res) => {
  // Supprimer la session côté serveur
  req.session.destroy(err => {
    if (err) {
      console.error('Erreur lors de la destruction de la session :', err);
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    // Supprimer le cookie côté client
    res.clearCookie('id', { signed: true });

    res.json({ message: 'Déconnexion réussie' });
  });
});
/*app.post("/test", (req, res) => {
  argon2.hash(req.body.password).then(passwordhashed => {
    client.query("INSERT INTO public.user (email, password) VALUES ('"+req.body.email+"', '"+passwordhashed+"')", (err, response) => {
      console.log(err)
  })
  })
}) 

app.get("/truc", (req, res) => {
	return res.status(200).json("stp");
})*/

module.exports = app

