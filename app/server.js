require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Inert = require('@hapi/inert');
const path = require('path');
const albums = require("./api/albums");
const songs = require("./api/songs");
const users = require("./api/users");
const playlists = require("./api/playlists");
const playlistsongs = require("./api/playlistsong");
const authentications = require("./api/authentications");
const collaborations = require("./api/collaborations");
const activities = require("./api/activities");
const _exports = require("./api/exports");
const uploads = require("./api/uploads");
const AlbumsService = require("./services/AlbumsService");
const AlbumsValidator = require("./validator/albums");
const SongsService = require("./services/SongsService");
const SongsValidator = require("./validator/songs");
const UsersService = require("./services/UsersService");
const UsersValidator = require("./validator/users");
const AuthenticationsService = require("./services/AuthenticationsService");
const AuthenticationsValidator = require("./validator/authentications");
const PlaylistsService = require("./services/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");
const PlaylistSongService = require("./services/PlaylistSongService");
const PlaylistSongValidator = require("./validator/playlistSong");
const CollaborationsService = require("./services/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");
const ActivitiesPlaylistSong = require("./services/ActivitiesPlaylistSong");
const ProducerService = require("./services/ProducerService");
const ExportsValidator = require("./validator/exports");
const StorageService = require("./services/StorageService");
const UploadsValidator = require("./validator/uploads");
const TokenManager = require("./tokenize/TokenManager");

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongService = new PlaylistSongService();
  const activitiesPlaylistSong = new ActivitiesPlaylistSong();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistsongs,
      options: {
        service: playlistSongService,
        songsService,
        playlistsService,
        activitiesPlaylistSong,
        validator: PlaylistSongValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: activities,
      options: {
        service: activitiesPlaylistSong,
        playlistsService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
};

init();
