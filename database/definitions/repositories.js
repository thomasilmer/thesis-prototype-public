import Sequelize from 'sequelize';
import connection from '../connection.js';

export const Repository = connection.define('repositories', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    owner: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    repo: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    latestPopulationAt: {
        type: Sequelize.DATE,
        defaultValue: null,
    },
    isFake: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
});

export const RepositoryPopulationJobStatus = {
    DOWNLOADING: 'downloading',
    STALLED: 'stalled',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
};

export const RepositoryPopulationJob = connection.define('repository_population_jobs', {
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
    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    startedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    completedAt: {
        type: Sequelize.DATE,
        defaultValue: null,
    },
});
