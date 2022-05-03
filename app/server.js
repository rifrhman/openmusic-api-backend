require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const albums = require("./api/albums");
const songs = require("./api/songs");
const users = require("./api/users");
const playlists = require("./api/playlists");
const playlistsongs = require("./api/playlistsong");
const authentications = require("./api/authentications");
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
const TokenManager = require("./tokenize/TokenManager");

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService();
  const playlistSongService = new PlaylistSongService();

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
        validator: PlaylistSongValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
};

init();
