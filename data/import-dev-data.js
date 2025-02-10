const mongoose  = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./../config.env"})
const fs = require("fs")
const Tour = require("./../models/TourModel.js");
const Review = require("./../models/reviewModel.js");
const User = require("./../models/userModel.js");
mongoose.connect(process.env.DATABASE_LOCAL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => console.log("connected to mongodb!"))

// read json file...
const tours = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, "utf-8"))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"))

const import_data = async ()=>{
    try{
        await Tour.create(tours)
        await Review.create(reviews)
        await User.create(users, {
            validateBeforeSave: false
        })
        console.log('Data successfully imported')
        process.exit()
    }
    catch(err) {
        console.log(err)
    }
}

const deleteData = async ()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data successfully deleted')
        process.exit()
    }
    catch(err) {
        console.log(err)
    }
}
if (process.argv[2] === '--import'){
    import_data()
}else if(process.argv[2] === '--delete'){
    deleteData()
}

console.log(process.argv)
