exports.seed = knex => {
  return knex('palettes').del()
    .then(() => knex('projects').del())
    .then(() => {
      return Promise.all([
        knex('projects')
          .insert({ project_name: 'Cool Kouleurs' }, 'id')
          .then(projectId => {
            return knex('palettes').insert([
              {
                project_id: projectId[0],
                palette_name: 'Summertime Breeze',
                color_1: '91a6ff',
                color_2: 'ff88dc',
                color_3: 'faff7f',
                color_4: 'ffffff',
                color_5: 'ff5154'
              },
              {
                project_id: projectId[0],
                palette_name: 'Autumn Cheese',
                color_1: '585123',
                color_2: 'eec170',
                color_3: 'f2a65a',
                color_4: 'f58549',
                color_5: '772f1a'
              }
            ]);
          })
      ]);
    });
};
