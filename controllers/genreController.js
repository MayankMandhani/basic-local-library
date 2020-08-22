var Genre = require('../models/genre');
var Book = require('../models/book');
const validator = require('express-validator');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
// Display list of all Genre.
exports.genre_list = function(req, res,next) {
    Genre.find()
        .populate('genre')
        .sort([['name'],['ascending']])
        .exec(function(err,genlist)
        {
            if(err) return next(err);
            res.render('genre_list',{title:'Genre List',genre_list: genlist});
        });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
              .exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre-detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });

};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {     
    res.render('genre_form', { title: 'Create Genre' });
  };

// Handle Genre create on POST.
exports.genre_create_post =  [
   
    // Validate that the name field is not empty.
    validator.body('name', 'Genre name required').trim().isLength({ min: 1 }),
    
    // Sanitize (escape) the name field.
    validator.sanitizeBody('name').escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validator.validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        { name: req.body.name }
      );
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ 'name': req.body.name })
          .exec( function(err, found_genre) {
             if (err) { return next(err); }
  
             if (found_genre) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_genre.url);
             }
             else {
  
               genre.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(genre.url);
               });
  
             }
  
           });
      }
    }
  ];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {

  async.parallel({
      genre: function(callback) {
          Genre.findById(req.params.id).exec(callback)
      },
      books: function(callback) {
        Book.find({ 'genre': req.params.id }).exec(callback)
      },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.genre==null) { // No results.
          res.redirect('/catalog/genres');
      }
      // Successful, so render.
      res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, books:results.books} );
  });

};

// Handle book delete on POST.
exports.genre_delete_post = function(req, res, next) {

  async.parallel({
      genre: function(callback) {
        Genre.findById(req.body.genreid).exec(callback)
      },
      books: function(callback) {
        Book.find({ 'genre': req.body.genreid }).exec(callback)
      }
  }, function(err, results) {
      if (err) { return next(err); }
      // Success
      if (results.genre == null) res.redirect('/catalog/books');
      if (results.books.length > 0) {
          // Book has instances. Render in same way as for GET route.
          res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, books: results.books } );
          return;
      }
      else {
          // Book has no instances. Delete object and redirect to the list of books.
          Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
              if (err) { return next(err); }
              // Success - go to genre list
              res.redirect('/catalog/genres')
          })
      }
  });
};


// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {

  // Get genre for form.
  async.parallel({
      genre: function(callback) {
          Genre.find(callback);
      }
      }, function(err, results) {
          if (err) { return next(err); }
          if (results.genre==null) { // No results.
              res.redirect('/catalog/genres');
          }
          // Success.
          res.render('genre_form', { title: 'Update Genre', genre: results.genre});
      });

};

// Handle genre update on POST.
exports.genre_update_post = [  
  // Validate fields.
  body('name','Name must not be empty and length should be between 3 and 100 characters.').trim().isLength({ min: 3, max: 100 }),
  // Sanitize fields.
  sanitizeBody('name').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create an author object with escaped/trimmed data and old id.
      var genre = new Genre(
        { name: req.body.name,
          _id:req.params.id
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          async.parallel({
              genre: function(callback) {
                  Genre.find(callback);
              }
          }, function(err, results) {
              if (err) { return next(err); }
              res.render('genre_form', { title: 'Update Genre',genre: results.genre});
          });
          return;
      }
      else {
          // Data from form is valid. Update the record.
          Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err,thegenre) {
              if (err) { return next(err); }
                 // Successful - redirect to genre detail page.
                 res.redirect(thegenre.url);
              });
      }
  }
];