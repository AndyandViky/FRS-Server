/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('visitor_record', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        visitor_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'visitor',
                key: 'id',
            },
        },
        belong: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        deadline: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        pass_time: {
            type: DataTypes.INTEGER(11),
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
        tableName: 'visitor_record',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
