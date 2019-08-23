const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const bodyParser = require('body-parser');
const cors = require('cors');

app.locals.title = 'Kouleur';

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

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
  if (!query) {
    return database('palettes').select()
      .then(palettes => res.status(200).json(palettes));
  }
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
        : res.status(404).json({ error: `Those palettes do not exsist` });
    })
    .catch(error =>
      res.status(500).json({ error: 'Cannot retrieve palettes at this time' })
    );
});

app.post('/api/v1/projects', async (request, response) => {
  const newProject = request.body.project;
  try {
    if (newProject.project_name) {
      const id = await database('projects').insert(newProject, 'id');
      response.status(201).json(id[0]);
    } else {
      response.status(422).json({
        error:
          'Expected an object with a key of project in the body of the post request'
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.post('/api/v1/palettes', async (request, response) => {
  const newPalette = request.body.palette;
  try {
    for (let requiredParameter of [
      'project_id',
      'palette_name',
      'color_1',
      'color_2',
      'color_3',
      'color_4',
      'color_5'
    ]) {
      if (!newPalette[requiredParameter]) {
        return response.status(422).send({
          error: `Expected format: { project_id: <Integer>, palette_name: <String>, colors: <String> }. 
          You're missing a "${requiredParameter}" property.`
        });
      }
    }
    const id = await database('palettes').insert(newPalette, 'id');
    response.status(201).json({ id: id[0] });
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.delete('/api/v1/palettes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const affectedLines = await database('palettes')
      .where('id', id)
      .del();
    if (affectedLines) {
      res.status(201).json({ id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Provide valid id' });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.delete('/api/v1/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await database('palettes')
      .where('project_id', id)
      .del();
    const affectedProjects = await database('projects')
      .where('id', id)
      .del();
    if (affectedProjects) {
      res.status(201).json({ id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Provide valid id' });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.patch('/api/v1/palettes/:id', async (req, res) => {
  const { id } = req.params;
  const palette = req.body;
  try {
    for (let requiredParameter of [
      'palette_name',
      'color_1',
      'color_2',
      'color_3',
      'color_4',
      'color_5'
    ]) {
      if (!palette[requiredParameter]) {
        return res.status(422).send({
          error: `Expected format: {palette_name: <String>, colors: <String> }. 
          You're missing a "${requiredParameter}" property.`
        });
      }
    }
    await database('palettes')
      .where('id', id)
      .update({ ...palette });
    return res.status(202).json({ id: id });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.patch('/api/v1/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { project_name } = req.body;
  try {
    if (!project_name) {
      return res
        .status(422)
        .json({ error: 'Please provide a valid key-value pair for renaming' });
    }
    await database('projects')
      .where('id', id)
      .update({ project_name });
    return res.status(202).json({ id: id });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = app;
