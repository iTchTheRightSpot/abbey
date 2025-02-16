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
  pgm.createType('relationshipstatus', ['FRIEND', 'NOT_FRIEND']);

  pgm.createTable(
    'relationship',
    {
      relation_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      status: {
        type: 'relationshipstatus',
        notNull: true,
        default: 'NOT_FRIEND'
      },
      account_id: { type: 'BIGINT', notNull: false },
      following_id: { type: 'BIGINT', notNull: false }
    },
    { ifNotExists: true }
  );

  pgm.sql(`
    ALTER TABLE relationship ADD CONSTRAINT account_id_notequal_following_id CHECK (account_id <> following_id)
  `);

  pgm.addConstraint('relationship', 'FK_account_relation_account_id', {
    foreignKeys: {
      columns: 'account_id',
      references: 'account(account_id)',
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT'
    }
  });

  pgm.addConstraint('relationship', 'FK_account_relation_following_id', {
    foreignKeys: {
      columns: 'following_id',
      references: 'account(account_id)',
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT'
    }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('relationship', 'account_id_1_notequal_account_id_2', {
    ifExists: true
  });
  pgm.dropConstraint('relationship', 'FK_account_relation_account_id_2', {
    ifExists: true
  });
  pgm.dropConstraint('relationship', 'FK_account_relation_account_id_1', {
    ifExists: true
  });
  pgm.dropTable('relationship', { ifExists: true });
  pgm.dropType('relationshipstatus', { ifExists: true });
};
