const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const bodyParser = require('body-parser');

app.locals.title = 'Kouleur';

app.use(express.json());
app.use(bodyParser.json());

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
    .where({ project_id: id })
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

app.get('/api/v1/palettes/search', (req, res) => {
  const query = req.query.hex;
  database('palettes')
    .where(function() {
      this.where('color_1', query)
        .orWhere('color_2', query)
        .orWhere('color_3', query)
        .orWhere('color_4', query)
        .orWhere('color_5', query);
    })
    .then(palettes => {
      palettes.length
        ? res.status(200).json(palettes)
        : res.status(404)
            .json({ error: `Those palettes do not exsist` });
    })
    .catch(error =>
      res.status(500).json({ error: 'Cannot retrieve palettes at this time' })
    );
});

app.post('/api/v1/projects', async (request, response) => {
  const newProject = request.body.project;
  try {
    if (newProject) {
      const id = await database('projects').insert(newProject, 'id');
      response.status(200).json(id[0]);
    } else {
      response.status(400).json({
        error:
          'Expected an object with a key of project in the body of the post request'
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});




module.exports = app;
