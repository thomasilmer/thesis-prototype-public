import Sequelize from 'sequelize';
import connection from '../connection.js';
import {Repository} from './repositories.js';

export const IssueType = {
    PULL_REQUEST: 'pull_request',
    ISSUE: 'issue',
};

export const Issue = connection.define('issues', {
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
    openedBy: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    openerIsBot: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    closedBy: {
        type: Sequelize.STRING,
    },
    closerIsBot: {
        type: Sequelize.BOOLEAN,
    },
    number: {
        type: Sequelize.BIGINT,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    numberOfComments: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    openedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    mergedAt: {
        type: Sequelize.DATE,
    },
    closedAt: {
        type: Sequelize.DATE,
    },
});

Repository.hasMany(Issue);
Issue.belongsTo(Repository);
