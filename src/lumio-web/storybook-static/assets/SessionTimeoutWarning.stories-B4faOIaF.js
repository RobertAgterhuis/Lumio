import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{c as v}from"./utils-BQHNewu7.js";import{B as c}from"./button-Fj27Zx3k.js";import{D as b,a as D,b as L,c as k,d as j}from"./dialog-CmKZs74s.js";import{C as w}from"./clock-RMgU-T8u.js";import{c as T}from"./createLucideIcon-B_yB00Wp.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-LHNt3CwB.js";const S=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],N=T("log-out",S);function u({open:d,secondsLeft:r,onDismiss:a,onLock:i,title:l="Sessie verloopt",description:m="Uw sessie wordt automatisch vergrendeld vanwege inactiviteit.",dismissLabel:p="Doorgaan",lockLabel:g="Nu vergrendelen"}){const f=Math.floor(r/60),x=r%60,h=`${f}:${x.toString().padStart(2,"0")}`;return e.jsxs(b,{open:d,onOpenChange:y=>!y&&a(),children:[e.jsxs(D,{children:[e.jsx("div",{className:"mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 text-warning",children:e.jsx(w,{className:"h-6 w-6"})}),e.jsx(L,{children:l}),e.jsx(k,{children:m})]}),e.jsx("div",{className:"my-4 flex justify-center",children:e.jsx("span",{className:v("rounded-lg bg-muted px-6 py-3 text-3xl font-mono font-bold tabular-nums text-foreground",r<=30&&"text-danger"),"aria-live":"polite","aria-atomic":"true",children:h})}),e.jsxs(j,{children:[i&&e.jsxs(c,{type:"button",variant:"outline",onClick:i,children:[e.jsx(N,{className:"mr-2 h-4 w-4"}),g]}),e.jsx(c,{type:"button",onClick:a,autoFocus:!0,children:p})]})]})}u.__docgenInfo={description:"",methods:[],displayName:"SessionTimeoutWarning",props:{open:{required:!0,tsType:{name:"boolean"},description:"Whether the dialog is visible"},secondsLeft:{required:!0,tsType:{name:"number"},description:"Seconds remaining before auto-lock"},onDismiss:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback to dismiss/extend the session"},onLock:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when user chooses to lock now"},title:{required:!1,tsType:{name:"string"},description:"Title text",defaultValue:{value:'"Sessie verloopt"',computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text",defaultValue:{value:'"Uw sessie wordt automatisch vergrendeld vanwege inactiviteit."',computed:!1}},dismissLabel:{required:!1,tsType:{name:"string"},description:"Dismiss button label",defaultValue:{value:'"Doorgaan"',computed:!1}},lockLabel:{required:!1,tsType:{name:"string"},description:"Lock button label",defaultValue:{value:'"Nu vergrendelen"',computed:!1}}}};const H={title:"Security/SessionTimeoutWarning",component:u,tags:["autodocs"],parameters:{status:{type:"experimental"},governance:{maturity:"experimental",a11yLevel:"AA"}},argTypes:{open:{control:"boolean"},secondsLeft:{control:{type:"range",min:0,max:300,step:1}}}},s={args:{open:!0,secondsLeft:120,onDismiss:()=>{}}},t={args:{open:!0,secondsLeft:15,onDismiss:()=>{}}},o={args:{open:!0,secondsLeft:60,onDismiss:()=>{},onLock:()=>{}}},n={args:{open:!0,secondsLeft:5,onDismiss:()=>{},onLock:()=>{}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    secondsLeft: 120,
    onDismiss: () => {}
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    secondsLeft: 15,
    onDismiss: () => {}
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    secondsLeft: 60,
    onDismiss: () => {},
    onLock: () => {}
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    secondsLeft: 5,
    onDismiss: () => {},
    onLock: () => {}
  }
}`,...n.parameters?.docs?.source}}};const M=["Default","Urgent","WithLockButton","AlmostExpired"];export{n as AlmostExpired,s as Default,t as Urgent,o as WithLockButton,M as __namedExportsOrder,H as default};
