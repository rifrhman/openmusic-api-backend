const routes = require('./routes');
const PlaylistSongHandler = require('./handler');

module.exports = {
  name: 'playlistsongs',
  version: '1.0.0',
  register: async (server, {
    service,
    validator,
    songsService,
    playlistsService,
    activitiesPlaylistSong }) => {
    const playlistSongsHandler = new PlaylistSongHandler(
      service,
      validator,
      songsService,
      playlistsService,
      activitiesPlaylistSong,
    );
    server.route(routes(playlistSongsHandler));
  },
};
