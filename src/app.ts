import express from 'express';
import { DataBase } from './utils/DataBase';


const app = express()
const port = 2325
const DB = new DataBase("mongodb://192.168.1.25:1224");
app.set("view engine", "ejs")

app.get('/', (req:any, res:any) => {
    res.send('Hello World!')
});

app.get('/index',(req:any, res:any)=>{
    //res.send('index')
    res.render("index")
});




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    console.log(`Use this url: http://127.0.0.1:2325`)
});