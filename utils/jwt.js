var jwt = require('jsonwebtoken');

function generateToke (id){
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is required");
    }

    const token = jwt.sign( 
        {id},
        process.env.JWT_SECRET,
        {expiresIn:"30d"}
    );
    return token;
}


module.exports = generateToke
