const ClientError = require('../../exceptions/ClientError');

class ActivitiesHandler {
  constructor(playlistsService, activitiesPlaylistSong) {
    this._playlistsService = playlistsService;
    this._activitiesPlaylistSong = activitiesPlaylistSong;

    this.getActivitiesByIdHandler = this.getActivitiesByIdHandler.bind(this);
  }

  async getActivitiesByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, credentialId);
      let activities = null;
      activities = await this._activitiesPlaylistSong.getActivitiesById(id, credentialId);

      return {
        status: 'success',
        data: {
          playlistId: id,
          activities,
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
