const Command = require('../handlers/commandHandler');

class CreditsCommand extends Command {
    constructor(client) {
        super(client, {
            'shortDescription': 'Get the cast and crew for a movie.',
            'longDescription': 'Get a list of the cast and crew in a movie. ' +
                'Use the `--page` flag to get more results.',
            'usage': '<Movie Name or ID>',
            'weight': 34,
            'visible': true,
            'restricted': false
        });
    }

    async process(message) {
        // Check for query
        if (!message.arguments[0]) return this.usageMessage(message);
        let query = message.arguments.join(' ');

        // Status of command response
        const status = await this.searchingMessage(message);

        // Advanced search
        const flags = this.util.flags(query);
        query = flags.query;

        const page = (flags.page - 1) || 0;

        // Get credits from API
        const credits = await this.api.dmdb.getMovieCredits(query);
        if (credits.error) return this.embed.error(status, credits.error); // Error

        // Put credits into pages
        const pages = this.util.chunkArray(credits.cast, 7);
        if (page > pages.length) return this.embed.error(status, 'No Results Found.');

        // Credits at page
        const cast = pages[page];

        // Response
        this.embed.edit(status, {
            'title': credits.title,
            'description': `Current Page: **${(page + 1)}** **|** ` +
                `Total Pages: ${pages.length} **|** ` +
                `Total Results: ${credits.cast.length}`,
            'thumbnail': this.thumbnail(cast[0].profile_path ||
                credits.cast[0].profile_path),
            
            'fields': cast.map(credit => ({
                'name': credit.character,
                'value': `${credit.name} **|** ` +
                    `${this.gender(credit.gender)} **|** ` +
                    `${this.TMDbID(credit.id)}`
            })),
            
            'footer': message.db.guild.tips ?
                'TIP: Use the flags (--page) to get more results.' : ''
        });
    }
}

module.exports = CreditsCommand;