
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

  for(let key of keys){
    let fields = await rd.hkeys(key);
    for( let field of fields ){
      if( checkParams( field, param ) === true ){
        res.push({ type: 'hash', key, field });
      }
    }
  }

  return res;
}


module.exports = { clean }

