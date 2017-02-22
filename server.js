var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db');

var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

var app = express();
app.use(bodyParser.json());
app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos?completed=false
app.get('/todos', function (req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && !_.isEmpty(query.q)) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function (todos) {
		if (!!todos && todos.length > 0)
			res.json(todos);
		else
			res.status(404).send();
    }, function (error) {
		res.status(500).json(error);
    });
});

// GET /todos/:id

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.findById(todoId).then(function (todo) {
        if (!!todo) { // evaluating object as true or false
    	    console.log('todo = ' + JSON.stringify(todo));
        	res.json(todo);
	    } else {
        	res.status(404).send('unable to find todo with id=' + todoId);
		}
    }, function (error) {
		console.log('oops something went wrong = ' + error);
		res.status(500).json(error);
    });
});

// POST /todos

app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'completed', 'description');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || _.isEmpty(body.description)) {
		return res.status(400).send("Bad Request");
	}

	db.todo.create(body).then(function (todo) {
		console.log('successfully inserted row = [' + todo + ']');
		res.json(todo);
    }, function (error) {
		console.log('unable to create row = [' + error + ']');
		res.status(500).json(error);
    });
});

// DELETE /todos/:id

app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.send(matchedTodo);
	} else {
		res.status(404).json({"error": "no todo item with id " + todoId});
	}
});

// PUT /todos/:id

app.put('/todos/:id', function (req, res) {
	var todoId = req.params.id;
	var body = _.pick(req.body, 'completed', 'description');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function (todo) {
		if (todo) {
			return todo.update(attributes);
		} else {
			res.status(404).send();
		}
    }, function () {
		res.status(500).send();
    }).then(function (todo) {
    	if (typeof todo !== 'undefined') // if (todo)
			res.json(todo.toJSON());
    }, function (error) {
		res.status(400).json(error);
    })

});


db.sequelize.sync().then(function () {
	console.log('Database synced...');
    app.listen(PORT, function() {
        console.log('Express listening on PORT ' + PORT);
    });
});


