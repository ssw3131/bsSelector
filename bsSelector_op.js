/* bsSelector v0.1
 * Copyright (c) 2013 by ProjectBS Committe and contributors. 
 * http://www.bsplugin.com All rights reserved.
 * Licensed under the BSD license. See http://opensource.org/licenses/BSD-3-Clause
 * CSS3 & 4 참고자료
 * http://css4-selectors.com/browser-selector-test/
 * http://kimblim.dk/css-tests/selectors/
*/
var bsSelector = function( doc, trim, detect, domData ){
	'use strict';
	var isQSA = doc['querySelectorAll'] ? 1 : 0, isClsName = doc['getElementsByClassName'] ? 1 : 0,
		isIE = detect.browser == 'ie' ? 1 : 0, ieVer = detect.browserVer,
		rTag = /^[a-z]+[0-9]*$/i, rAlpha = /[a-z]/i, rClsTagId = /^[.#]?[a-z0-9]+$/i,
		tokenize, compare, query, hasParent, hasQSAErr, oSel;
		
	oSel = [],
	tokenize = (function(trim){
		var mParent = {' ':1, '>':1}, mQSAErr = '!', mBracket = {'[':0, '(':0, ']':1, ')':1},
			mEx = {'*':1, ' ':1, ']':1, '>':1, '+':1, '~':1, '^':1, '$':1},
			mT0 = {' ':1, '*':2, '>':2, '+':2, '~':2, '#':3, '.':3, ':':3, '[':3}, mT1 = {'>':1, '+':1, '~':1};
		return function( s, tks ){
			var tk, b, t0, t1, i, k;
			tks.length = 0, tk = '', s = s.replace( trim, '' ), i = s.length;
			while( i-- ){
				k = s.charAt(i);
				if( hasParent || mParent[k] ) hasParent = 1;
				if( hasQSAErr || b && k == mQSAErr ) hasQSAErr = 1;
				if( ( t0 = mBracket[k] ) !== undefined && ( b = t0 ) ) continue;
				if( !( t0 = mEx[k] ) ) tk = k + tk;
				if( t0 && b ) tk = k + tk;
				else if( ( t0 = mT0[k] ) == 1 ){
					if( ( t1 = tks[tks.length - 1] ) == ' ' ) continue;
					if( tk ) tks[tks.length] = t1 = tk, tk = '';
					if( !mT1[t1] ) tks[tks.length] = k;
				}else if( t0 == 2 ){
					if( tk.replace( trim, '' ) ) tks[tks.length] = tk, tk = '';
					if( tks[tks.length - 1] == ' ' ) tks.pop();
					tks[tks.length] = k;
				}else if( t0 == 3 || !i ){
					if( tk && !b ) tks[tks.length] = tk, tk = '';
				}else if( s.charAt( i - 1 ) == ' ' ) tks[tks.length] = tk, tk = '';
			}
			return tks;
		};
	})(trim),
	compare = (function(){
		var r0 = /"|'/g, i, j, setIdx = function( pEl, dir, tagName ){
			var els, el, tname, iname, t0, i, j = 1;
			if( !pEl || pEl.tagName == 'HTML' ) return 0;
			tname = 'DQtime' + ( tagName ? 'T' : '' ) + ( dir ? 'L' : '' ), iname = 'DQindex' + ( tagName ? 'T' : '' ) + ( dir ? 'L' : '' ),
			els = pEl.childNodes, i = els.length;
			while( i-- ){
				el = els[i];
				if( el.nodeType == 1 && ( !tagName || el.tagName == tagName ) ) ( t0 = domData(el) )[tname] = ( tagName || '' ) + finder.bsRtime, t0[iname] = dir ? i + 1 : j++;
			}
			return 1;
		}, mT0 = {'~':1, '|':1, '!':1, '^':1, '$':1, '*':1};
		return function( el, token ){
			var k, v, t0, t1, i, j, elTagName, elIdx, pEl, tname, ename;

			switch( token.charAt(0) ){
			case'#':return token.substr(1) == el.id;
			case'.':return !( t0 = el.className ) ? 0 : ( k = token.substr(1), t0.indexOf(' ') > -1 ? k == t0 : t0.split(' ').indexOf(k) > -1 );
			case'[':
				t0 = el.getAttribute( k = token.substr(1) ), i = k.indexOf('=');
				if( i == -1 ) return t0 === null ? 0 : 1;
				if( t0 === null ) return 0;
				t1 = k.charAt( i - 1 ), v = k.substr( i + 1 ), k = k.substring( 0, i - 1 );
				switch( t1 ){
				case'~':return t0.split(' ').indexOf(v) > -1;
				case'|':return t0.split('-').indexOf(v) > -1;
				case'^':return t0.indexOf(v) == 0;
				case'$':return t0.lastIndexOf(v) == ( t0.length - v.length );
				case'*':return t0.indexOf(v) > -1;
				case'!':return t0 !== val;
				default:return t0 === val;
				}
			case':':
				k = token.substr(1), i = k.indexOf('('), v = i > -1 ? isNaN( t0 = k.substr( i + 1 ) ) ? t0.replace( trim, '' ) : parseFloat(t0) : null;
				if( v ) k = k.substring( 0, i );
				switch( k ){
				case'active':case'visited':case'first-line':case'first-letter':case'hover':case'focus':return;
				case'link':return el.tagName.toUpperCase() == 'A' && el.getAttribute('href') !== null;
				case'root':return el.tagName.toUpperCase() == 'HTML';
				case'empty':return el.nodeType == 1 && !el.nodeValue && !el.childNodes.length;
				case'checked':
					return elTagName = el.tagName, ( elTagName == 'INPUT' && (el.getAttribute('type') == 'radio' || el.getAttribute('type') == 'checkbox' ) && el.checked == true ) ||
						( elTagName == 'OPTION' && el.selected == true );
				case'enabled':
					return elTagName = el.tagName, (elTagName == 'INPUT' || elTagName == 'BUTTON' || elTagName == 'SELECT' || elTagName == 'OPTION' || elTagName == 'TEXTAREA') &&
						el.getAttribute('disabled') == null;
				case'disabled':
					return elTagName = el.tagName, (elTagName == 'INPUT' || elTagName == 'BUTTON' || elTagName == 'SELECT' || elTagName == 'OPTION' || elTagName == 'TEXTAREA') &&
						el.getAttribute('disabled') != null
						
				case'first-of-type':case'last-of-type':
					elTagName = el.tagName, pEl = el.parentNode, t0 = domData(el), 
					key.charAt(0) == 'f' ? ( tname = 'DQtimeFCT', ename = 'DQFCTEl' ) : ( tname = 'DQtimeLCT', ename = 'DQLCTEl' );
					if( !t0[tname] || t0[tname] != elTagName + finder.bsRtime ){
						t0[tname] = elTagName + finder.bsRtime;
						if( ( op = pEl && pEl.childNodes ) && ( i = op.length ) ){
							t0[ename] = null;
							if( key.charAt(0) == 'f' ){
								for( j = i, i = 0 ; i < j ; i++ ){
									if( op[i].nodeType == 1 && op[i].tagName == elTagName ){
										t0[ename] = op[i];
										break;
									}
								}
							}else{
								while( i-- ){
									if( op[i].nodeType == 1 && op[i].tagName == elTagName ){
										t0[ename] = op[i];
										break;
									}
								}
							}
						}
					}
					return t0[ename] == el;
				case'nth-of-type':case'nth-last-of-type':
					if( val == 'n' ) return 1;
					elTagName = el.tagName, t0 = domData(el),
					key == 'nth-of-type' ? ( tname = 'DQtimeT', ename = 'DQindexT' ) : ( tname = 'DQtimeTL', ename = 'DQindexTL' );
					if( !t0[tname] || t0[tname] != elTagName + finder.bsRtime ) setIdx( el.parentNode, key == 'nth-of-type' ? 1 : 0, elTagName );
					elIdx = t0[ename];
					return val == 'even' || val == '2n' ? elIdx % 2 == 0 :
						val == 'odd' || val == '2n+1' ? elIdx % 2 == 1 :
						elIdx == val;
				case'only-of-type':
					op = el.parentNode && el.parentNode.childNodes;
					if( op && ( j = op.length ) ){
						i = 0, opIdx = 0, elTagName = el.tagName;
						while( i < j ){
							if( op[i].nodeType == 1 && elTagName != 'HTML' && elTagName == op[i].tagName && ++opIdx && (val = op[i]) && opIdx > 1 ) return 0;
							i++;
						}
						if( opIdx == 1 && el == val ) return 1;
					}
					return 0;
				case'only-child':
					pEl = el.parentNode, t0 = domData(el);
					if( !t0.DQtimeOCH || t0.DQtimeOCH != finder.bsRtime || !t0.DQChElLen ){
						t0.DQtimeOCH = finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( i = op.length ) ){
							opIdx = 0, val = null;
							while( i-- ){
								if( op[i].nodeType == 1 && opIdx++ ) val = op[i];
								if( opIdx > 2 ) break;
							}
							if( opIdx == 1 ) t0.DQChEl = val;
						}
						t0.DQChElLen = opIdx;
					}
					return t0.DQChElLen == 1 && t0.DQChEl == el;
				case'first-child':case'last-child':
					pEl = el.parentNode, t0 = domData(el),
					key == 'first-child' ? ( tname = 'DQtimeFC', ename = 'DQFCEl' ) : ( tname = 'DQtimeLC', ename = 'DQLCEl' );
					if( !t0[tname] || t0[tname] != finder.bsRtime ){
						t0[tname] = finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( j = op.length ) ){
							t0[ename] = null;
							if( key.charAt(0) == 'f' ){
								for( j = i, i = 0 ; i < j ; i++ ){
									if( op[i].nodeType == 1 ){
										t0[ename] = op[i];
										break;
									}
								}
							}else{
								while( i-- ){
									if( op[i].nodeType == 1 ){
										t0[ename] = op[i];
										break;
									}
								}
							}
						}
					}
					return t0[ename] == el;
				case'nth-child':
					t0 = domData(el),
					key == 'nth-child' ? ( tname = 'DQtime', ename = 'DQindex' ) : ( tname = 'DQtimeL', ename = 'DQindexL' );
					if( val == 'n' ) return 1;
					if( !t0[tname] || t0[tname] != finder.bsRtime ) setIdx( el.parentNode, 1 );
					elIdx = t0[ename];
					return val == 'even' || val == '2n' ? elIdx % 2 == 0 :
						val == 'odd' || val == '2n+1' ? elIdx % 2 == 1 :
						elIdx == val;
				default:return 0;
				}
			default:return token == el.tagName || token == '*';
			}
		};
	})();
	query = function( query, doc, ret ){
		var el, els, sels, t0, i, j, k, m, n,
			tags, key, hit, token, tokens, hasQS;
		if( ret ) ret.length = 0;
		else ret = [];
		doc = doc || document,
		finder.bsRtime = +new Date(),
		finder.lastQuery = query;
		if( rClsTagId.test(query) ){
			if( ( key = query.charAt(0) ) == '#' )
				return ret[0] = doc.getElementById( query.substr(1) ), ret;
			else if( key == '.' && isClsName )
				return doc.getElementsByClassName( query.substr(1) );
			else if( rTag.test( query ) )
				return doc.getElementsByTagName( query );
		}
		if( isQSA && query.indexOf(',') > -1 && query.indexOf('!') < 0 ) return doc.querySelectorAll( query );
		oSel.length = 0,
		hasQS = 0,
		sels = utrim( query.split(',') );
		for( i = sels.length; i--; ){
			t0 = parseQuery( sels[i] );
			for( j = t0.length; j--; ){
				if( rTag.test( t0[j] ) )
					t0[j] = t0[j].toUpperCase();
				else if( t0[j].charAt(0) == ':' ){
					t0[j] = t0[j].toLowerCase();
					if( ( t0[j] == ':nth-child(n' || t0[j] == ':nth-last-child(n' ) && t0.length != 1 ){
						t0.splice(j,1);continue;
					}
				}
				if( isQSA && !hasQSAErr && !hasQS && !nQSA.indexOf( t0[j].charAt(0) ) > -1 ) hasQS = 1;
			}
			oSel.push( t0 );
		}
		//console.log("### oSel", oSel);return;
		if( oSel.length == 1 && oSel[0].length ){
			if( ( key = oSel[0][0].charAt(0) ) == '#' ){
				els = [doc.getElementById( oSel[0][0].substr(1) )],
				oSel[0].shift();
			}
			else if( key == '.' && isClsName ){
				els = doc.getElementsByClassName( oSel[0][0].substr(1) ),
				oSel[0].shift();
				if( hasQS && els.length > 100 ) return doc.querySelectorAll( query );
			}
			else if( key == '[' || key == ':' ){
				if( hasQS ) return doc.querySelectorAll( query );
				if( !hasParent ){
					els = oSel[0][oSel[0].length-1];
					if( ( key = els.charAt(0) ) == '#' )
						els = [doc.getElementById( els.substr(1) )],
						oSel[0].pop();
					else if( key == '.' && isClsName )
						els = doc.getElementsByClassName( els.substr(1) ),
						oSel[0].pop();
					else if( rTag.test( els ) )
						els = doc.getElementsByTagName( els ),
						oSel[0].pop();
					else
						els = doc.getElementsByTagName('*');
				}
				else
					els = doc.getElementsByTagName('*');
			}
			else if( rTag.test( els = oSel[0][0] ) ){
				els = doc.getElementsByTagName( els ),
				oSel[0].shift();
				if( hasQS && els.length > 100 ) return doc.querySelectorAll( query );
			}
			else els = doc.getElementsByTagName('*');
		}else{
			els = doc.getElementsByTagName('*');
		}
		if( !oSel[0].length ) return els;
		for( i = 0, j = els.length; i < j; i++ ){
			for( k = oSel.length; k--; ){
				tokens = oSel[k];
				el = els[i];
				for( m = 0, n = tokens.length; m < n; m++ ){
					token = tokens[m];
					hit = 0;
					if( ( key = token.charAt(0) ) == ' ' ){ // loop parent
						m++;
						while( el = el.parentNode ){
							if( hit = compareEl( el, tokens[m] ) ) break;
						}
					}else if( key == '>' ){ // immediate parent
						hit = compareEl( el = el.parentNode, tokens[++m] );
					}else if( key == '+' ){ // has immediate nextsibling
						while( el = el.previousSibling ) if( el.nodeType == 1 ) break;
						hit = el && compareEl( el, tokens[++m] );
					}else if( key == '~' ){ // has any nextsibling
						m++;
						while( el = el.previousSibling ){
							if( el.nodeType == 1 && compareEl( el, tokens[m] ) ){
								hit = 1; break;
							}
						}
					}else{
						hit = compareEl( el, token );
					}
					if( !hit ) break; // 여긴 AND 연산
				}
				if( hit ) break; // 여긴 OR 연산
			}
			if( hit ) ret[ret.length] = els[i];
		}
		return ret;
	};
	query.isQSA = isQSA;
	return query;
};