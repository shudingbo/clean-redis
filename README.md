# Redis Data Clean

[中文看这里]
- support regex 
- support Key,ZSET,LIST, Hash field clean

## Install

Using npm:
```
$ npm install clean-redis
```

## API
 * [searchKey](#searchKey), Find the Redis key to clean
 * [cleanKey](#cleanKey), Clear the Redis key directly

 The matcher config [KeyCfg](#keyCfg). 

### searchKey
	Search will clean redis key. 
```
/**
 * @param {import('ioredis').Redis} rd ioredis instance 
 * @param {KeyCfg[]} keys The clean Key config
 * 
 * @return {MatchItem[]} the match result 
 */
async function searchKey( rd, keys )
```
* rd, ioredis instance
* keys, [KeyCfg](#keyCfg)

### cleanKey
	Clean redis key.
```
/**
 * 
 * @param {import('ioredis').Redis} rd ioredis instance 
 * @param {KeyCfg[]} keys The clean Key config
 * @param {function} cb callback
 */
async function cleanKey( rd, keys, cb )
```
* rd, ioredis instance
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
Here is a detailed example of the configuration

```javascript

	"keys":[
		{
			"name":" clean zset",
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
			"name":"clean List",
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
        "name":"clean Hash field",
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
			"name":"clean key",
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