var mongoose = require('mongoose');

module.exports = mongoose.model('Client', {
 _id : mongoose.Schema.Types.ObjectId,
    client_name:String ,
    is_active : Boolean
});

// module.exports = mongoose.model('Client', {
// 	text : String,
// 	done : Boolean
// });