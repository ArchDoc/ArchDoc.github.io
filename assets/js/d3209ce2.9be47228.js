"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[799],{3905:(e,t,i)=>{i.d(t,{Zo:()=>p,kt:()=>h});var n=i(7294);function r(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function o(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function a(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?o(Object(i),!0).forEach((function(t){r(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):o(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function c(e,t){if(null==e)return{};var i,n,r=function(e,t){if(null==e)return{};var i,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)i=o[n],t.indexOf(i)>=0||(r[i]=e[i]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)i=o[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}var s=n.createContext({}),l=function(e){var t=n.useContext(s),i=t;return e&&(i="function"==typeof e?e(t):a(a({},t),e)),i},p=function(e){var t=l(e.components);return n.createElement(s.Provider,{value:t},e.children)},f="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var i=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),f=l(i),u=r,h=f["".concat(s,".").concat(u)]||f[u]||d[u]||o;return i?n.createElement(h,a(a({ref:t},p),{},{components:i})):n.createElement(h,a({ref:t},p))}));function h(e,t){var i=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=i.length,a=new Array(o);a[0]=u;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c[f]="string"==typeof e?e:r,a[1]=c;for(var l=2;l<o;l++)a[l]=i[l];return n.createElement.apply(null,a)}return n.createElement.apply(null,i)}u.displayName="MDXCreateElement"},4100:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>c,toc:()=>l});var n=i(7462),r=(i(7294),i(3905));const o={sidebar_position:2},a="Definitions",c={unversionedId:"specification/definitions",id:"version-1.0.0/specification/definitions",title:"Definitions",description:"The following provides descriptions on how an ArchDoc Specification file is to be constructed and validated.",source:"@site/versioned_docs/version-1.0.0/specification/definitions.md",sourceDirName:"specification",slug:"/specification/definitions",permalink:"/docs/specification/definitions",draft:!1,tags:[],version:"1.0.0",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"specSidebar",previous:{title:"Overview",permalink:"/docs/specification/"},next:{title:"Schemas",permalink:"/docs/category/schemas"}},s={},l=[{value:"ArchDoc Specification File",id:"archdoc-specification-file",level:2},{value:"Validation",id:"validation",level:2}],p={toc:l},f="wrapper";function d(e){let{components:t,...i}=e;return(0,r.kt)(f,(0,n.Z)({},p,i,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"definitions"},"Definitions"),(0,r.kt)("p",null,"The following provides descriptions on how an ArchDoc Specification file is to be constructed and validated."),(0,r.kt)("h2",{id:"archdoc-specification-file"},"ArchDoc Specification File"),(0,r.kt)("p",null,"The ArchDoc Specification file is a YAML file that contains a single YAML document, where the structure equals the ",(0,r.kt)("a",{parentName:"p",href:"/docs/specification/schemas/archdoc"},"ArchDoc")," schema."),(0,r.kt)("h2",{id:"validation"},"Validation"),(0,r.kt)("p",null,"Each schema in an ArchDoc Specification file has a defined specification, defining all available properties to use. When parsing an ArchDoc Specification file, an error ",(0,r.kt)("strong",{parentName:"p"},"MUST")," be thrown if any of the following is true:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Type"),": The property's type is not the same as the value provided in the file."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Required"),": The property is required and not present in the file.")))}d.isMDXComponent=!0}}]);