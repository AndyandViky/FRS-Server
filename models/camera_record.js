/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('camera_record', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        people_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        face_img: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gender: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
        },
        age: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        semblance: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: '0',
        },
        count: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '1',
        },
        type: {
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
        tableName: 'camera_record',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
