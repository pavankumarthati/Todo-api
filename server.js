var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if  (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'completed', 'description');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || _.isEmpty(body.description)) {
		return res.status(400).send("Bad Request");
	}

	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);

	console.log(body);
	res.send(body);
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

app.listen(PORT, function() {
	console.log('Express listening on PORT ' + PORT);
});
