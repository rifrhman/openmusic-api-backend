const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.editAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    // POST GET LIKES FROM ALBUM SERVICE WITH CREDENTIALS

    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postLikeAlbumsHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    // GET LIKES FROM ALBUM SERVICE WITHOUT CREDENTIALS

    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getLikeAlbumsHandler,
  },
];

module.exports = routes;
