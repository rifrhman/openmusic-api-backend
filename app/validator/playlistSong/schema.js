const Joi = require('joi');

const PlaylistSongPayloadScehma = Joi.object({
  // playlistId: Joi.string().required(),
  songId: Joi.string().required(),
});

module.exports = { PlaylistSongPayloadScehma };
