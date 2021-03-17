const mongoose = require("mongoose");
require("dotenv").config({path: "variables.env"});

const conectarDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log("Database Connected, yeeeey")
    } catch (error) {
        console.log("Hubo un error ", error);
        process.exit(1)
    }
}

module.exports = conectarDB;