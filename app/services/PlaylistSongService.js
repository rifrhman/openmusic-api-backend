const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class PlaylistSongService {
  constructor() {
    this._pool = new Pool();
  }

  async addNewSongToPlaylist({ playlistId, songId }) {
    const id = `playlistsong-${nanoid(12)}`;

    const query = {
      text: "INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan song di playlist");
    }

    return result.rows[0].id;
  }

  // async getPlaylists(owner) {
  //   const query = {
  //     text: `SELECT playlists.id, playlists.name, users.username FROM playlists
  //     LEFT JOIN users ON users.id = playlists.owner
  //     WHERE playlists.owner = $1`,
  //     values: [owner],
  //   };
  //   const result = await this._pool.query(query);
  //   return result.rows;
  // }

  async deleteSongInPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus song didalam playlist. Id tidak ditemukan");
    }
  }
}

module.exports = PlaylistSongService;
