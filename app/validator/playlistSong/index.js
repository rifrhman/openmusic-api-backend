const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistSongPayloadScehma } = require('./schema');

const PlaylistSongValidator = {
  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSongPayloadScehma.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistSongValidator;
