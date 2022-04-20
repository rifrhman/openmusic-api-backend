/* eslint-disable camelcase */

const mapDBModelAlbum = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapDBModelSong = ({
  id, title, year, performer, genre, duration, album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

module.exports = { mapDBModelAlbum, mapDBModelSong };
