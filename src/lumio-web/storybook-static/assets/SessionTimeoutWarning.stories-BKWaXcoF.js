import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{c as b}from"./utils-BQHNewu7.js";import{B as c}from"./button-6i_qtU0N.js";import{D as k,a as D,b as L,c as j,d as w}from"./dialog-pZ5-40IS.js";import{c as d}from"./createLucideIcon-sem_sh0Z.js";import"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";import"./index-LHNt3CwB.js";const T=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]],S=d("clock",T);const N=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],q=d("log-out",N);function u({open:l,secondsLeft:r,onDismiss:a,onLock:i,title:m="Sessie verloopt",description:p="Uw sessie wordt automatisch vergrendeld vanwege inactiviteit.",dismissLabel:g="Doorgaan",lockLabel:f="Nu vergrendelen"}){const h=Math.floor(r/60),x=r%60,y=`${h}:${x.toString().padStart(2,"0")}`;return e.jsxs(k,{open:l,onOpenChange:v=>!v&&a(),children:[e.jsxs(D,{children:[e.jsx("div",{className:"mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 text-warning",children:e.jsx(S,{className:"h-6 w-6"})}),e.jsx(L,{children:m}),e.jsx(j,{children:p})]}),e.jsx("div",{className:"my-4 flex justify-center",children:e.jsx("span",{className:b("rounded-lg bg-muted px-6 py-3 text-3xl font-mono font-bold tabular-nums text-foreground",r<=30&&"text-danger"),"aria-live":"polite","aria-atomic":"true",children:y})}),e.jsxs(w,{children:[i&&e.jsxs(c,{type:"button",variant:"outline",onClick:i,children:[e.jsx(q,{className:"mr-2 h-4 w-4"}),f]}),e.jsx(c,{type:"button",onClick:a,autoFocus:!0,children:g})]})]})}u.__docgenInfo={description:"",methods:[],displayName:"SessionTimeoutWarning",props:{open:{required:!0,tsType:{name:"boolean"},description:"Whether the dialog is visible"},secondsLeft:{required:!0,tsType:{name:"number"},description:"Seconds remaining before auto-lock"},onDismiss:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback to dismiss/extend the session"},onLock:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when user chooses to lock now"},title:{required:!1,tsType:{name:"string"},description:"Title text",defaultValue:{value:'"Sessie verloopt"',computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text",defaultValue:{value:'"Uw sessie wordt automatisch vergrendeld vanwege inactiviteit."',computed:!1}},dismissLabel:{required:!1,tsType:{name:"string"},description:"Dismiss button label",defaultValue:{value:'"Doorgaan"',computed:!1}},lockLabel:{required:!1,tsType:{name:"string"},description:"Lock button label",defaultValue:{value:'"Nu vergrendelen"',computed:!1}}}};const H={title:"Security/SessionTimeoutWarning",component:u,tags:["autodocs"],argTypes:{open:{control:"boolean"},secondsLeft:{control:{type:"range",min:0,max:300,step:1}}}},s={args:{open:!0,secondsLeft:120,onDismiss:()=>{}}},t={args:{open:!0,secondsLeft:15,onDismiss:()=>{}}},o={args:{open:!0,secondsLeft:60,onDismiss:()=>{},onLock:()=>{}}},n={args:{open:!0,secondsLeft:5,onDismiss:()=>{},onLock:()=>{}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const O=["Default","Urgent","WithLockButton","AlmostExpired"];export{n as AlmostExpired,s as Default,t as Urgent,o as WithLockButton,O as __namedExportsOrder,H as default};
