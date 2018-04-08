/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('face_data', {
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
        type: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
        },
        model_data: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        data_count: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        semblance: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: '0',
        },
        pass_count: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
        },
        model_image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_active: {
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
        tableName: 'face_data',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
