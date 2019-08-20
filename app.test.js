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
    it.skip('should respond with all of the projects', async () => {
      const expectedProjects = await database('projects').select();
      const response = await request(app).get('/api/v1/projects');
      const projects = response.body;

      expect(projects).toEqual(expectedProjects);
    });
    it('should respond with a status of 200', async () => {
      const response = await request(app).get('/api/v1/projects');

      expect(response.status).toBe(200);
    });
  });
  describe('GET /projects/:id', () => {

    it.skip('should respond with the specific project', async () => {
      const mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      const expectedProject = await database('projects')
        .select()
        .where('id', mockId);
      const response = await request(app).get(`/api/v1/projects/${mockId}`);

      expect(response.body).toEqual(expectedProject);
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

    it.skip('should respond with all the palettes for the specified project', async () => {
      const mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      const expectedProject = await database('palettes')
        .select()
        .where('project_id', mockId)
      const response = await request(app).get(`/api/v1/projects/${mockId}/palettes`)
      expect(response.body).toEqual(expectedProject)
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

    it.skip('should return the projects whose match the query', async () => {
      const mockColor = await database('palettes')
        .first('color_1')
        .then(palette => palette.color_1)

      const expectedProject = await database('palettes')
        .select()
        .where(function() {
          this.where('color_1', mockColor)
          .orWhere('color_2', mockColor)
          .orWhere('color_3', mockColor)
          .orWhere('color_4', mockColor)
          .orWhere('color_5', mockColor);
    })
      const response = await request(app).get(`/api/v1/palettes/search?hex=${mockColor}`)
      expect(response.body).toEqual(expectedProject)
    })

    it('should return a status of 200 if palettes are found the search query', async () => {
      const mockColor = await database('palettes')
        .first('color_1')
        .then(palette => palette.color_1)
      const response = await request(app).get(`/api/v1/palettes/search?hex=${mockColor}`)
      console.log(response.body)
      expect(response.status).toEqual(200)
    })

    it.only('should return a status of 404 if palettes are not found in the search query', async () => {
      const mockColor = 'zzzzzzzzzzzzzzzzzzzzzzzzzz'
      const response = await request(app).get(`/api/v1/palettes/search?hex=${mockColor}`)
      expect(response.status).toEqual(404)
    })

  })


});
