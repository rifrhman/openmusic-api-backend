const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class ActivitiesPlaylistSong {
  constructor() {
    this._pool = new Pool();
  }

  async addNewActivities(playlistId, songId, userId, action) {
    const id = `activities-${nanoid(12)}`;
    const time = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlistsongactivities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan aktivitas playlists");
    }

    return result.rows[0].id;
  }

  async getActivitiesById(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlistsongactivities.action, playlistsongactivities.time
      FROM playlistsongactivities JOIN playlists ON playlists.id = playlistsongactivities.playlist_id 
      JOIN songs ON songs.id = playlistsongactivities.song_id 
      JOIN users ON users.id = playlistsongactivities.user_id 
      LEFT JOIN collaborations ON collaborations.playlist_id = playlistsongactivities.id
      WHERE playlists.id = $1 AND playlists.owner = $2 OR collaborations.user_id = $2
      ORDER BY playlistsongactivities.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = ActivitiesPlaylistSong;
