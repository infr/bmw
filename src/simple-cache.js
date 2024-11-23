//const fs = require('fs');
const fs = require('fs/promises');

class SimpleCache {
    #cacheFile = null;
    #cache = {};
    constructor(name = "simplecache") {
        this.cacheFile = `${process.env.SIMPLECACHE_DIR ?? "."}/.${name}.cache.json`;
        this.cache = {};
        try {
            const data = require('fs').readFileSync(this.cacheFile, 'utf8');
            this.cache = JSON.parse(data);
        }
        catch {
            // noop
        }
    }

    get(key) {
        const entry = this.cache[key];

        if (entry && entry.expires !== null && entry.expires < Date.now()) {
            delete this.cache[key];
            return undefined;
        }

        return entry?.value;
    }

    set(key, value, expires) {
        expires = expires ? new Date(expires).getTime() || Date.now() : null;
        this.cache[key] = {value, expires};
        setTimeout(async () => {
            try {
                await fs.writeFile(this.cacheFile, JSON.stringify(this.cache));
            }
            catch {
                // noop
            }
        },0);
    }

    has(key) {
        return this.cache[key] !== undefined;
    }

    delete(key) {
        delete this.cache[key];
        require('fs').writeFileSync(this.cacheFile, JSON.stringify(this.cache));
    }
}

module.exports = {SimpleCache};