import Sequelize from 'sequelize';
import connection from '../connection.js';

export const BotCategory = connection.define('bot_categories', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

export const Bot = connection.define('bots', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

export const BotCategoryPivot = connection.define('bot_bot_category', {
    botId: {
        type: Sequelize.BIGINT,
        allowNull: false,
    },
    botCategoryId: {
        type: Sequelize.BIGINT,
        allowNull: false,
    },
});

Bot.belongsToMany(BotCategory, {
    through: BotCategoryPivot,
});

BotCategory.belongsToMany(Bot, {
    through: BotCategoryPivot,
});

