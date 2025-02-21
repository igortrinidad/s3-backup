const getMySQLData = require('./getMysqlData');
const getPostgreSQLData = require('./getPgData');
const getMongoData = require('./getMongoData');


module.exports = (dbInstance) => {
  if(dbInstance.engine == 'mysql') return { getData: getMySQLData }
  if(dbInstance.engine == 'mongo') return { getData: getMongoData }
  return { getData: getPostgreSQLData }
}