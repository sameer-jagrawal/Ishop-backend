var jwt = require('jsonwebtoken');

function generateToke (id){
    const token = jwt.sign( 
        {id},
        process.env.SECREAT_KEY,
        {expiresIn:"30d"}
    );
    return token;
}


module.exports = generateToke