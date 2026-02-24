import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{c as k}from"./utils-BQHNewu7.js";import{r as u}from"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";const c=u.forwardRef(({className:m,label:i,description:d,id:b,...g},h)=>{const x=u.useId(),l=b??x,p=e.jsx("input",{type:"checkbox",id:l,ref:h,className:k("h-4 w-4 shrink-0 rounded border-border text-primary accent-primary","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2","disabled:cursor-not-allowed disabled:opacity-50",m),...g});return i?e.jsxs("div",{className:"flex items-start space-x-2",children:[p,e.jsxs("div",{className:"grid gap-0.5 leading-none",children:[e.jsx("label",{htmlFor:l,className:"text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70",children:i}),d&&e.jsx("p",{className:"text-xs text-muted-foreground",children:d})]})]}):p});c.displayName="Checkbox";c.__docgenInfo={description:"",methods:[],displayName:"Checkbox",props:{label:{required:!1,tsType:{name:"string"},description:"Label text displayed next to the checkbox"},description:{required:!1,tsType:{name:"string"},description:"Optional description text below the label"}},composes:["Omit"]};const{fn:f}=__STORYBOOK_MODULE_TEST__,D={title:"Primitives/Checkbox",component:c,tags:["autodocs"],parameters:{status:{type:"stable"},governance:{maturity:"stable",a11yLevel:"AA"}},argTypes:{checked:{control:"boolean"},disabled:{control:"boolean"},label:{control:"text"},description:{control:"text"}},args:{onChange:f()}},r={args:{label:"Ik ga akkoord"}},s={args:{label:"Geselecteerd",checked:!0}},a={args:{label:"Uitsluitingsclausule",description:"Een erfenis kan niet worden aangetast door echtscheiding."}},t={args:{label:"Niet beschikbaar",disabled:!0}},o={args:{label:"Vergrendeld",disabled:!0,checked:!0}},n={args:{}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Ik ga akkoord"
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Geselecteerd",
    checked: true
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Uitsluitingsclausule",
    description: "Een erfenis kan niet worden aangetast door echtscheiding."
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Niet beschikbaar",
    disabled: true
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Vergrendeld",
    disabled: true,
    checked: true
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...n.parameters?.docs?.source}}};const N=["Default","Checked","WithDescription","Disabled","DisabledChecked","WithoutLabel"];export{s as Checked,r as Default,t as Disabled,o as DisabledChecked,a as WithDescription,n as WithoutLabel,N as __namedExportsOrder,D as default};
