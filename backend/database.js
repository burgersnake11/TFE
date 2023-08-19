const {Client} = require('pg')

const client =  new Client({
    host: "next_postgres",
    user: "postgres",
    port: 5432,
    password: "postgres",
    database: "TFE"

})


client.query("Select * from commune where pays = 'test'", (err, res)=>{
    if(!err){
        console.log(res.rows);
    }
    else{
        console.log(err.message);
    }
    client.end;
})
