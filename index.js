
module.exports = function(npm){

    var isBowerModule = function(moduleDirectory){
        "use strict";
        try {
            return require(path.join(moduleDirectory,'bower.json'));
        } catch (e) {
            if (e.code !== 'MODULE_NOT_FOUND') {
                // Re-throw not "Module not found" errors
                throw e;
            }else{
                return false;
            }
        }
    };

    var isNpmModule = function(moduleDirectory){
        "use strict";
        try {
            return require(path.join(moduleDirectory,'package.json'));
        } catch (e) {
            if (e.code !== 'MODULE_NOT_FOUND') {
                // Re-throw not "Module not found" errors
                throw e;
            }else{
                return false;
            }
        }
    };

    var walk                = require('walk');
    var path                = require('path');
    var execSync            = require('child_process').execSync;

    var LINK_MODULE_COMMAND = npm ? 'npm link' : 'bower link -f';
    var ADD_LINK_COMMAND    = npm ? 'npm link ': 'bower link ';

    var fileType            = npm ? 'package.json' : 'bower.json';
    var isModule            = npm ? isNpmModule: isBowerModule;

//var isWin = /^win/.test(process.platform);
//if (isWin){
//
//} else {
//
//}

    console.log(process.platform)


    var availableProjectsWalker  = walk.walk(process.cwd(), { followLinks: false });

    var availableProjectsForLink = [];

    console.log('Finding modules to link in directory '+__dirname);

    availableProjectsWalker.on("directories", function (root, dirStatsArray, next) {
        var linkedProjectCount = 0;
        dirStatsArray.forEach(function(stats){
            var moduleDirectory = path.join(root,stats.name);
            if(isModule(moduleDirectory)){
                linkedProjectCount++;
                availableProjectsForLink.push(stats.name);
                var output = execSync(LINK_MODULE_COMMAND,{'cwd':moduleDirectory});
                process.stdout.write(output);
            }
        });

        if(linkedProjectCount < 0){
            console.err("No modules found in the directory. Execute command in the folder containing the bower(bower-auto-link/npm-auto-link) modules");
        }else{
            console.log(linkedProjectCount +" projects available to link");
        }

        availableProjectsForLink.forEach(function(availableProject){
            "use strict";
            var currentProjectPath = path.join(root, availableProject);
            var dependents = require(path.join(currentProjectPath, fileType)).dependencies;
            Object.keys(dependents).forEach(function(dependency){
                if(availableProjectsForLink.indexOf(dependency)!=-1){
                    var output = execSync(ADD_LINK_COMMAND+dependency,{'cwd':currentProjectPath});
                    process.stdout.write(output);
                }
            });
        });
    });

}
