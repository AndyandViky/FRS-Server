/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('adress', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        province: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        community: {
            type: DataTypes.STRING(20),
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
        tableName: 'adress',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
