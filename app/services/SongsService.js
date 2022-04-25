const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const { mapDBModelSong } = require("../utils/dbModelSong");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addNewSong({ title, year, performer, genre, duration }) {
    const id = `song-${nanoid(12)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, "albumId"],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let filterSongs = await this._pool.query(
      "SELECT id, title, performer FROM songs",
    );

    if (title !== undefined) {
      const query = {
        text: `SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1`,
        values: [`%${title}%`],
      };
      console.log(`${title}`);
      filterSongs = await this._pool.query(query);
    }

    if (performer !== undefined) {
      filterSongs = await this._pool.query(`SELECT id, title, 
      performer FROM songs WHERE LOWER(performer) LIKE '%${performer}%'`);
    }

    return filterSongs.rows.map(mapDBModelSong);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }

    return result.rows.map(mapDBModelSong)[0];
  }

  async editSongById(id, { title, year, performer, genre, duration }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, "albumId", id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = SongsService;
