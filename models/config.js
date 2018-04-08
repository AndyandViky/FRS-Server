/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('config', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        isopen: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '1',
        },
        isUpdate: {
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
    }, {
        tableName: 'config',
    })
}
