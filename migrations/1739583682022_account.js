/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable(
    'account',
    {
      account_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      name: { type: 'varchar(100)', notNull: true, unique: false },
      dob: { type: 'varchar(30)', notNull: true, unique: false },
      uuid: {
        type: 'UUID',
        notNull: true,
        unique: true,
        default: pgm.func('gen_random_uuid()')
      },
      email: { type: 'varchar(320)', notNull: true, unique: true },
      password: { type: 'varchar(255)', notNull: true, unique: false }
    },
    {
      ifNotExists: true
    }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('account', { ifExists: true });
};
