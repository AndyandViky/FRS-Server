/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user_behavior', {
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
        behavior: {
            type: DataTypes.TEXT,
            allowNull: false,
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
        tableName: 'user_behavior',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
