class Unauthorized extends Error {
    constructor(message) {
        super(message);
        this.name = 'Unauthorized';
    }
}

class BadRequest extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequest';
    }
}

class MissingCredentials extends Error {
    constructor(message) {
        super(message);
        this.name = 'MissingCredentials';
    }
}

class MissingCaptchaToken extends Error {
    constructor(message) {
        super(message);
        this.name = 'MissingCaptchaToken';
    }
}

class RateLimited extends Error {
    constructor(message) {
        super(message);
        this.name = 'RateLimited';
    }
}

module.exports = { Unauthorized, BadRequest, MissingCredentials, MissingCaptchaToken, RateLimited };
