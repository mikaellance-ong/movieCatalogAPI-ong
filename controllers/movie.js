const Movie = require('../models/Movie');
const User = require('../models/Movie');
const bcrypt = require('bcryptjs');
const auth = require("../auth");

const { errorHandler } = auth;

module.exports.addMovie = (req, res) => {
    Movie.findOne({ title: req.body.title })
    .then(existingMovie => {
        if (existingMovie) return res.status(409).json({ message: "Movie already exists" });

        const newMovie = new Movie({
            title: req.body.title,
            director: req.body.director,
            year: req.body.year,
            description: req.body.description,
            genre: req.body.genre
        });

        return newMovie.save()
        .then(movie => res.status(201).json(movie))
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.getAllMovies = (req, res) => {

    return Movie.find()
    .then(movies => {
        if (movies.length > 0) {
            return res.status(200).json({ movies: movies });
        } else {
            return res.status(404).json({ message: "No movies found" });
        }
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.getMovieById = (req, res) => {
	return Movie.findOne(req.params.id)
	.then(movie => {
		if(movie)
		{
			return res.status(200).send(movie);
		}
		else
		{
			return res.status(404).send({message: "Movie not found"});
		}
	})
	.catch(err => errorHandler(err, req, res));
}

module.exports.updateMovie = (req, res) => {

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body cannot be empty" });
    }

    const updatedMovie = {};

    Object.keys(req.body).forEach(element => {
        updatedMovie[element] = req.body[element];
    });

    return Movie.findOneAndUpdate({ _id: req.params.movieId }, updatedMovie, { new: true })
    .then(movie => {
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        return res.status(200).json({
            message: "Movie updated successfully",
            updatedMovie: movie
        });
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.deleteMovie = (req, res) => {
    return Movie.findOneAndDelete({ _id: req.params.movieId})
    .then(deletedMovie => {
        if (!deletedMovie) {
            return res.status(404).json({ error: "Movie not found" });
        }
        return res.status(200).json({ message: "Movie deleted successfully" });
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.addMovieComment = (req, res) => {
	const { comment } = req.body;
	const userId = req.user.id;

	// if(req.user.isAdmin) return res.status(403).json({message: 'Admin is forbidden'});

	return Movie.findById(req.params.movieId)
	.then(movie => {
		if(!movie) return res.status(404).json({ error: "Movie not found" });

		//if(!comment || comment.trim() === '') return res.status(400).json({ message: 'Comment cannot be empty' });

		movie.comments.push({
			userId,
			comment
		});

		return movie.save();
	})
	.then(updatedMovie => {
		res.status(200).json({
			message: 'comment added successfully',
			updatedMovie: updatedMovie
		});
	})
	.catch(error => errorHandler(error, req, res));
}

module.exports.getMovieComments = (req, res) => {
	Movie.findById(req.params.movieId)
	.select('comments')
	.then(movie => {
		if (!movie) {
			return res.status(404).json({ error: "Movie not found" });
		}

		res.status(200).json({
			comments: movie.comments
		});
	})
	.catch(error => errorHandler(error, req, res));
};