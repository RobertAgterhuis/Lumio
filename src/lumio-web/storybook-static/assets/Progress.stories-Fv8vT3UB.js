import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{c as v}from"./utils-BQHNewu7.js";import{r as h}from"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";const u=h.forwardRef(({className:p,value:m=0,max:i=100,label:a,showValue:c,...g},f)=>{const d=Math.min(100,Math.max(0,m/i*100));return e.jsxs("div",{ref:f,className:v("w-full",p),...g,children:[(a||c)&&e.jsxs("div",{className:"mb-1 flex items-center justify-between text-sm",children:[a&&e.jsx("span",{className:"font-medium text-foreground",children:a}),c&&e.jsxs("span",{className:"text-muted-foreground",children:[Math.round(d),"%"]})]}),e.jsx("div",{className:"relative h-2 w-full overflow-hidden rounded-full bg-muted",role:"progressbar","aria-valuenow":m,"aria-valuemin":0,"aria-valuemax":i,"aria-label":a,children:e.jsx("div",{className:"h-full rounded-full bg-primary transition-all duration-300 ease-in-out",style:{width:`${d}%`}})})]})});u.displayName="Progress";u.__docgenInfo={description:"",methods:[],displayName:"Progress",props:{value:{required:!1,tsType:{name:"number"},description:"Current value (0–100)",defaultValue:{value:"0",computed:!1}},max:{required:!1,tsType:{name:"number"},description:"Maximum value (default 100)",defaultValue:{value:"100",computed:!1}},label:{required:!1,tsType:{name:"string"},description:"Optional label displayed above the bar"},showValue:{required:!1,tsType:{name:"boolean"},description:"Show percentage text"}},composes:["HTMLAttributes"]};const y={title:"Primitives/Progress",component:u,tags:["autodocs"],argTypes:{value:{control:{type:"range",min:0,max:100,step:1}},max:{control:"number"},label:{control:"text"},showValue:{control:"boolean"}}},r={args:{value:60}},s={args:{value:75,label:"Profiel compleetheid"}},o={args:{value:42,label:"Voortgang",showValue:!0}},t={args:{value:0,label:"Nog niet gestart"}},l={args:{value:100,label:"Voltooid",showValue:!0}},n={args:{value:3,max:8,label:"Stap 3 van 8",showValue:!0}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: "Profiel compleetheid"
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: 42,
    label: "Voortgang",
    showValue: true
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: "Nog niet gestart"
  }
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: "Voltooid",
    showValue: true
  }
}`,...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    value: 3,
    max: 8,
    label: "Stap 3 van 8",
    showValue: true
  }
}`,...n.parameters?.docs?.source}}};const N=["Default","WithLabel","WithValue","Empty","Complete","CustomMax"];export{l as Complete,n as CustomMax,r as Default,t as Empty,s as WithLabel,o as WithValue,N as __namedExportsOrder,y as default};
