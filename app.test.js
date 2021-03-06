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
    let response;
    beforeEach(async () => {
      response = await request(app).get('/api/v1/projects');
    });
    it('should respond with all of the projects', async () => {
      const expectedProjects = await database('projects').select();
      const projects = response.body;
      expect(projects[0].id).toEqual(expectedProjects[0].id);
      expect(projects[0].project_name).toEqual(
        expectedProjects[0].project_name
      );
    });
    it('should respond with a status of 200', async () => {
      expect(response.status).toBe(200);
    });
  });

  describe('GET /projects/:id', () => {
    let mockId;
    let response;
    beforeEach(async () => {
      mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      response = await request(app).get(`/api/v1/projects/${mockId}`);
    });
    it('should respond with the specific project', async () => {
      const expectedProject = await database('projects')
        .select()
        .where('id', mockId);
      const project = response.body;
      expect(project[0].id).toEqual(expectedProject[0].id);
      expect(project[0].project_name).toEqual(expectedProject[0].project_name);
    });
    it('should respond with a status code of 200', async () => {
      expect(response.status).toBe(200);
    });
    it('should respond with a status code of 404', async () => {
      mockId = -1;
      response = await request(app).get(`/api/v1/projects/${mockId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('GET / projects/:id/palettes', () => {
    let mockId;
    let response;
    beforeEach(async () => {
      mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      response = await request(app).get(`/api/v1/projects/${mockId}/palettes`);
    });
    it('should respond with all the palettes for the specified project', async () => {
      const expectedProject = await database('palettes')
        .select()
        .where('project_id', mockId);
      const palletes = response.body;
      expect(palletes[0].id).toEqual(expectedProject[0].id);
      expect(palletes[0].project_name).toEqual(expectedProject[0].project_name);
    });
    it('should return a status of 200 if the project is found', async () => {
      expect(response.status).toBe(200);
    });
    it('should return a status of 404 if the project is not found', async () => {
      mockId = -1;
      response = await request(app).get(`/api/v1/projects/${mockId}/palettes`);
      expect(response.status).toBe(404);
    });
  });

  describe('GET palettes/search', () => {
    let mockColor;
    let response;
    beforeEach(async () => {
      mockColor = await database('palettes')
        .first('color_1')
        .then(palette => palette.color_1);
      response = await request(app).get(
        `/api/v1/palettes/search?hex=${mockColor}`
      );
    });
    it('should return the projects whose match the query', async () => {
      const expectedPalette = await database('palettes')
        .select()
        .where(function() {
          this.where('color_1', mockColor)
            .orWhere('color_2', mockColor)
            .orWhere('color_3', mockColor)
            .orWhere('color_4', mockColor)
            .orWhere('color_5', mockColor);
        });
      const palette = response.body;
      expect(palette[0].color_1).toEqual(expectedPalette[0].color_1);
    });
    it('should return a status of 200 if palettes are found the search query', async () => {
      expect(response.status).toEqual(200);
    });
    it('should return a status of 404 if palettes are not found in the search query', async () => {
      mockColor = 'zzzzzzzzzzzzzzzzzzzzzzzzzz';
      response = await request(app).get(
        `/api/v1/palettes/search?hex=${mockColor}`
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('POST /projects', () => {
    let body;
    let response;
    beforeEach(async () => {
      body = { project: { project_name: 'name' } };
      response = await request(app)
        .post('/api/v1/projects')
        .send(body);
    });
    it('should be able to create a new project and return the id of the project', async () => {
      const newProject = await database('projects')
        .where('id', response.body)
        .select();
      expect(newProject[0].project_name).toEqual(body.project.project_name);
    });
    it('should send back a status of 200 when the project is add correctly', async () => {
      expect(response.status).toBe(201);
    });
    it('should send back a status of 422 when the project is not added correctly', async () => {
      body = { project: { prot_name: 'name' } };
      response = await request(app)
        .post('/api/v1/projects')
        .send(body);
      expect(response.status).toBe(422);
    });
  });

  describe('POST /palettes', () => {
    let mockId;
    let newPalette;
    let response;
    beforeEach(async () => {
      mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      newPalette = {
        palette: {
          project_id: mockId,
          palette_name: 'Autumn Eclipse',
          color_1: '333322',
          color_2: '777777',
          color_3: '884422',
          color_4: 'eeeeff',
          color_5: 'aa9999'
        }
      };
      response = await request(app)
        .post('/api/v1/palettes')
        .send(newPalette);
    });
    it('should be able to create a new palette and return the id of the palette', async () => {
      const expectedPalette = await database('palettes')
        .where('id', response.body.id)
        .select();
      expect(expectedPalette[0].id).toEqual(response.body.id);
      expect(expectedPalette[0].palette_name).toEqual(
        newPalette.palette.palette_name
      );
    });
    it('should resond with a status of 201 if the palette is posted correctly', async () => {
      expect(response.status).toBe(201);
    });
    it('should respond with a status of 422 if the palette did not include all needed values', async () => {
      newPalette = {
        palette: {
          project_id: mockId
        }
      };
      response = await request(app)
        .post('/api/v1/palettes')
        .send(newPalette);
      expect(response.status).toBe(422);
    });
  });

  describe('DELETE /palettes', () => {
    let mockId;
    let response;
    beforeEach(async () => {
      mockId = await database('palettes')
        .first('id')
        .then(obj => obj.id);
      response = await request(app).delete(`/api/v1/palettes/${mockId}`);
    });
    it("should delete a palette and return that palette's id", async () => {
      const deletedItem = await database('palettes')
        .where('id', mockId)
        .select();
      expect(response.body.id).toEqual(mockId);
      expect(deletedItem.length).toEqual(0);
    });

    it('should return a status of 201 if the palette was successfully deleted', async () => {
      expect(response.status).toBe(201);
    });

    it('should return a status of 404', async () => {
      mockId = -1;
      response = await request(app).delete(`/api/v1/palettes/${mockId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /projects', () => {
    let mockId;
    let response;
    beforeEach(async () => {
      mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
      response = await request(app).delete(`/api/v1/projects/${mockId}`);
    });
    it('should delete a project  and return that project id', async () => {
      const deletedPalettes = await database('palettes')
        .where('project_id', mockId)
        .select();
      const deletedProjects = await database('projects')
        .where('id', mockId)
        .select();
      expect(deletedProjects.length).toEqual(0);
      expect(deletedPalettes.length).toEqual(0);
      expect(response.body.id).toEqual(mockId);
    });
    it('should return a status of 201 if the project and its palettes was successfully deleted', async () => {
      expect(response.status).toBe(201);
    });

    it('should return a status of 404 if the delete was unsuccessful', async () => {
      mockId = -1;
      response = await request(app).delete(`/api/v1/projects/${mockId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /palettes/:id', () => {
    let mockId;
    beforeEach(async () => {
      mockId = await database('palettes')
        .first('id')
        .then(obj => obj.id);
    });
    it('should update the colors on the chosen palette', async () => {
      const palette = {
        palette_name: 'autumn foliage',
        color_1: '111111',
        color_2: '222222',
        color_3: '333333',
        color_4: '444444',
        color_5: '555555'
      };
      const response = await request(app)
        .patch(`/api/v1/palettes/${mockId}`)
        .send(palette);
      const expectedUpdate = await database('palettes').where('id', mockId);
      expect(expectedUpdate[0].color_1).toEqual('111111');
      expect(expectedUpdate[0].color_2).toEqual('222222');
      expect(parseInt(response.body.id)).toEqual(mockId);
      expect(response.status).toBe(202);
    });
    it('should respond with a status code of 422 if the required parameters are not given', async () => {
      const palette = {
        palette_name: 'autumn foliage',
        color_4: '444444',
        color_6: '555555'
      };
      const response = await request(app)
        .patch(`/api/v1/palettes/${mockId}`)
        .send(palette);
      const expectedPalette = await database('palettes').where('id', mockId);
      expect(response.status).toBe(422);
      expect(expectedPalette.color_4).not.toEqual(palette.color_4);
    });
  });

  describe('PATCH /projects', () => {
    let mockId;
    beforeEach(async () => {
      mockId = await database('projects')
        .first('id')
        .then(obj => obj.id);
    });
    it("should update a project's name and respond with the project id and status code of 202", async () => {
      const body = {
        project_name: 'Edited Project Title'
      };
      const response = await request(app)
        .patch(`/api/v1/projects/${mockId}`)
        .send(body);
      const expectedProject = await database('projects').where('id', mockId);
      expect(expectedProject[0].project_name).toEqual(body.project_name);
      expect(response.status).toBe(202);
    });
    it('should respond with a 422 if the required parameters were not met', async () => {
      const body = {
        project_name: ''
      };
      const response = await request(app)
        .patch(`/api/v1/projects/${mockId}`)
        .send(body);
      expect(response.status).toBe(422);
    });
  });
});
