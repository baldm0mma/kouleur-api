exports.seed = knex => {
  return Promise.all([
    knex('projects')
      .insert({ project_name: 'Kewl Kouleurs' }, 'id')
      .then(projectId => {
        return knex('palettes').insert([
          {
            project_id: projectId[0],
            palette_name: 'Arctic Fox',
            color_1: 'dce4f2',
            color_2: '152c40',
            color_3: '325a73',
            color_4: '6393a6',
            color_5: '698c86'
          },
          {
            project_id: projectId[0],
            palette_name: 'Ocean Frost',
            color_1: '95c3e8',
            color_2: '89b4d6',
            color_3: '769ab8',
            color_4: '3e5161',
            color_5: '242f38'
          }
        ]);
      })
  ]);
};
