function getParam( keyInfo ){
  const type = keyInfo.type;
  const act = keyInfo.key.matcher;


	const ret = { "regex":null,"params":[]};

	let min=0,max=999999;
	if( keyInfo.style !== undefined ){
		ret.style = keyInfo.style.toLowerCase();
  }

  min = keyInfo.min ?? min;
  max = keyInfo.max ?? max;
  
  ret.min = eval(min);
  ret.max = eval(max);

	/// 取参数
	if( act.regex !== undefined ){
		ret.regex = new RegExp( act.regex );
	}

	if( act.attr !== undefined ){
		for( let para of act.attr){
      const matchType = para.matchType.toLowerCase();
			ret.params.push( {
				matchType,
        min: (matchType !== 'string') ? eval(para.min) : para.min,
        max: (matchType !== 'string') ? eval(para.max) : ''
      });
		}
	}

	return ret;
}

function checkParams( key, param){
	if( param.regex === null ){
		return true;
	}

  const mat = param.regex.exec( key );
  if( mat === null ){
    return false;
  }
	const lenParam = param.params.length;
	let bRM = false;
	for( j=0;j<lenParam;j++ ){
    const matchVal = mat[j + 1];
    if( matchVal === null || matchVal === undefined ){
      return false;
    }
		const paraInfo = param.params[j];
		switch( paraInfo.matchType ){
			case "int":
			{
        if( matchVal.length >0 ) {
          let val = Number(matchVal);
          if( Number.isInteger(val) === true ) {
            if( val >= paraInfo.min && val <= paraInfo.max ){
              bRM = true;
            }
          }
        }
			}break;
			case "datestamp":
			{
				const val = new Date( matchVal ).valueOf();
				if( val >= paraInfo.min && val <= paraInfo.max ){
					bRM = true;
				}
			}break;
			case "string":
			{
				if( matchVal === paraInfo.min ){
					bRM = true;
				}

				//console.log( "-- string, ", matchVal, paraInfo.min,bRM  );
			}break;
		}

		if( bRM === false ){
			break;
		}
	}

	//console.log( "--- checkParams ret:", bRM );
	return bRM;
}


module.exports = { getParam,checkParams };