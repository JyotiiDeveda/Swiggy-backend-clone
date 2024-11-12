const fs = require('fs');
const { resolve } = require('path');
const routesFolder = resolve('./src/routes');
console.log(routesFolder);

function camelCaseToDash(myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// get all routes path
const getAllRoutesPath = function () {
  const allRoutesPath = [];

  fs.readdirSync(routesFolder).forEach(file => {
    const fullPath = `${routesFolder}/${file}`;
    if (fs.existsSync(fullPath) && fullPath.endsWith('.route.js')) {
      allRoutesPath.push({
        fullPath: fullPath.replace('.js', ''),
        fileName: file.replace('.route.js', ''),
      });
    }
  });

  return allRoutesPath;
};

// register routes
const registerRoutes = function (expressInstance) {
  const allRoutesPath = getAllRoutesPath();
  // loading routes files
  for (const routeFile of allRoutesPath) {
    const router = require(routeFile.fullPath);
    if (routeFile.fileName === 'app') {
      expressInstance.use('/api', router);
    } else {
      expressInstance.use(`/api/${camelCaseToDash(routeFile.fileName)}`, router);
    }
  }
};

module.exports = {
  registerRoutes,
};
