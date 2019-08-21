const request = require('supertest');
const app = require('./app');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

describe('API', () => {
  beforeEach(async () => {
    await database.seed.run();
  });
  describe('GET /projects', () => {
    it('should respond with all of the projects', async () => {
      const expectedProjects = await database('projects').select();
      const response = await request(app).get('/api/v1/projects');
      const projects = response.body;

      expect(projects[0].id).toEqual(expectedProjects[0].id);
      expect(projects[0].project_name).toEqual(expectedProjects[0].project_name);
    });
    it('should respond with a status of 200', async () => {
      const response = await request(app).get('/api/v1/projects');

      expect(response.status).toBe(200);
    });
  });
  describe('GET /projects/:id', () => {

    it('should respond with the specific project', async () => {
      const mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      const expectedProject = await database('projects')
        .select()
        .where('id', mockId);
      const response = await request(app).get(`/api/v1/projects/${mockId}`);
      const project = response.body;


      expect(project[0].id).toEqual(expectedProject[0].id);
      expect(project[0].project_name).toEqual(expectedProject[0].project_name);
    });

    it('should respond with a status code of 200', async () => {
      const mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      const response = await request(app).get(`/api/v1/projects/${mockId}`);
      expect(response.status).toBe(200)
    })

    it('should respond with a status code of 404', async () => {
      const mockId = -1
      const response = await request(app).get(`/api/v1/projects/${mockId}`);
      expect(response.status).toBe(404)
    })
  });
  describe('GET / projects/:id/palettes', () => {

    it('should respond with all the palettes for the specified project', async () => {
      const mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      const expectedProject = await database('palettes')
        .select()
        .where('project_id', mockId)
      const response = await request(app).get(`/api/v1/projects/${mockId}/palettes`)
      const palletes = response.body;

      expect(palletes[0].id).toEqual(expectedProject[0].id)
      expect(palletes[0].project_name).toEqual(expectedProject[0].project_name)

    })

    it('should return a status of 200 if the project is found', async () => {
      const mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      const response = await request(app).get(`/api/v1/projects/${mockId}/palettes`)
      expect(response.status).toBe(200)
    })

    it('should return a status of 404 if the project is not found', async () => {
      const mockId = -1 
      const response = await request(app).get(`/api/v1/projects/${mockId}/palettes`)
      expect(response.status).toBe(404)
    })

  })

  describe('GET palettes/search', () => {

    it('should return the projects whose match the query', async () => {
      const mockColor = await database('palettes')
        .first('color_1')
        .then(palette => palette.color_1)

      const expectedPalette = await database('palettes')
        .select()
        .where(function() {
          this.where('color_1', mockColor)
          .orWhere('color_2', mockColor)
          .orWhere('color_3', mockColor)
          .orWhere('color_4', mockColor)
          .orWhere('color_5', mockColor);
    })
      const response = await request(app).get(`/api/v1/palettes/search?hex=${mockColor}`)
      const palette = response.body

      expect(palette[0].color_1).toEqual(expectedPalette[0].color_1)
    })

    it('should return a status of 200 if palettes are found the search query', async () => {
      const mockColor = await database('palettes')
        .first('color_1')
        .then(palette => palette.color_1)
      const response = await request(app).get(`/api/v1/palettes/search?hex=${mockColor}`)
      expect(response.status).toEqual(200)
    })

    it('should return a status of 404 if palettes are not found in the search query', async () => {
      const mockColor = 'zzzzzzzzzzzzzzzzzzzzzzzzzz'
      const response = await request(app).get(`/api/v1/palettes/search?hex=${mockColor}`)
      expect(response.status).toEqual(404)
    })

  })

  describe('POST /projects', () => {

    it('should be able to create a new project and return the id of the project', async ()=> {
      const body = {project: {project_name: 'name'}}
      const response = await request(app).post('/api/v1/projects').send(body)
      const newProject = await database('projects').where('id', response.body).select()
      expect(newProject[0].project_name).toEqual(body.project.project_name)
    })

    it('should send back a status of 200 when the project is add correctly', async () => {
      const body = {project: {project_name: 'name'}}
      const response = await request(app).post('/api/v1/projects').send(body)
      expect(response.status).toBe(201)
    })

    it('should send back a status of 422 when the project is not added correctly', async () => {
      const body = {project: {prot_name: 'name'}}
      const response = await request(app).post('/api/v1/projects').send(body)
      expect(response.status).toBe(422)
    })

  })

  describe('POST /palettes', () => {

    it('should be able to create a new palette and return the id of the palette', async () => {
      const mockId = await database('projects')
      .first('id')
      .then(obj => obj.id);
      const newPalette = {palette: {
        project_id: mockId,
        palette_name: 'Autumn Eclipse',
        color_1: '333322',
        color_2: '777777',
        color_3: '884422',
        color_4: 'eeeeff',
        color_5: 'aa9999'
      }}
      const response = await request(app).post('/api/v1/palettes').send(newPalette)
      const expectedPalette = await database('palettes').where('id', response.body.id).select()
      expect(expectedPalette[0].id).toEqual(response.body.id)
      expect(expectedPalette[0].palette_name).toEqual(newPalette.palette.palette_name)
    })

    it('should resond with a status of 201 if the palette is posted correctly', async () => {
      const mockId = await database('projects')
      .first('id')
      .then(obj => obj.id);
      const newPalette = {palette: {
        project_id: mockId,
        palette_name: 'Autumn Eclipse',
        color_1: '333322',
        color_2: '777777',
        color_3: '884422',
        color_4: 'eeeeff',
        color_5: 'aa9999'
      }}
      const response = await request(app).post('/api/v1/palettes').send(newPalette)
      expect(response.status).toBe(201)
    })
    it('should respond with a status of 422 if the palette did not include all needed values', async () => {
      const mockId = await database('projects')
      .first('id')
      .then(obj => obj.id);
      const newPalette = {palette: {
        project_id: mockId,
      }}
      const response = await request(app).post('/api/v1/palettes').send(newPalette)
      expect(response.status).toBe(422)
    })

  })

  


});
