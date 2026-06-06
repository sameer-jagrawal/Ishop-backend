// success response 
const sendSuccess = (res, masg = "Success", data = {},meta = {})=>{
    return res.status(200).json({
        success :  true,
        masg,
        message: masg,
        data,
        meta
    })
}

// created response
const sendCreated  = (res, masg = "Created Successfully ", data = {})=>{
    return res.status(201).json({
        success :  true,
        masg,
        message: masg,
        data
    })
}

// update response
const sendupdate  = (res, masg = "Updated Successfully ", data = {}, meta={})=>{
    return res.status(201).json({
        success :  true,
        masg,
        message: masg,
        data,
        meta: meta ?? {imagebaseurl:"http://localhost:5000/category" }
    })
}

// delete response
const sendDelete   = (res, masg = "Deleted Successfully ",)=>{
    return res.status(200).json({
        success :  true,
        masg,
        message: masg,
    })
}
// bad reaquest 
const sendBadReaquest   = (res, masg = "Bad reaquest",)=>{
    return res.status(400).json({
        success :  false,
        masg,
        message: masg,
    })
}
//  Notfound 
const sendNotFound   = (res, masg = "Not found",)=>{
    return res.status(404).json({
        success : false,
        masg,
        message: masg,
    })
}

//  conflict
const sendConflict   = (res, masg = "Data already exists",)=>{
    return res.status(409).json({
        success : false,
        masg,
        message: masg,
    })
}
//  server error
const sendServerError   = (res, masg = "Internal Server Error",)=>{
    return res.status(500).json({
        success : false,
        masg,
        message: masg,
    })
}



module.exports = {
    sendBadReaquest,
    sendConflict,
    sendCreated,
    sendDelete,
    sendNotFound,
    sendServerError,
    sendSuccess,
    sendupdate
}
