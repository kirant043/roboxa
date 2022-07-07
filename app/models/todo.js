var mongoose = require('mongoose');

// module.exports = mongoose.model('Todo', {
//  _id : mongoose.Schema.Types.ObjectId,
//     client_name:String ,
//     is_active : Boolean
// });

module.exports = mongoose.model('Todo', {
	text : String,
	done : Boolean
});