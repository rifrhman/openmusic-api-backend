const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const { mapDBModelAlbum } = require("../utils/dbModelAlbum");
const { mapDBModelSong } = require("../utils/dbModelSong");

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addNewAlbum({ name, year }) {
    const id = `album-${nanoid(12)}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    await this._cacheService.delete('albums');
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    await this._cacheService.set(`albums:${id}`, JSON.stringify(result.rows[0]));
    return result.rows.map(mapDBModelAlbum)[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }

    await this._cacheService.delete(`album:${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async getSongsByAlbumId(id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBModelSong);
  }

  async addNewCoverAlbumById(id, cover) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [cover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Cover Album gagal ditambah. id tidak ditemukan");
    }
  }

  async addNewAlbumLikes(albumId, userId) {
    const addingLikesQueries = {
      text: 'SELECT * FROM albumlikes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const resultAddingLikes = await this._pool.query(addingLikesQueries);

    if (!resultAddingLikes.rowCount) {
      const id = `likes-${nanoid(12)}`;
      const insertLikesQueries = {
        text: 'INSERT INTO albumlikes (id, album_id, user_id) VALUES($1, $2, $3)',
        values: [id, albumId, userId],
      };

      const resultAddingLikeToAlbum = await this._pool.query(insertLikesQueries);

      if (!resultAddingLikeToAlbum.rowCount) {
        throw new InvariantError("Gagal menambahkan likes");
      }
    } else {
      const deleteLikesQueries = {
        text: 'DELETE FROM albumlikes WHERE album_id = $1 AND user_id = $2',
        values: [albumId, userId],
      };

      const resultDeleteLikes = await this._pool.query(deleteLikesQueries);

      if (!resultDeleteLikes.rowCount) {
        throw new InvariantError("Gagal menghapus likes");
      }
    }
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      return { likes: JSON.parse(result), cache: 1 };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM albumlikes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result.rowCount));
      return { likes: result.rowCount };
    }
  }
}

module.exports = AlbumsService;
