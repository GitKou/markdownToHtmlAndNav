const fs = require('fs');
const path = require('path');
const marked = require('marked');


let renderer = new marked.Renderer();
let markdownString = '';
let htmlString = '';

renderer.heading = function (text, level, raw) {
    return '<h'
        + level
        + ' id="'
        + this.options.headerPrefix
        + raw.toLowerCase()
        + '">'
        + text
        + '</h'
        + level
        + '>\n';
};
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
});


// 读取markdowm文件
markdownString = fs.readFileSync(path.join(cwd, input), 'utf-8');
// 生成html字符串
htmlString = marked(markdownString, { renderer: renderer });
// 写content.html文件
// fs.writeFileSync(path.join(cwd, outHtml), htmlString, 'utf-8');


module.exports = {
    htmlString: htmlString,
}