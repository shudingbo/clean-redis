'use strict';

const Redis = require("ioredis");
const { searchKey, cleanKey } = require('../lib/clean');


let conf =  {
  "redis":{ "host":"192.168.2.10","port":6379 }
};

let keysCfg = [
  {
    name: '清理Key',
    type: 'key',
    expire: 36000,
    key: {
      pattern: 'test:rt*',
      matcher: { 
        regex: 'test:rt([0-9]*)',
        attr:[{ matchType: "int", min: 0, max: 100}]
      }
    }
  },
  {
    name: '清理Key>123',
    type: 'key',
    expire: 3600,
    key:{
      pattern: 'test:rt*',
      matcher: { 
        regex: 'test:rt([0-9]*)',
        attr:[{matchType: "int", min: 100, max: 999}]
      }
    }
  },
  {
    name: '清理Key < 2020-11-01',
    type: 'key',
    expire: 3600,
    key: {
      pattern: 'test:rtdate*',
      matcher: { regex: 'test:rtdate([0-9]{4}\-[0-9]{2}\-[0-9]{2})',
        attr:[{matchType: "datestamp", min: 0, max: 'Date.now()-86400000*60'}]
      }
    }
  },
  {
    name: '清理Key test:rtnih[0-9]{1}[A-Za-z0-9_]*(ao)$',
    type: 'key',
    key: {
      pattern: 'test:rtni*',
      matcher: { regex: 'test:rtnih[0-9]{1}[A-Za-z0-9_]*(ao)$',
        attr:[{matchType: "string", min: 'ao'}]
      }
    }
  },
  {
    name: '清理Hash ',
    type: 'hash',
    key: {
      pattern: 'test:hash*',
      matcher: { 
        regex: 'field([0-9]{1})$',
        attr:[{matchType: "int", min: 1,max:2}]
      }
    }
  },
  {
    name: '清理 list trim',
    type: 'list',
    style: 'trim',
    min: 1,
    max: 2,
    key: {
      pattern: 'test:list1',
      matcher: { 
        regex: 'test:list([0-9]{1})',
        attr:[{matchType: "int", min: 1,max:2}]
      }
    }
    
  },
  {
    name: '清理 list rem',
    type: 'list',
    style: 'rem',
    min: -2,   // count
    max: 444,  // value
    key: {
      pattern: 'test:list2',
      matcher: {
        regex: 'test:list([0-9]{1})',
        attr:[{matchType: "int", min: 1,max:2}]
      }
    }
  },
  {
    name: '清理 zser rank ',
    type: 'zset',
    style: 'rank',
    min: 0,
    max: 1,
    key: {
      pattern: 'test:zset1',
      matcher: {
        regex: 'test:zset([0-9]{1})',
        attr:[{matchType: "int", min: 1,max:2}]
      }
    }
  },
  {
    name: '清理 zset score ',
    type: 'zset',
    style: 'score',
    min: 123,
    max: 124,
    key: {
      pattern: 'test:zset2',
      matcher: {
        regex: 'test:zset([0-9]{1})',
        attr:[{matchType: "int", min: 1,max:2}]
      }
    }
  }
];


const redis = new Redis( conf.redis );

const valStr = '112233';
const valHash = {
  field0: 1,
  field1: 2233,
  field2: '2222'
};

/**
 * 
 * @param {Redis} rd 
 */
async function mkTestData( rd ){

  // Test Key data
  await rd.set('test:rt', valStr);
  await rd.set('test:rt01', valStr);
  await rd.set('test:rt123', valStr);
  await rd.set('test:rt124', valStr);
  await rd.set('test:rt125', valStr);
  await rd.set('test:rtnihao', valStr);
  await rd.set('test:rtnih4ao', valStr);
  await rd.set('test:rtnih5ao', valStr);
  await rd.set('test:rtdate2020-01-01', valStr);
  await rd.set('test:rtdate2020-02-01', valStr);
  await rd.set('test:rtdate2020-12-11', valStr);
  await rd.set('test:rtdate2020-11-01', valStr);


  await rd.hset('test:hash', valHash);
  await rd.hset('test:hash2', valHash);

  await rd.lpush('test:list1', 1234,222,444,555,666);
  await rd.lpush('test:list2', 1234,222,444,444,555,666)

  await rd.zadd('test:zset1',123,'s1',124,'s2',125,'s3',126,'s4');
  await rd.zadd('test:zset2',123,'s1',124,'s2',125,'s3',126,'s4');
}



(async() => {

  await mkTestData( redis );

  let matchKeys = await searchKey( redis, keysCfg );
  console.log(matchKeys);


  // await cleanKey( redis, keysCfg, ( key, field ) =>{
  //   console.log(`clean ${key} ${field ? field : ''}`);
  // });

  redis.quit();
})();





