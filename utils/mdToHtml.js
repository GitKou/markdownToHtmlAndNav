const fs = require('fs');
const path = require('path');
const marked = require('marked');
const cheerio = require('cheerio');
let cwd = process.cwd();

let config = {};

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


function generateFile(input, outHtml, outNav) {
    // 读取markdowm文件
    markdownString = fs.readFileSync(path.join(cwd, input), 'utf-8');
    // 生成html字符串
    htmlString = marked(markdownString, { renderer: renderer });
    // 写content.html文件
    fs.writeFileSync(path.join(cwd, outHtml), htmlString, 'utf-8');

    let $ = cheerio.load(htmlString);
    let domTree = generateNavObj($, 2, 3);
    let $nav = cheerio.load('<ul class="m-doc-nav"></ul>')('ul.m-doc-nav');
    generateNavHtml(domTree, $nav);
    // 写nav.html文件
    fs.writeFileSync(path.join(cwd, outNav), $nav.toString(), 'utf-8');
}

function generateFiles(config) {
    config = config;
    let fileConfig = config.inputAndOutputInfo;
    for (var i = 0; i < fileConfig.length; i++) {
        generateFile(fileConfig[i].inputFileName, fileConfig[i].outputContentName, fileConfig[i].outputNavName);
    }
}

module.exports = {
    htmlString: htmlString,
}