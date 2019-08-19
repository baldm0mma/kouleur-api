const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.get('/api/v1/projects', (req, res) => {
  database('projects')
    .select()
    .then(projects => res.status(200).json(projects))
    .catch(error =>
      res.status(500).json({ error: 'Cannot retrieve projects at this time' })
    );
});

app.get('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  database('projects')
    .where({ id })
    .select()
    .then(project => {
      project.length
        ? res.status(200).json(project)
        : res.status(404).json({ error: `Project ${id} doesn't exsist` });
    })
    .catch(error =>
      res
        .status(500)
        .json({ error: 'Cannot retrieve that project at this time' })
    );
});

app.get('/api/v1/projects/:id/palettes', (req, res) => {
  const { id } = req.params;
  database('palettes')
    .where({ 'project_id': id })
    .select()
    .then(palettes => {
      palettes.length
        ? res.status(200).json(palettes)
        : res
            .status(404)
            .json({ error: `Palettes with project id:${id} do not exsist` });
    })
    .catch(error =>
      res.status(500).json({ error: 'Cannot retrieve palettes at this time' })
    );
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
