const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    telefone : {
        type: String
    },
    nivel: {
        type: Number,
        required: true
    }
});

// Necessário adicionar no schema os metodos do passport
// O passportLocalMongoose oferece varios metodos para trabalharmos com nosso Schema, como login e etc.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);