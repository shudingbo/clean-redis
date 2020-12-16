
const {getParam, checkParams} = require('./common');


/**
 * 
 * @param {import('ioredis').Redis} rd  redis连接实例
 * @param {object} keyInfo 删除配置信息
 */
async function clean(rd, keyInfo) {
  const matchInfo = keyInfo.key;
  const param = getParam( keyInfo );

  let keys = await rd.keys( matchInfo.pattern );
  let res = [];

  const exp = ( keyInfo.expire !== undefined )?keyInfo.expire:900;
  for(let it of keys){
    if( checkParams( it, param ) === true ){
      res.push({ type: 'key', key: it, exp });
    }
  }

  return res;
}


module.exports = { clean }

