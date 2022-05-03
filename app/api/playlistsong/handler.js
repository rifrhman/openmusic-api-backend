const ClientError = require('../../exceptions/ClientError');

class PlaylistSongHandler {
  constructor(service, validator, songsService, playlistsService) {
    this._validator = validator;
    this._service = service;
    this._songsService = songsService;
    this._playlistsService = playlistsService;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongIdHandler = this.getPlaylistSongIdHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    try {
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      this._validator.validatePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      await this._songsService.getSongById(songId);
      const SongId = await this._service.addNewSongToPlaylist({ playlistId, songId });

      const response = h.response({
        status: 'success',
        message: 'Song di playlists berhasil ditambahkan',
        data: {
          SongId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan di server kami.",
      });
      response.code(500);
      return response;
    }
  }

  async getPlaylistSongIdHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

      const playlists = await this._playlistsService.getPlaylistsById(playlistId);
      const songs = await this.songsServices.getSongByIdPlaylist(playlistId);

      playlists.songs = songs;

      return {
        status: 'success',
        data: {
          playlists,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan di server kami.",
      });
      response.code(500);
      return response;
    }
  }

  async deletePlaylistSongHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { songId } = request.payload;

      this._validator.validatePlaylistSongPayload({ playlistId, songId });

      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongInPlaylist(playlistId, songId);

      return {
        status: 'success',
        message: 'Song di playlists berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan di server kami.",
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = PlaylistSongHandler;
