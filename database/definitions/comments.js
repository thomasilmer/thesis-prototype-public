import Sequelize from 'sequelize';
import connection from '../connection.js';
import {Issue} from './issues.js';

export const Comment = connection.define('comments', {
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
    issueId: {
        type: Sequelize.BIGINT,
        defaultValue: null,
    },
    user: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isBot: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    body: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    commentedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
});

Issue.hasMany(Comment, {
    onDelete: 'cascade',
});
Comment.belongsTo(Issue, {
    onDelete: 'cascade',
});
