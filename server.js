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

//GET /todos
app.get('/todos', function (req, res) {
	var reqParams = req.query;
	var filteredTodos = todos;

	if (reqParams.hasOwnProperty('completed') && reqParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if (reqParams.hasOwnProperty('completed') && reqParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if (reqParams.hasOwnProperty('q')) {
		console.log('q = \'' + reqParams.q + '\'');
		filteredTodos = _.filter(filteredTodos, function (todo) {
			return todo.description.toLowerCase().indexOf(reqParams.q.trim().toLowerCase()) > -1;
        })
	}
	res.json(filteredTodos);
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
    var todoId =  parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'completed', 'description');
	var validAttriutes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttriutes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') &&
			_.isString(body.description) && !_.isEmpty(body.description.trim())) {
		validAttriutes.description = body.description.trim();
	} else if (body.hasOwnProperty('description')) {
		return res.status(404).send();
	}
	_.extend(matchedTodo, validAttriutes);
	res.json(matchedTodo);

});

db.sequelize.sync().then(function () {
	console.log('Database synced...');
    app.listen(PORT, function() {
        console.log('Express listening on PORT ' + PORT);
    });
});


