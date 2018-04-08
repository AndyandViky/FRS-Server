/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('users', {
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
        card_id: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        identity_pic: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        card_front: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        card_opposite: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_verify: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
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
        tableName: 'users',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
