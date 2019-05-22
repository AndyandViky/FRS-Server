/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('system_flow', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        server_count: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        data_upload_flow: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: '0',
        },
        browser_flow: {
            type: DataTypes.STRING(50),
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
        tableName: 'system_flow',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
