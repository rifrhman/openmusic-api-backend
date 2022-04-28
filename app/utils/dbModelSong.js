/* eslint-disable camelcase */

const mapDBModelSong = ({
  id,
  name,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  name,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

module.exports = { mapDBModelSong };
