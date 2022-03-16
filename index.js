import express from 'express';
import { v4 } from 'uuid';

const app = express();
const USERS = [];

app.use(express.json());

const getCpf = (req, res, next) => {
  const { cpf } = req.params;
  const user = USERS.find((u) => u.cpf === cpf);

  if (!user) {
    return res.status(404).json({ error: 'user is not registered' });
  }

  req.user = user;

  return next();
};

const validateCpf = (req, res, next) => {
  const { cpf } = req.body;
  const user = USERS.find((u) => u.cpf === cpf);

  if (user) {
    return res.status(422).json({ error: 'user already exists' });
  }

  req.user = user;

  return next();
};

const getNote = (req, res, next) => {
  const { cpf } = req.params;
  const { id } = req.params;
  const user = USERS.find((u) => u.cpf === cpf);
  const note = user.notes.find((n) => n.id === id);

  if (!note) {
    return res.status(404).json({ error: 'note is not registered' });
  }

  req.note = note;

  return next();
};

app.post('/users', validateCpf, (req, res) => {
  const { name, cpf } = req.body;

  USERS.push({ id: v4(), name, cpf, notes: [] });

  res.status(201).json(USERS);
});

app.get('/users', (_, res) => {
  res.status(200).json(USERS);
});

app.patch('/users/:cpf', getCpf, (req, res) => {
  const { name, cpf } = req.body;
  const { user } = req;

  user.name = name;
  user.cpf = cpf;

  return res.status(200).json({ message: 'User is updated', user });
});

app.delete('/users/:cpf', getCpf, (req, res) => {
  const { user } = req;

  USERS.pop(user);

  return res.status(200).json();
});

app.post('/users/:cpf/notes', getCpf, (req, res) => {
  const { title, content } = req.body;
  const { user } = req;

  user.notes.push({ id: v4(), created_at: Date(), title, content });

  res
    .status(201)
    .json({ message: `${title} was added into ${user.name}'s notes` });
});

app.get('/users/:cpf/notes', getCpf, (req, res) => {
  const { user } = req;

  res.status(200).json(user.notes);
});

app.patch('/users/:cpf/notes/:id', getCpf, getNote, (req, res) => {
  const { title, content } = req.body;
  const { note } = req;

  note.title = title;
  note.content = content;
  note.update_at = Date();

  return res.status(200).json(note);
});

app.delete('/users/:cpf/notes/:id', getCpf, getNote, (req, res) => {
  const { user } = req;
  const { note } = req;

  user.notes.pop(note);

  return res.status(200).json();
});

app.listen(5000, () => console.log('Rodando'));
