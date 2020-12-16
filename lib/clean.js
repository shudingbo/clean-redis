
const handler = {
  key: require('./rKey').clean,
  hash: require('./rHash').clean,
  list: require('./rList').clean,
  zset: require('./rZSet').clean,
}


async function searchKey( rd, keys ) {
  let delCmd = [];
  for( let it of keys ){
    if( handler[it.type]){
      let res = await handler[it.type]( rd, it, true );
      delCmd.push( ...res );
    }
  }

  return delCmd;
}

/**
 * 
 * @param {import('ioredis').Redis} rd redis 实例 
 * @param {object} keys 清理键配置文件 
 * @param {function} cb 回调函数
 */
async function cleanKey( rd, keys, cb ) {
  let delCmd = await searchKey( rd, keys );
  for( let it of delCmd ){
    if( it.type === 'key' ) {
      await rd.expire( it.key, it.exp);
      if( cb ){
        cb( it.key );
      }
    } else if( it.type === 'hash' ){
      await rd.hdel( it.key, it.field );
      if( cb ){
        cb( it.key, it.field );
      }
    } else if( it.type === 'list' ){
      if( it.style === 'rem' ) {
        await rd.lrem( it.key, it.min, it.max );
      } else {
        await rd.ltrim( it.key, it.min, it.max );
      }
      if( cb ){
        cb( it.key, it.field );
      }
    } else if( it.type === 'zset' ){
      if( it.style === 'rank' ) {
        await rd.zremrangebyrank( it.key, it.min, it.max );
      } else {
        await rd.zremrangebyscore( it.key, it.min, it.max );
      }
      if( cb ){
        cb( it.key, it.field );
      }
    }

    
  }

  return delCmd;
}


module.exports = {
  searchKey,
  cleanKey,
}




