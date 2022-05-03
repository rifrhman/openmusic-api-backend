const ClientError = require('../../exceptions/ClientError');

class ActivitiesHandler {
  constructor(playlistsService, activitiesPlaylistSong) {
    this._playlistsService = playlistsService;
    this._activitiesPlaylistSong = activitiesPlaylistSong;
  }

  async getActivitiesByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(id, credentialId);

      const activities = await this._activitiesPlaylistSong.getActivitiesById(id);

      return {
        status: 'success',
        data: {
          playlistId: activities,
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
}

module.exports = ActivitiesHandler;
