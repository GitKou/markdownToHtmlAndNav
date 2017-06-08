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

module.exports  = {
    getNavArr: getNavArr
}