module.exports = {
    nav: {
        levelStart: 2,
        levelEnd: 3
    },
    marked: {
        options: {
            gfm: true,
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        },
        renderer: {
            heading: function (text, level, raw) {
                let id = this.options.headerPrefix + raw.toLowerCase();
                // 针对情况 #### <a name="msg"></a>msg
                if (id.indexOf('</a>') != -1) {
                    id = id.replace(id.slice(id.indexOf('<a'), id.indexOf('a>') + 2), '');
                }
                return '<h'
                    + level
                    + ' id="'
                    + id
                    + '">'
                    + text
                    + '</h'
                    + level
                    + '>\n';
            }
        }
    }
}