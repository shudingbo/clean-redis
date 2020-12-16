
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
  const style = param.style??'rank';
  let res = [];

  for(let key of keys){
    if( checkParams( key, param ) === true ){
      res.push({ type: 'zset', style, key, min: param.min, max:param.max });
    }
  }

  return res;
}


module.exports = { clean }

