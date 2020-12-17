# Redis Date Clean

[中文看这里]


- support regex 
- support ZSET,LIST clean

![Setting][idSet]


## Install

### step 1: install module
Using npm:

    $ npm install scp-cleanRedis



## Changelog


### 0.0.1
Implement it.

## Config
  Config file is json:

```javascript
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

```

### redis
Set redis Server Infomation:
- **host**, redis Server IP
- **port**, redis Server Port


### api
* searchKey(ioredisIns, keys), search key
* cleanKey(ioredisIns, keys), clean key
### keys
Array，clean redis key config。

* **name**, descript info
* **type**, clean type
	- **zset**, clear ZSET
	- **list**，clear LIST 
	- **key**，clear redis key, set expire implement remove this key
	- **hash**，clear redis hash data's field, call hdel do it
* **match**, find the matched redis key, see *redis keys* synctax
* **action**, operation
	- **style**, operation method, support ( rank|score|rem|trim )。
		- **rank**, it's valid when type is *ZSET* , call *zremrangebyrank*
		- **score**,it's valid when type is *ZSET* , call *zremrangebyscore*
		- **rem**, it's valid when type is *LIST* , call *lrem*
		- **trim**, it's valid when type is *LIST* , call *ltrim*
	- **min**,js expression, the min value, use for  ZSET and  LIST's trim
	- **max**,js expression, the max value, use for  ZSET and  LIST's trim
	- **expire**, number( second ),it's valid when type is key, set key's expire
	- **regex**, the key's regex,support sub match
    - **attr**, sub match attribute
		- **matchType**, match type, support int,string,dateStramp,date1
			- **min**, min Value
			- **max**, max value


Below is the configuration of detailed examples:

```javascript
{
	"redis":{ "host":"127.0.0.1","port":6379 },
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
				"pattern":"brnn:winls",
				"matcher":{
					"min"  : 0,
					"max"  : 3
				}
			}
		},
		{
        "name":"清理Hash",
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

};
```


## Copyright and license

Copyright 2016+ shudingbo

Licensed under the **[MIT License]**.


[node-redis]:https://github.com/NodeRedis/node_redis
[cron-parser]: https://github.com/harrisiirak/cron-parser
[sdb-schedule]: https://github.com/shudingbo/sdb-schedule
[sdb-schedule-ui]: https://github.com/shudingbo/sdb-schedule-ui
[download]: https://github.com/shudingbo/sdb-public/blob/master/sdb-schedule-ui/sdb-schedule-ui.7z
[idMain]: https://github.com/shudingbo/sdb-public/blob/master/sdb-schedule-ui/main.jpg  "Main"
[idSet]: https://github.com/shudingbo/sdb-public/blob/master/sdb-schedule-ui/setting.jpg  "Setting"
[中文看这里]:https://github.com/shudingbo/scp-cleanRedis/blob/master/README-cn.md
