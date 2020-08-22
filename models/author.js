var mongoose = require('mongoose');
var moment= require('moment');
var Schema = mongoose.Schema;
var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

AuthorSchema
.virtual('name')
.get(function () {
  var fullname = '';
  if (this.first_name && this.family_name) {
    fullname = this.first_name + ' ' + this.family_name
  }
  if (!this.first_name || !this.family_name) {
    fullname = '';
  }

  return fullname;
});

/*AuthorSchema
  .virtual('birthdateformat')
  .get(function(){
      return ;
  });
AuthorSchema
  .virtual('deathdateformat')
  .get(function(){
    return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
  });
*/
// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function () {
  var s=this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
  s+=' - ';
  s+=this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
  return s;
});
// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

//Export model
module.exports = mongoose.model('Author', AuthorSchema);