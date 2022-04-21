const mapDBModelSong = ({
  id,
  name,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  name,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

module.exports = { mapDBModelSong };
