/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('peoples', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        age: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        gender: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        house_number: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        adress_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'adress',
                key: 'id',
            },
        },
        types: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '1',
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
        tableName: 'peoples',
        timestamps: true,
        paranoid: true,
        updatedAt: 'updated_at',
        createdAt: false,
    })
}
