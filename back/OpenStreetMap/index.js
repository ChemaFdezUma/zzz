const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
require("dotenv").config({ path: "./config.env" });
const app = express();


const port = process.env.PORT;
app.use(express.json());

const productoRoutes = require("./routes/mapRouter.js")
app.use('/mapa', productoRoutes);


app.get("/",(req,res) =>{
  res.send("Esta es la API de OpenStreetMap")}
)
app.listen(port, console.log("Servidor de las calls de Mapa escuchando en el puerto ", port))