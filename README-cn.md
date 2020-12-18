# Redis 数据清理

- 支持 正则表达式
- 支持 Key,ZSET,LIST,Hash field 的清理

## 安装

Using npm:
```
$ npm install clean-redis
```

## API
 * [searchKey](#searchKey), 查找要清理的redis键
 * [cleanKey](#cleanKey), 直接清理redis键

 The matcher config [KeyCfg](#keyCfg). 

### searchKey
	Search will clean redis key. 
```
/**
 * @param {import('ioredis').Redis} rd ioredis 实例 
 * @param {KeyCfg[]} keys 键配置文件
 * 
 * @return {MatchItem[]} the match result 
 */
async function searchKey( rd, keys )
```
* rd, ioredis 实例
* keys, [KeyCfg](#keyCfg)

### cleanKey
	Clean redis key.
```
/**
 * 
 * @param {import('ioredis').Redis} rd ioredis 实例 
 * @param {KeyCfg[]} keys 清理键配置文件 
 * @param {function} cb 回调函数
 */
async function cleanKey( rd, keys, cb )
```
* rd, ioredis 实例
* keys, [KeyCfg](#keyCfg)
* cb, callback function `cb( key, field? )`
 	- key, the clean key name
	- field, the clean hash field

#### keyCfg
```
 {
	"keys":[
		{
			"name":"<descript info>",
      "type":"<zset|list|key|hash>",
      "style" : "<rank|score|rem|trim>",  // rank|score for ZSET;rem|trim for LIST
      "min"   : "<js expression>",  // list [ rem count ]
      "max"   : "<js expression>",  // list [ rem value ]
      "expire":36000,    // optional, for key type
      "key": {
        "pattern":"<redis keys synctax>",
        "matcher":{
          "regex":"<regex>",
          "attr":[
            {
              "matchType":"<int|string|dateStamp>",
              "min"    : "<val0 | js expression>",
              "max"    : "[val0 | js expression]"  // optional
            }
          ]
        }
      }
		}
	]
};

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
```

下面是配置的详细例子

```javascript

	"keys":[
		{
			"name":"清理zset类型",
			"type":"zset",
			"style": "score",
			"min": "'-inf'",
			"max": "parseInt((new Date()).valueOf()/1000) - 86400 * 30",
			"key": {
				"pattern":"*:Pool:his",
				"matcher":{
					"regex":"([0-9]{8}):*",
					"attr":[
						{
							"matchType":"string",
							"min"    : "50901800",
							"max"    : ""
						}
					]
				}
			}
		},
		{
			"name":"清理 List",
			"type":"list",
			"style":"trim",
			"min"  : 0,
			"max"  : 3
			"key": {
				"pattern":"ww:winls",
				"matcher":{
					"min"  : 0,
					"max"  : 3
				}
			}
		},
		{
        "name":"清理Hash field",
				"type":"hash",
				"key": {
					"pattern":"*:recy",
					"matcher":{
						"regex":"([0-9]{8})",
							"attr":[
								{
								"matchType":"dateStamp",
								"min":"0",
								"max":"(new Date()).valueOf() - 86400000 * 30"
								}
							]
						}
					}
        },
		{
			"name":"清理key",
			"type":"key",
			"key": {
				"pattern":"rcard:20??????:*:*",
				"expire":36000,
				"matcher":{
					"regex":"([0-9]{8}):([0-9]{1,}):([0-9]{1,})",
					"attr":[
						{
							"matchType":"dateStamp",
							"min"    : "0",
							"max"    : "(new Date()).valueOf() - 86400 * 30000"
						},
						{
							"matchType":"int",
							"min"    : "0",
							"max"    : "3"
						},
						{
							"matchType":"string",
							"min"    : "5",
							"max"    : ""
						}
					]
				}
			}
		}
	]
```

## Copyright and license

Copyright 2020+ shudingbo
Licensed under the **[MIT License]**.

