const mongoose = require("mongoose");
const slugify = require("slugify")
// const User = require("./userModel.js");
// const validator = require("validator");
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tours must have a name"],
        unique: true,
        trim: true,
        maxLength: [40, "a tours name must have lte 40 chars!"],
        minLength: [5, "a tours name must have at least 6 chars!"],
        // validate: validator.isAlpha
    },
    duration: {
        type: Number,
        required: [true, "A tours must have a duration"],
    },
    maxGroupSize:{
        type: Number,
        required: [true, "A tours must have a group size"],
    },
    difficulty:{
      type: String,
       required: [true, "A tours must have a difficulty"],
        enum: {
          values:["easy", "medium", "difficult"],
          message: "wrong input for difficulty",
        },
    },
    rating: {
        type: Number,
        default: 4.5
    },
    ratingAverage:{
        type: Number,
        default: 4.5,
        min: [1, "ratingAverage must be above 1!"],
        max: [5, "ratingAverage must be under 5!"],
        set: val => Math.round(val * 10) / 10
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tours must have a price!"],
    },
    priceDiscount: {
        type: Number,
        validate: {
            // this only points to current doc on new document creation!
            validator: function (val){
                return val < this.price
            },
            message: "a discount ({VALUE}) must be below price itself!"
        }
    },
    summary:{
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, "A tours must have a description"],
    },
    imageCover:{
        type: String,
          required: [true, "A tours must have a img cover"],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour:{
      type: Boolean,
        default: false
    },
    premium: Boolean,
    slug: String,
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
    },
    locations: [
        {
            type:{
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number

        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",

        }
    ],

}, {
    toJSON:{virtuals: true},
    toObject: {virtuals: true},
})

tourSchema.index({price: 1, ratingAverage: -1})
tourSchema.index({slug:1})
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual("durationWeeks").get(function (){
    return this.duration/7;
})
// virtual populate
tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
})

tourSchema.virtual("likes", {
    ref: "Like",
    foreignField: "tour",
    localField: "_id"
})


// Doc middleware : runs before .save() and create()
tourSchema.pre("save", function(next){
    this.slug = slugify(this.name, {lower:true});
    next()
})

// tourSchema.pre("save",async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides =  await Promise.all(guidesPromises)
//
//
//     next()
// })

// tourSchema.post("save", function(doc,next){
//     console.log(doc)
//     next()
// })

// query middleware...

tourSchema.pre(/^find/, function(next){
    this.find({secretTour:{$ne: true}})
    next()
})

tourSchema.pre(/^find/,async function(next){
    this.populate({
        path:'guides',
        select: "-__v -passwordChangedAt"
    })
})

// aggregation Middleware

// tourSchema.pre("aggregate", function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne: true}}})
//     console.log(this.pipeline());
//     next();
// })




const Tour = mongoose.model("Tour", tourSchema);

module.exports =  Tour;
