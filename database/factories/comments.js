class CommentCreator {
    constructor() {
        this._repository = null;
        this._issue = null;

        this._user = this._generateHuman();
        this._isBot = false;

        this._body = this._generateBody();

        this._commentedAt = null;
    }

    _generateHuman() {
        return `Example human ${Math.ceil(Math.random() * 10000)}`;
    }

    _generateBody() {
        const userType = this._isBot ? 'bot' : 'human';

        return `Example ${userType} comment ${Math.random().toString(36).substring(2, 7)}`;
    }

    _setBy(name, isBot, at) {
        this._user = name;
        this._isBot = isBot;
        this._commentedAt = at;
    }

    for(repository) {
        this._repository = repository;

        return this;
    }

    on(issue) {
        this._issue = issue;

        return this;
    }

    setBody(body) {
        this._body = body;

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

    commented(at) {
        this._commentedAt = at;

        return this;
    }

    toModel() {
        if (this._repository === null) {
            throw Error('A repository must be set before a comment can be created!');
        }

        if (this._issue === null) {
            throw Error('An issue must be set before a comment can be created!');
        }

        return {
            repositoryId: this._repository.id,
            issueId: this._issue.id,
            user: this._user,
            isBot: this._isBot,
            body: this._body,
            url: `https://github.com/${this._repository.owner}/${this._repository.repo}`,
            commentedAt: this._commentedAt,
        };
    }
}

export function comment() {
    return (new CommentCreator());
}
