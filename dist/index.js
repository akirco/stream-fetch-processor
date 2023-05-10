var i=Object.defineProperty;var d=(a,e,r)=>e in a?i(a,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):a[e]=r;var s=(a,e,r)=>(d(a,typeof e!="symbol"?e+"":e,r),r);var n=class{constructor(e={}){s(this,"decoder");s(this,"reader");s(this,"controller");s(this,"response",null);s(this,"parser");this.decoder=e.decoder??new TextDecoder("utf-8"),this.controller=new AbortController,this.reader=null,this.parser=e.parser??(r=>r)}async fetchData(e,r,o=3){try{let t=await fetch(e,{...r,signal:this.controller.signal});if(!t.ok)throw new Error(`Response error: ${t.status} ${t.statusText}`);return t.ok&&(this.response=t),t}catch(t){if(o>0)return this.fetchData(e,r,o-1);throw new Error(`Failed to fetch: ${t}`)}}async read(e){if(!this.response&&!e)throw new Error("No response available");try{this.reader=(e??this.response)?.body?.getReader();let r=!1,o=null;if(this.reader){for(;!r;){let{done:t,value:l}=await this.reader.read();if(r=t,l){let c=this.decoder.decode(l);o=this.parser(c);break}}return{done:r,value:o}}else return{done:!0,value:null}}catch(r){throw this.reader?.cancel(),new Error(`Failed to read: ${r}`)}finally{this.reader?.releaseLock(),this.response?.body?.cancel(),e?.body?.cancel()}}cancel(){this.reader?.cancel(),this.controller.abort()}};export{n as default};
