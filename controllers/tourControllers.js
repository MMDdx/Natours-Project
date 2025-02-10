const Tour = require("./../models/tourModel.js")
const APIFeatures = require("../utils/apiFeatures.js")
const catchAsync = require("./../utils/catchAsync.js")
const AppError = require("../utils/appError");
const factory = require("./handlerFactory.js")
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {

    if (!req.files.imageCover || !req.files.images) return next();
    console.log("happening!")
    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2 images
    req.body.images = []
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-cover-${i+1}.jpeg`
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
    }))
    console.log(req.body)
    return next();
})


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = "-ratingAverage,summary,difficulty"
    next()
}

//
// exports.checkId = (req, res, next, value) => {
//     console.log(`this is id:--->${value}`)
//     const id = +req.params.id
//     if (id > tours[tours.length-1].id) {
//         return res.status(404).json({
//             status:"error",
//             message:"id not found!"
//         })
//     }
//     next()
// }

exports.getAllTours  = factory.getAll(Tour)
    // sorting ...
    // if (req.query.sort){
    //     const sortBy  = req.query.sort.split(",").join(" ")
    //     querry = querry.sort(sortBy)
    // }else {
    //     querry.sort("-createdAt")
    // }
    // field limiting...
    // if (req.query.fields){
    //     const fields = req.query.fields.split(',').join(' ')
    //     querry = querry.select(fields)
    //
    // }else {
    //     querry = querry.select("-__v")
    // }
    // pagination...

    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 100;
    // const skip = (page - 1) * limit
    //
    // querry = querry.skip(skip).limit(limit)
    //
    // if (req.query.page){
    //     const numTours = await Tour.countDocuments()
    //     if (skip>=numTours) {
    //         throw new Error
    //     }
    // }
    // execute Query...



exports.getTour = factory.getOne(Tour, {path: "reviews"})
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)
// exports.deleteTour =catchAsync (async (req,res,next)=>{
//     let tours = await Tour.findByIdAndDelete(req.params.id)
//     if (!tours){
//         return next(new AppError("No Tour with that id found",404))
//     }
//     res.status(204).json({
//         message: "success!",
//
//     })
// })


exports.createTour = factory.createOne(Tour)


exports.getTourStats = catchAsync(async (req,res,next)=>{
    const stats = await Tour.aggregate([
        {$match: {ratingAverage: {$gte:4.5}}},
        {
            $group: {
                _id: {$toUpper :"$difficulty"},
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingQuantity' },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort : {avgPrice: -1}
        },
        // {$match: {_id:{$ne: "EASY"}}}
    ]);
    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })

})

exports.getMonthlyPlan= catchAsync(async (req, res,next)=>{
    const year = +req.params.year ;
    const  plan  = await Tour.aggregate([
        {
            $unwind: "$startDates"
        },
        {
            $match:{
                startDates: {$gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            }
        },
        {
            $group:{
                _id: {$month:"$startDates"},
                numToursStarts:{$sum:1},
                tours: {$push: "$name"}
            }
        },
        {
            $addFields: { month: "$_id"}
        },
        {
            $project: {
                _id: 0
            }
        }, {
            $sort: {numToursStarts: 1}
        },
        // {
        // $limit: 6
        // }

    ])
    res.status(200).json({
        status: "success",
        len: [...plan].length,
        data: {
            plan
        }
    })
})
  //  /tours-within/234/center/33.978788072245806,-118.21887618925118/unit/mi
// 33.978788072245806, -118.21887618925118
exports.getToursWithin =catchAsync(async (req,res,next)=>{
    const {distance, latlng , unit} = req.params
    const [lat,lng] = latlng.split(",");
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) return next(new AppError("please provide longitude in format lat,lng.", 400))
    console.log(distance, lat, lng, unit)

    const tours = await Tour.find({ startLocation: { $geoWithin: {$centerSphere: [[lng,lat], radius] }} })
    // startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    res.status(200).json({
        status: "success",
        results : tours.length,
        data: tours
    })
})


exports.getDistances = catchAsync(async (req,res,next)=>{
    const {latlng , unit} = req.params
    const [lat,lng] = latlng.split(",");
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) return next(new AppError("please provide longitude in format lat,lng.", 400))

    const distances = await Tour.aggregate([
        {
            $geoNear: {
            near: {
                type: "Point",
                coordinates: [+lng, +lat]
            },
                distanceField : 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1,
            }
        }
    ])

    res.status(200).json({
        status: "success",
        data: distances
    })
})
