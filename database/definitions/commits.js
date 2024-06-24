import Sequelize from 'sequelize';
import connection from '../connection.js';
import {Issue} from './issues.js';
import {Repository} from './repositories.js';

export const Commit = connection.define('commits', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    repositoryId: {
        type: Sequelize.BIGINT,
        allowNull: false,
    },
    user: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isBot: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    committedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
});


Repository.hasMany(Commit);
Commit.belongsTo(Repository);

Issue.hasMany(Commit);
Commit.belongsTo(Issue);
