/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('recommond', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        people_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'peoples',
                key: 'id',
            },
            unique: true,
        },
        recommonds: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'recommond',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
