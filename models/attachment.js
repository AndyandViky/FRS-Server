/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('attachment', {
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
        },
        path: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        width: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        height: {
            type: DataTypes.INTEGER(11),
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
        tableName: 'attachment',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
