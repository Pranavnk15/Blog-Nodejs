const express = require("express");
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');


const userRoute = require("./routes/user");

const app = express();
const PORT = 8000; 

mongoose.connect('mongodb://localhost:27017/blogify').then(e => console.log("Mongodb conected"));

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

app.use(express.urlencoded({extended: true}))


app.use(express.json());

app.get("/", (req, res) => {
    return res.render("home");
})

app.use("/user", userRoute);

app.listen(PORT, console.log(`Server Started at port ${PORT}`));