import {IssueType} from '../definitions/issues.js';

const issueCounters = {};

class IssueCreator {
    constructor(type) {
        this._repository = null;
        this._type = type;

        this._openedBy = this._generateHuman();
        this._openerIsBot = false;

        this._closedBy = this._generateHuman();
        this._closerIsBot = false;

        this._title = this._generateTitle();

        this._openedAt = null;
        this._isMerged = false;
        this._mergedAt = null;
        this._isClosed = false;
        this._closedAt = null;

        this._numberOfComments = 0;
    }

    _generateHuman() {
        return `Example human ${Math.ceil(Math.random() * 10000)}`;
    }

    _generateTitle() {
        const userType = this._openerIsBot ? 'bot' : 'human';

        if (this._type === IssueType.PULL_REQUEST) {
            return `Example ${userType} pull request ${Math.random().toString(36).substring(2, 7)}`;
        } else {
            return `Example ${userType} issue ${Math.random().toString(36).substring(2, 7)}`;
        }
    }

    _setOpenedBy(name, isBot, at) {
        this._openedBy = name;
        this._openerIsBot = isBot;
        this._openedAt = at;
    }

    _setMergedBy(name, isBot, at) {
        if (this._type === IssueType.ISSUE) {
            throw Error('An issue can not be merged!');
        }

        this._closedBy = name;
        this._closerIsBot = isBot;
        this._isMerged = true;
        this._mergedAt = at;
    }

    _setClosedBy(name, isBot, at) {
        this._closedBy = name;
        this._closerIsBot = isBot;
        this._isClosed = true;
        this._closedAt = at;
    }

    for(repository) {
        this._repository = repository;

        return this;
    }

    setTitle(title) {
        this._title = title;

        return this;
    }

    openedByHuman(at, name) {
        this._setOpenedBy(name ?? this._generateHuman(), false, at)

        return this;
    }

    openedByBot(at, name) {
        this._setOpenedBy(name, true, at)

        return this;
    }

    mergedByHuman(at, name) {
        this._setMergedBy(name ?? this._generateHuman(), false, at);

        return this;
    }

    mergedByBot(at, name) {
        this._setMergedBy(name, true, at);

        return this;
    }

    closedByHuman(at, name) {
        this._setClosedBy(name ?? this._generateHuman(), false, at);

        return this;
    }

    closedByBot(at, name) {
        this._setClosedBy(name, true, at);

        return this;
    }

    opened(at) {
        this._openedAt = at

        return this;
    }

    merged(at) {
        if (this._type === IssueType.ISSUE) {
            throw Error('An issue can not be merged!');
        }

        this._mergedAt = at;
        this._isMerged = true;

        return this;
    }

    closed(at) {
        this._closedAt = at;
        this._isClosed = true;

        return this;
    }

    withComments(amount) {
        this._numberOfComments = amount;

        return this;
    }

    toModel() {
        if (this._repository === null) {
            throw Error('A repository must be set before an issue can be created!');
        }

        let number;

        if (typeof issueCounters[this._repository.id] === 'undefined') {
            issueCounters[this._repository.id] = number = 1;
        } else {
            number = ++issueCounters[this._repository.id];
        }

        return {
            repositoryId: this._repository.id,
            openedBy: this._openedBy,
            openerIsBot: this._openerIsBot,
            closedBy: this._closedBy,
            closerIsBot: this._closerIsBot,
            number: number,
            title: this._title,
            url: `https://github.com/${this._repository.owner}/${this._repository.repo}/issues/${number}`,
            type: this._type,
            numberOfComments: this._numberOfComments,
            openedAt: this._openedAt,
            mergedAt: this._isMerged ? this._mergedAt : null,
            closedAt: this._isClosed ? this._closedAt : null,
        };
    }
}

export function issue() {
    return (new IssueCreator(IssueType.ISSUE));
}


export function pullRequest() {
    return (new IssueCreator(IssueType.PULL_REQUEST));
}
