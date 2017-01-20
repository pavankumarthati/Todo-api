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

app.listen(PORT, function() {
	console.log('Express listening on PORT ' + PORT);
});
