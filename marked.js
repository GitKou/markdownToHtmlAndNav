const fs = require('fs');
const path = require('path');
const marked = require('marked');
const cheerio = require('cheerio');

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

// 生成导航栏对象
function generateNavObj($, levelStart, levelEnd) {
    var domTree = [];
    for (var level = levelStart; level < levelEnd + 1; level++) {
        $('h' + level).each(function (i, ele) {
            pushNode(domTree, ele);
        });
    }
    return domTree;
}

// 往domTree中添加Node
function pushNode(domTree, ele) {
    var level = Number(ele.name.slice(1, ele.name.length));
    var node = {
        level: level,
        id: ele.attribs.id,
        parentId: findPrevEleByTagName(ele, `h${level - 1}`).attribs.id
    };
    if (level === 2) {
        domTree.push({ level: node.level, id: node.id, nodeList: [] });
    }
    else {
        findNodePosition(domTree, node);
    }

}
// 根据id和level找到node在domTree中的位置，并插入
function findNodePosition(arr, node) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === node.parentId && node.level - arr[i].level === 1) {
            arr[i].nodeList.push({
                level: node.level,
                id: node.id,
                nodeList: []
            });
            break;
        }
        else if (arr[i].nodeList.length !== 0 && node.level - arr[i].level > 1) {
            findNodePosition(arr[i].nodeList, level, id)
        }
    }
}
// 根据tagName在ele对象中查找前一个元素
function findPrevEleByTagName(ele, tagName) {
    if (!ele.prev) {
        return null;
    }
    if (ele.prev.name === tagName) {
        return ele.prev;
    }
    else {
        return findPrevEleByTagName(ele.prev, tagName);
    }
}
// 生成导航栏
function generateNavHtml(domTree, $nav) {
    for (var i = 0; i < domTree.length; i++) {
        var $childLi = cheerio.load('<li></li>')('li');
        $nav.append($childLi);
        if (domTree[i].nodeList.length !== 0) {
            var $childA = cheerio.load(`<a href="#${domTree[i].id}">${domTree[i].id}</a>`)('a');
            $childLi.append($childA);
            var $childNav = cheerio.load('<ul></ul>')('ul');
            $childLi.append($childNav);
            generateNavHtml(domTree[i].nodeList, $childNav);
        }
        else {
            $childLi.append(`<a href="#${domTree[i].id}">${domTree[i].id}</a>`);
        }

    }
}
function generateFile(input, outHtml, outNav){
    // 读取markdowm文件
    markdownString = fs.readFileSync(path.resolve(__dirname, input), 'utf-8');
    // 生成html字符串
    htmlString = marked(markdownString, { renderer: renderer });
    // 写content.html文件
    fs.writeFileSync(path.resolve(__dirname, outHtml), htmlString, 'utf-8', (err) => {
        if (err) {
            throw err;
        }
        console.log('The file has been saved!');
    });

    let $ = cheerio.load(htmlString);
    let domTree = generateNavObj($, 2, 3);
    let $nav = cheerio.load('<ul class="m-doc-nav"></ul>')('ul.m-doc-nav');
    generateNavHtml(domTree, $nav);
    // 写nav.html文件
    fs.writeFileSync(path.resolve(__dirname, outNav), $nav.toString(), 'utf-8', (err) => {
        if (err) {
            throw err;
        }
        console.log('The file has been saved!');
    });
}
function generateFiles(config){
    config = config;    
    let fileConfig = config.inputAndOutputConf;
    for (var i = 0; i < fileConfig.length; i++){
        generateFile(fileConfig[i].inputFileName, fileConfig[i].outputContentName, fileConfig[i].outputNavName);
    }
}

module.exports = {
    generateFiles: generateFiles,
}