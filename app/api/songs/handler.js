const ClientError = require("../../exceptions/ClientError");

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongsPayload(request.payload);

      const { title, year, genre, performer, duration, albumId } = request.payload;

      const songId = await this._service.addNewSong({
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      });

      const response = h.response({
        status: "success",
        data: {
          songId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
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

module.exports = SongsHandler;
