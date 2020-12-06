const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');


const config = {
    entry: '../src/index.js',
}

const codeMap = [];
const fileMap = [];

const readFile = (() => {
    let count = 0;

    const readFile = (fileName) => {
        let file = fileName;

        if (!fileName.match(/\.js$/)) {
            switch (count) {
                case 0:
                    file += ".js";
                    break;
                case 1:
                    file += "/index.js";
                    break;
            }
        }

        // console.log("======== file ========", file);

        try {
            const data = fs.readFileSync(file, 'utf-8',);
            count = 0;
            return [data, path.dirname(file)];
        } catch (error) {
            count++;
            return readFile(fileName);
        }
    };

    return readFile;
})();

const getFileAst = (content) => {
    const ast = parser.parse(content, {
        sourceType: 'module'
    });

    // console.log("======== ast ========",ast);

    return ast;
}

const getFileInfo = (ast, dirname) => {
    let fileInfo = {};

    // 可以用来遍历更新 @babel/parser 生成的AST
    traverse(ast, {
        ExportDefaultDeclaration: ({ node }) => {
            // 获取 export default 信息 
            if (!fileInfo.exportDefault) fileInfo.exportDefault = [];

            // console.log("======== ExportDefaultDeclaration ========", node);

            fileInfo.exportDefault.push(node.declaration.name)
        },
        ExportNamedDeclaration: ({ node }) => {
            // 获取 export 信息
            if (!fileInfo.export) fileInfo.export = [];

            // console.log("======== ExportNamedDeclaration ========", node);

            node.specifiers.forEach(item => {
                fileInfo.export.push({
                    local: item.local.name,
                    exported: item.exported.name
                });
            });
        },
        VariableDeclarator: ({ node }) => {
            // 获取变量声明信息

            // console.log("======== VariableDeclarator ========", node);
        },
        ImportDeclaration: ({ node }) => {
            // 获取 import 信息
            // const { specifiers, source, } = node;

            if (!fileInfo.import) fileInfo.import = [];

            // console.log("======== ImportDeclaration ========", node);

            fileInfo.import.push({
                source: path.resolve(dirname, node.source.value),
                names: node.specifiers.map(item => {
                    if (item.type === "ImportSpecifier") {
                        return item.imported.name;
                    } else if (item.type === "ImportDefaultSpecifier") {
                        return item.local.name;
                    }
                })
            });
        }
    });

    // console.log(JSON.stringify(fileInfo));

    return fileInfo;
}

const removeImportAnsExport = (ast) => {
    let body = [];

    ast.program.body.forEach(item => {
        if (['ImportDeclaration', 'ExportDefaultDeclaration', 'ExportNamedDeclaration'].indexOf(item.type) < 0) {
            body.push(item);
        }
    });

    ast.program.body = body;

    return ast;
}

const transformCode = (ast) => {
    const { code } = babel.transformFromAstSync(ast, null, {
        moduleIds: true,
        presets: ['@babel/preset-env']
    });

    return code;
}

const importCode = (ind, importInfo) => {
    if (!importInfo) return '';

    const code = [];
    importInfo.forEach(item => {
        const ind = fileMap.indexOf(item.source);

        item.names.forEach(name => {
            code.push(`var ${name} = __youzi_require__(${ind},'${name}');`);
        });
    });

    return code.join("\n");
}

const exportCode = (ind, exportInfo) => {
    if (!exportInfo) return '';

    const code = [];
    exportInfo.forEach(item => {
        code.push(`__youzi_exports__['${item.exported}'] = ${item.local};`);
    });

    return code.join("\n");
}

const exportDefaultCode = (ind, exportDefaultInfo) => {
    if (!exportDefaultInfo) return '';
    const code = [];
    exportDefaultInfo.forEach(item => {
        code.push(`__youzi_exports__['${item}'] = ${item};`);
    });

    return code.join("\n");
}

const moduleTemplate = (modules) => {
    let result = "";
    result += "(function (modules) {\n";
    result += "    var installedModules = {};\n";
    result += "\n";
    result += "    function require(moduleId, key) {\n";
    result += "\n";
    result += "       if (installedModules[moduleId]) {\n";
    result += "            return installedModules[moduleId].exports;\n";
    result += "        }\n";
    result += "\n";
    result += "        var module = installedModules[moduleId] = {\n";
    result += "           i: moduleId,\n";
    result += "            l: false,\n";
    result += "            exports: {}\n";
    result += "        };\n";
    result += "\n";
    result += "        modules[moduleId].call(module.exports, module, module.exports, require);\n";
    result += "\n";
    result += "        module.l = true;\n";
    result += "\n";
    result += "        return key ? module.exports[key] : module.exports;\n";
    result += "    }\n";
    result += "    require(" + (modules.length - 1) + ");\n";
    result += "})({\n";
    result += modules.join(",\n\n");
    result += "/******/ })\n";

    return result;
}

const bundle = (codeList) => {
    const modules = [];

    codeList.forEach((item, ind) => {
        var module = "";
        module += `/***/ ${ind}:\n`;
        module += "/***/ (function (module, __youzi_exports__, __youzi_require__) {\n";
        module += importCode(ind, item.fileInfo.import) + "\n";
        module += item.code + "\n";
        module += exportCode(ind, item.fileInfo.export) + "\n";
        module += exportDefaultCode(ind, item.fileInfo.exportDefault) + "\n";
        module += "/***/ })\n";
        modules.push(module);
    });

    fs.writeFileSync('../dist/bundle.js', moduleTemplate(modules));
}

// 解析文件入口
const handleFile = (pathName) => {
    if (fileMap.indexOf(pathName) >= 0) return;

    const [content, dirname] = readFile(pathName);


    // const fileContent = fs.readFileSync(dirname, 'utf-8');

    // 获取文件 AST 树
    const ast = getFileAst(content);

    // 获取文件信息
    const fileInfo = getFileInfo(ast, dirname);

    fileInfo.import && fileInfo.import.forEach(item => {
        handleFile(item.source);
    });

    const code = transformCode(removeImportAnsExport(ast));
    fileMap.push(pathName);
    codeMap.push({ code, fileInfo });
}

handleFile(path.resolve(config.entry));

bundle(codeMap);