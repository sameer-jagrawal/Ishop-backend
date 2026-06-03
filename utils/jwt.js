var jwt = require('jsonwebtoken');
const { requireAuthSecret } = require("./secrets");

function generateToke (id){
    const token = jwt.sign( 
        {id},
        requireAuthSecret(),
        {expiresIn:"30d"}
    );
    return token;
}


module.exports = generateToke
