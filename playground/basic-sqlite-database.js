var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + "/basic-sqlite-database.sqlite"
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate : {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

sequelize.sync({
    // force: true
}).then(function () {
    console.log('syncing is done');

    Todo.findById(3).then(function (todo) {
        if (todo) {
            console.log(todo.toJSON());
        } else {
            console.log('can\'t find todo');
        }
    })

    /*Todo.create({
        description: 'Walk the dog'
    })
        .then(function () {
        return Todo.create({
            description: 'clean the trash',
            completed: true
        });
    })
        .then(function () {
            return Todo.findAll({
                where: {
                    /!*completed: false*!/
                    description: {
                        $like: '%trash%'
                    }
                }
            })
        })
        .then(function (todos) {
            if (todos) {
                todos.forEach(function (todo) {
                    console.log(todo.toJSON());
                });
            } else {
                console.log('no todos found');
            }
        })*/
        /*
        .then(function () {
        return Todo.findById(1);
    })
        .then(function (todo) {
            if (todo) {
                console.log(todo.toJSON());
            } else {
                console.log('no todo found');
            }
    })
    */
    .catch(function (error) {
        console.log(error);
    });
});