import {Bootstrap} from './colors.js';
import TimelineItem from '../objects/TimelineItem.js';

export function splitData(results, amountOfSlices) {
    const slices = [];

    for (let i = 0; i < amountOfSlices; i++) {
        const start = i * results.length / amountOfSlices;
        const end = start + results.length / amountOfSlices;

        slices.push(results.slice(start, end));
    }

    return slices;
}

export function randomInteger(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function randomDataset(points, minimum = 0, maximum = 20) {
    const series = [];

    for (let i = 0; i < points; i++) {
        series.push(randomInteger(minimum, maximum));
    }

    return series;
}

export function randomTimeline() {
    return [
        new TimelineItem({
            bot: {
                id: 1,
                name: 'Dependabot',
            },
            action: {
                type: 'updated',
                object: {
                    id: 1,
                    type: 'pull_request',
                    title: 'Bumps regex from 0.1.41 to 1.3.6',
                    url: '#',
                },
                time: '17.10.2022 at 09:06',
            },
        }),
        new TimelineItem({
            bot: {
                id: 2,
                name: 'stale',
            },
            action: {
                type: 'closed',
                object: {
                    id: 1,
                    type: 'issue',
                    title: 'Add mobile support for the dashboard',
                    url: '#',
                },
                time: '17.10.2022 at 09:05',
            },
        }),
        new TimelineItem({
            bot: {
                id: 2,
                name: 'stale',
            },
            action: {
                type: 'commented',
                object: {
                    id: 1,
                    type: 'issue',
                    title: 'Add mobile support for the dashboard',
                    url: '#',
                },
                time: '17.10.2022 at 09:05',
            },
        }),
        new TimelineItem({
            bot: {
                id: 2,
                name: 'stale',
            },
            action: {
                type: 'commented',
                object: {
                    id: 2,
                    type: 'pull_request',
                    title: '[Security] Bumps lodash from 4.17.11 to 4.17.14',
                    url: '#',
                },
                time: '16.10.2022 at 17:17',
            },
        }),
        new TimelineItem({
            bot: {
                id: 1,
                name: 'Dependabot',
            },
            action: {
                type: 'opened',
                object: {
                    id: 2,
                    type: 'pull_request',
                    title: '[Security] Bumps lodash from 4.17.11 to 4.17.14',
                    url: '#',
                },
                time: '10.10.2022 at 13:46',
            },
        }),
        new TimelineItem({
            bot: {
                id: 1,
                name: 'Dependabot',
            },
            action: {
                type: 'opened',
                object: {
                    id: 1,
                    type: 'pull_request',
                    title: 'Bumps regex from 0.1.41 to 1.3.6',
                    url: '#',
                },
                time: '10.10.2022 at 13:45',
            },
        }),
        new TimelineItem({
            bot: {
                id: 3,
                name: 'slackbot',
            },
            action: {
                type: 'opened',
                object: {
                    id: 1,
                    type: 'issue',
                    title: 'Add mobile support for the dashboard',
                    url: '#',
                },
                time: '10.10.2022 at 09:03',
            },
        }),
    ];
}
