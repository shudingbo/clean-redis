
const handler = {
  key: require('./rKey').clean,
  hash: require('./rHash').clean,
  list: require('./rList').clean,
  zset: require('./rZSet').clean,
}

/** Key Matcher Attr
 * @typedef {Object} KeyMatcherAttr
 * @property {string} matchType - int | string | datestamp | date1
 * @property {string|number} min - the min value， can js expression
 * @property {string|number} max - the max value， can js expression
 */


/** Key Matcher
 * @typedef {Object} KeyMatcher
 * @property {string} regex the matcher regExp string
 * @property {KeyMatcherAttr[]} attr zhe matcher unit attr 
 */


/** Key Match rule
 *
 * @typedef {Object} KeyMatch
 * @property {string} pattern - redis key filter, follow redis.keys syntax. (https://redis.io/commands/keys)
 * @property {KeyMatcher} matcher - Matcher config
 */



/** clean key config
 *
 * @typedef {Object} KeyCfg
 * @property {string} name - descript,name
 * @property {string} type - key | zset | list | hash
 * @property {number} expire - use set key expire
 * @property {string} style - trim | rem | rank | score
 *                - trim | rem use for list type
 *                - rank | score use for zser type
 * @property {number} min the min value， can js expression, use for zset|list
 * @property {number} max the max value， can js expression, use for zset|list
 * @property {KeyMatch} key  - key match config
 */


 /** The Match redis key
 *
 * @typedef {Object} MatchItem
 * @property {string} type the key type
 * @property {string} key the redis key
 * @property {number} exp the exp value, for key type
 * @property {string} style the clean style, for list | zset type
 * @property {string} field the hash field will be clean
 * @property {number} min the list|zset min value
 * @property {number} max the list|zset max value
 */


/**
 * @param {import('ioredis').Redis} rd ioredis 实例 
 * @param {KeyCfg[]} keys 键配置文件
 * 
 * @return {MatchItem[]} the match result 
 */
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
 * @param {import('ioredis').Redis} rd ioredis 实例 
 * @param {KeyCfg[]} keys 清理键配置文件 
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




