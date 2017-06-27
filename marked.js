const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const marked = require('marked');
const utils  = require('./utils/index');
let cwd = process.cwd();

let config = require('./config/configDefault');
let renderer = new marked.Renderer();
let markdownString = '';
let htmlString = '';



// 生成导航栏对象
function generateNavObj($, levelStart, levelEnd) {
    var domTree = [];
    for (var level = levelStart; level < levelEnd + 1; level++) {
        $('h' + level).each(function (i, ele) {
            pushNode(domTree, ele, levelStart);
        });
    }
    return domTree;
}

// 往domTree中添加Node
function pushNode(domTree, ele, levelStart) {
    var level = Number(ele.name.slice(1, ele.name.length));
    var node = {
        level: level,
        id: ele.attribs.id,
        parentId: findPrevEleByTagName(ele, `h${level - 1}`) ? findPrevEleByTagName(ele, `h${level - 1}`).attribs.id : ''
    };
    if (level === levelStart) {
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
            findNodePosition(arr[i].nodeList, node)
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
function setMarkedByConf() {
    renderer = Object.assign(renderer, config.marked.renderer);
    marked.setOptions(Object.assign({ renderer: renderer }, config.marked.options));
}


function generateFile(input, outHtml, outNav) {
    // 读取markdowm文件
    markdownString = fs.readFileSync(path.join(cwd, input), 'utf-8');
    // 生成html字符串
    htmlString = marked(markdownString, { renderer: renderer });
    // 写content.html文件
    fs.writeFileSync(path.join(cwd, outHtml), htmlString, 'utf-8');

    let $ = cheerio.load(htmlString);
    let domTree = generateNavObj($, config.nav.levelStart, config.nav.levelEnd);
    let $nav = cheerio.load('<ul class="m-doc-nav"></ul>')('ul.m-doc-nav');
    generateNavHtml(domTree, $nav);
    // 写nav.html文件
    fs.writeFileSync(path.join(cwd, outNav), $nav.toString(), 'utf-8');
}

function generateFiles(conf) {
    config = require('./md-to-nav-config.js');
    config = utils.functions.deepMerge(config, conf);
    setMarkedByConf(config.marked);
    let fileConfig = config.inputAndOutputInfo;
    for (var i = 0; i < fileConfig.length; i++) {
        generateFile(fileConfig[i].inputFileName, fileConfig[i].outputContentName, fileConfig[i].outputNavName);
    }
    console.log('Successed!');
}
// generateFiles();
module.exports = {
    generateFiles: generateFiles,
}