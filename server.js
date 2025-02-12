const mongoose  = require("mongoose");
const dotenv = require("dotenv");

process.on('uncaughtException', (err) => {
    console.log("unhandled Exception!!!. Shutting down...");
    console.log(err.name, err.message);
    process.exit(1)
})

dotenv.config({path: "./config.env"})
const app = require(`./App.js`)

mongoose.connect(process.env.ATLAS_DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => console.log("connected to mongodb!"))


const port =  process.env.PORT || 3000

const server = app.listen(port,'0.0.0.0',(req, res)=>{
    console.log("server started on port ",port)
})

process.on('unhandledRejection', (err) => {
    console.log("unhandled rejection!!!. Shutting down...");
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1)
    })
})

