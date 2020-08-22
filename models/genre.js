var mongoose=require('mongoose');
const { model } = require('./author');
var Schema=mongoose.Schema;

var genreSchema=new Schema(
    {
        name:{type: String,required:true,minlength:3,maxlength:100}
    }
);
genreSchema.virtual('url').get(function(){ return '/catalog/genre/'+this._id;});

module.exports=mongoose.model('Genre',genreSchema);