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

      expect(projects).toEqual(expectedProjects);
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

      expect(response.body).toEqual(expectedProject);
    });
  });
});
