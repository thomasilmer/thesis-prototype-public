import crypto from 'crypto';

class CommitCreator {
    constructor() {
        this._repository = null;

        this._user = this._generateHuman();
        this._isBot = false;

        this._message = this._generateMessage();

        this._committedAt = null;
    }

    _generateHuman() {
        return `Example human ${Math.ceil(Math.random() * 10000)}`;
    }

    _generateMessage() {
        const userType = this._isBot ? 'bot' : 'human';

        return `Example ${userType} commit ${Math.random().toString(36).substring(2, 7)}`;
    }

    _setBy(name, isBot, at) {
        this._user = name;
        this._isBot = isBot;
        this._committedAt = at;
    }

    for(repository) {
        this._repository = repository;

        return this;
    }

    setMessage(message) {
        this._message = message;

        return this;
    }

    byHuman(at, name) {
        this._setBy(name ?? this._generateHuman(), false, at);

        return this;
    }

    byBot(at, name) {
        this._setBy(name, true, at);

        return this;
    }

    committed(at) {
        this._committedAt = at;

        return this;
    }

    toModel() {
        if (this._repository === null) {
            throw Error('A repository must be set before a commit can be created!');
        }

        const hash = crypto.createHash('sha1').update(this._message).digest('hex');

        return {
            repositoryId: this._repository.id,
            user: this._user,
            isBot: this._isBot,
            hash: hash.slice(0, 7),
            message: this._message,
            url: `https://github.com/${this._repository.owner}/${this._repository.repo}`,
            committedAt: this._committedAt,
        };
    }
}

export function commit() {
    return (new CommitCreator());
}
