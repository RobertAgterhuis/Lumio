import{j as t}from"./jsx-runtime-Cfjfh6m4.js";import{r as c}from"./iframe-BZkGcvi5.js";import{c as d}from"./utils-BQHNewu7.js";import{c as m}from"./createLucideIcon-sem_sh0Z.js";import"./preload-helper-PPVm8Dsz.js";const x=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],y=m("eye-off",x);const k=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],b=m("eye",k);function p({value:f,maskedText:g="••••••••",autoHideMs:n=1e4,className:v,toggleLabel:h="Toon/verberg waarde"}){const[e,l]=c.useState(!1),u=c.useCallback(()=>l(!1),[]);return c.useEffect(()=>{if(!e||n<=0)return;const i=setTimeout(u,n);return()=>clearTimeout(i)},[e,n,u]),t.jsxs("div",{className:d("inline-flex items-center gap-2",v),children:[t.jsx("span",{className:d("font-mono text-sm",e?"text-foreground":"text-muted-foreground select-none"),"aria-live":"polite",children:e?f:g}),t.jsx("button",{type:"button",onClick:()=>l(i=>!i),className:"inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring","aria-label":h,children:e?t.jsx(y,{className:"h-4 w-4"}):t.jsx(b,{className:"h-4 w-4"})})]})}p.__docgenInfo={description:"",methods:[],displayName:"SecureValueReveal",props:{value:{required:!0,tsType:{name:"string"},description:"The sensitive value to display when revealed"},maskedText:{required:!1,tsType:{name:"string"},description:'Masked placeholder text (default: "••••••••")',defaultValue:{value:'"••••••••"',computed:!1}},autoHideMs:{required:!1,tsType:{name:"number"},description:"Auto-hide timeout in milliseconds (default: 10000 = 10s, 0 = never)",defaultValue:{value:"10000",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional class names"},toggleLabel:{required:!1,tsType:{name:"string"},description:"Accessible label for the toggle button",defaultValue:{value:'"Toon/verberg waarde"',computed:!1}}}};const H={title:"Security/SecureValueReveal",component:p,tags:["autodocs"],argTypes:{autoHideMs:{control:"number"},maskedText:{control:"text"}}},a={args:{value:"geheim-wachtwoord-123"}},s={args:{value:"ABC-DEF-GHI-JKL",maskedText:"****-****-****-****"}},r={args:{value:"Blijft zichtbaar totdat je op het oog klikt",autoHideMs:0}},o={args:{value:"Verdwijnt na 3 seconden",autoHideMs:3e3}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    value: "geheim-wachtwoord-123"
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: "ABC-DEF-GHI-JKL",
    maskedText: "****-****-****-****"
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: "Blijft zichtbaar totdat je op het oog klikt",
    autoHideMs: 0
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: "Verdwijnt na 3 seconden",
    autoHideMs: 3000
  }
}`,...o.parameters?.docs?.source}}};const A=["Default","CustomMask","NoAutoHide","QuickAutoHide"];export{s as CustomMask,a as Default,r as NoAutoHide,o as QuickAutoHide,A as __namedExportsOrder,H as default};
