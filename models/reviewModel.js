const mongoose = require('mongoose');
const Tour = require('./tourModel.js');
const ReviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "review can not be empty"],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "review must belong to a tours!"],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "review must belong to a user!"],
    }
},{
    toJSON:{virtuals: true},
    toObject: {virtuals: true},
})

ReviewSchema.pre(/^find/, async function(next){
    this.populate({
        path: "user",
        select: "name photo"
    })
    next()
})

ReviewSchema.statics.calcAverageRatings =async function (tourId) {
    // this points to model
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tours',
                nRating: { $sum: 1 },
                avgRating: {$avg: '$rating' },
            }
        }
    ])

    if (stats.length>0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingAverage: stats[0].avgRating ,
            ratingQuantity: stats[0].nRating
        })
    }else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingAverage: 4.5 ,
            ratingQuantity: 0
        })
    }
}
ReviewSchema.index({tour: 1, user: 1},{unique: true})


ReviewSchema.post('save', function (){
    // this points to current review(doc)
    this.constructor.calcAverageRatings(this.tour)

})

ReviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne()
    // console.log(this.r)
    next()
})

ReviewSchema.post(/^findOneAnd/, async function(){
    // this.r = await this.findOne() Does not work here, query has already executed
    this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model("Review", ReviewSchema)

module.exports = Review;