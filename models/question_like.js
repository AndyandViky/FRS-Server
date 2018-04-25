/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('question_like', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        question_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'question',
                key: 'id',
            },
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
        is_like: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0,
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
        tableName: 'question_like',
        timestamps: false,
    })
}
