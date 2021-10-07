const express       = require('express'),
      cors          = require('cors'),
      { v4:uuidv4 } = require('uuid'),
      app           = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers,
        user         = users.find(item => (item.username === username));

  if (!user) return response.status(404).send({error: 'Usuário não encontrado'});

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body,
        userAlreadyExists  = users.some(item => (item.username === username));
  
  if (userAlreadyExists) return response.status(400).send({error: 'Usuário já existe'});

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(newUser);
  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  return response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user                = request.user,
        { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  user.todos.push(newTodo);
  return response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user                = request.user,
        { title, deadline } = request.body,
        todo                = user.todos.find(item => (item.id === request.params.id));

  if (!todo) return response.status(404).send({error: 'Tarefa não encontrada'});

  todo.title    = title;
  todo.deadline = new Date(deadline);
  return response.status(200).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user,
        todo = user.todos.find(item => (item.id === request.params.id));

  if (!todo) return response.status(404).send({error: 'Tarefa não encontrada'});

  todo.done = true;
  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user,
        todo = user.todos.find(item => (item.id === request.params.id));

  if (!todo) return response.status(404).send({error: 'Tarefa não encontrada'});

  user.todos.splice(todo, 1);
  return response.sendStatus(204);
});

module.exports = app;
