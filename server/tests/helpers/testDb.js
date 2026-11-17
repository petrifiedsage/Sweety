const { randomUUID } = require('crypto');

function createInMemoryPrisma() {
  const users = new Map();
  const readings = new Map();

  function cloneUser(u) {
    return u ? { ...u } : null;
  }

  function cloneReading(r) {
    return r ? { ...r, reading_date: new Date(r.reading_date) } : null;
  }

  function dateMillis(d) {
    return d instanceof Date ? d.getTime() : new Date(d).getTime();
  }

  function matchesReadingWhere(record, where = {}) {
    if (where.id) {
      if (typeof where.id === 'string') {
        if (record.id !== where.id) return false;
      } else if (where.id.not) {
        if (record.id === where.id.not) return false;
      }
    }

    if (where.user_id && record.user_id !== where.user_id) {
      return false;
    }

    if (where.time_slot && record.time_slot !== where.time_slot) {
      return false;
    }

    if (where.reading_date) {
      const recTime = dateMillis(record.reading_date);
      if (where.reading_date instanceof Date) {
        if (recTime !== dateMillis(where.reading_date)) return false;
      } else {
        if (where.reading_date.gte && recTime < dateMillis(where.reading_date.gte)) {
          return false;
        }
        if (where.reading_date.lte && recTime > dateMillis(where.reading_date.lte)) {
          return false;
        }
      }
    }

    return true;
  }

  return {
    $Reset() {
      users.clear();
      readings.clear();
    },
    $disconnect: async () => {},
    user: {
      async findUnique({ where }) {
        if (where.id) {
          return cloneUser(users.get(where.id) || null);
        }
        if (where.email) {
          for (const u of users.values()) {
            if (u.email === where.email) return cloneUser(u);
          }
        }
        return null;
      },
      async create({ data }) {
        for (const u of users.values()) {
          if (u.email === data.email) {
            const err = new Error('Unique constraint failed on the fields: (`email`)');
            err.code = 'P2002';
            throw err;
          }
        }
        const now = new Date();
        const record = {
          id: data.id || randomUUID(),
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
          created_at: now,
          updated_at: now,
        };
        users.set(record.id, record);
        return cloneUser(record);
      },
      async deleteMany() {
        const count = users.size;
        users.clear();
        readings.clear();
        return { count };
      },
    },
    reading: {
      async findUnique({ where }) {
        if (where.id) {
          return cloneReading(readings.get(where.id) || null);
        }
        if (where.unique_user_date_slot) {
          const { user_id, reading_date, time_slot } = where.unique_user_date_slot;
          const targetTime = dateMillis(reading_date);
          for (const r of readings.values()) {
            if (
              r.user_id === user_id &&
              dateMillis(r.reading_date) === targetTime &&
              r.time_slot === time_slot
            ) {
              return cloneReading(r);
            }
          }
        }
        return null;
      },
      async findMany({ where = {}, orderBy } = {}) {
        const results = [];
        for (const r of readings.values()) {
          if (matchesReadingWhere(r, where)) {
            results.push(cloneReading(r));
          }
        }

        if (orderBy) {
          const rules = Array.isArray(orderBy) ? orderBy : [orderBy];
          results.sort((a, b) => {
            for (const rule of rules) {
              const [field, dir] = Object.entries(rule)[0];
              const av = field === 'reading_date' || field === 'created_at' ? dateMillis(a[field]) : a[field];
              const bv = field === 'reading_date' || field === 'created_at' ? dateMillis(b[field]) : b[field];
              if (av !== bv) {
                return dir === 'desc' ? (av < bv ? 1 : -1) : av < bv ? -1 : 1;
              }
            }
            return 0;
          });
        }

        return results;
      },
      async create({ data }) {
        const targetTime = dateMillis(data.reading_date);
        for (const r of readings.values()) {
          if (
            r.user_id === data.user_id &&
            dateMillis(r.reading_date) === targetTime &&
            r.time_slot === data.time_slot
          ) {
            const err = new Error('Unique constraint failed on the fields: (`user_id`,`reading_date`,`time_slot`)');
            err.code = 'P2002';
            throw err;
          }
        }
        const now = new Date();
        const record = {
          id: data.id || randomUUID(),
          user_id: data.user_id,
          reading_date: new Date(data.reading_date),
          time_slot: data.time_slot,
          glucose_value: data.glucose_value,
          created_at: now,
          updated_at: now,
        };
        readings.set(record.id, record);
        return cloneReading(record);
      },
      async update({ where, data }) {
        const existing = readings.get(where.id);
        if (!existing) {
          throw new Error('Record to update not found.');
        }
        const updated = {
          ...existing,
          ...(data.reading_date !== undefined ? { reading_date: new Date(data.reading_date) } : {}),
          ...(data.time_slot !== undefined ? { time_slot: data.time_slot } : {}),
          ...(data.glucose_value !== undefined ? { glucose_value: data.glucose_value } : {}),
          updated_at: new Date(),
        };
        readings.set(where.id, updated);
        return cloneReading(updated);
      },
      async delete({ where }) {
        const existing = readings.get(where.id);
        if (!existing) {
          throw new Error('Record to delete not found.');
        }
        readings.delete(where.id);
        return cloneReading(existing);
      },
      async deleteMany({ where = {} } = {}) {
        let count = 0;
        for (const [id, r] of readings.entries()) {
          if (matchesReadingWhere(r, where)) {
            readings.delete(id);
            count++;
          }
        }
        return { count };
      },
    },
  };
}

module.exports = {
  createInMemoryPrisma,
};
