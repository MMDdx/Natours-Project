const mongoose = require('mongoose')


const likeSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "must belong to someone!"]
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'must belong to a tour!'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

likeSchema.index({tour:1, user:1}, {unique: true})

const Like = mongoose.model("Like", likeSchema);
module.exports = Like