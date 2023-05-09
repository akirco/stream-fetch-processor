"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var c=Object.defineProperty;var l=(o,e,r)=>e in o?c(o,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):o[e]=r;var a=(o,e,r)=>(l(o,typeof e!="symbol"?e+"":e,r),r);var n=class{constructor(e={}){a(this,"decoder");a(this,"reader");a(this,"controller");a(this,"response",null);this.decoder=_nullishCoalesce(e.decoder, () => (new TextDecoder("utf-8"))),this.controller=new AbortController,this.reader=null}async fetchData(e,r,s=3){try{let t=await fetch(e,{...r,signal:this.controller.signal});if(!t.ok)throw new Error(`Response error: ${t.status} ${t.statusText}`);return t.ok&&(this.response=t),t}catch(t){if(s>0)return this.fetchData(e,r,s-1);throw new Error(`Failed to fetch: ${t}`)}}async read(e){if(!this.response&&!e)throw new Error("No response available");try{if(this.reader=_optionalChain([(_nullishCoalesce(e, () => (this.response))), 'optionalAccess', _ => _.body, 'optionalAccess', _2 => _2.getReader, 'call', _3 => _3()]),this.reader){let{done:r,value:s}=await this.reader.read(),t=this.decoder.decode(s);return{done:r,value:t}}else return{done:!0,value:""}}catch(r){throw _optionalChain([this, 'access', _4 => _4.reader, 'optionalAccess', _5 => _5.cancel, 'call', _6 => _6()]),new Error(`Failed to read: ${r}`)}finally{_optionalChain([this, 'access', _7 => _7.reader, 'optionalAccess', _8 => _8.releaseLock, 'call', _9 => _9()]),_optionalChain([this, 'access', _10 => _10.response, 'optionalAccess', _11 => _11.body, 'optionalAccess', _12 => _12.cancel, 'call', _13 => _13()]),_optionalChain([e, 'optionalAccess', _14 => _14.body, 'optionalAccess', _15 => _15.cancel, 'call', _16 => _16()])}}cancel(){_optionalChain([this, 'access', _17 => _17.reader, 'optionalAccess', _18 => _18.cancel, 'call', _19 => _19()]),this.controller.abort()}};exports.default = n;
