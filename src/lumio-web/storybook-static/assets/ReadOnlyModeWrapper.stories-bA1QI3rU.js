import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{c as g}from"./utils-BQHNewu7.js";import{A as h,a as y}from"./alert-DAD2EhLd.js";import{S as f}from"./shield-alert-CiYLILDg.js";import{B as j}from"./button-Fj27Zx3k.js";import{I as l}from"./input-DocKjuCE.js";import{L as i}from"./label-DmNWg_6T.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-LHNt3CwB.js";import"./shield-C13dSADR.js";import"./createLucideIcon-B_yB00Wp.js";import"./triangle-alert-BVH98Qf5.js";function d({isReadOnly:m,children:o,message:c="U bekijkt deze gegevens in alleen-lezen modus.",className:p,showBanner:u=!0}){return m?e.jsxs("div",{className:g("relative",p),children:[u&&e.jsx(h,{variant:"warning",className:"mb-4",children:e.jsxs(y,{children:[e.jsx(f,{className:"mr-2 inline h-4 w-4"}),c]})}),e.jsx("div",{className:"pointer-events-none select-none opacity-80","aria-disabled":"true",inert:"",children:o})]}):e.jsx(e.Fragment,{children:o})}d.__docgenInfo={description:`Wraps content in a read-only treatment when heir/read-only mode is active.\r
Disables pointer events on children and shows an optional banner.`,methods:[],displayName:"ReadOnlyModeWrapper",props:{isReadOnly:{required:!0,tsType:{name:"boolean"},description:"Whether read-only mode is active"},children:{required:!0,tsType:{name:"ReactNode"},description:"The content to wrap"},message:{required:!1,tsType:{name:"string"},description:"Optional banner message",defaultValue:{value:'"U bekijkt deze gegevens in alleen-lezen modus."',computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional className for the wrapper"},showBanner:{required:!1,tsType:{name:"boolean"},description:"Whether to show the banner (default: true)",defaultValue:{value:"true",computed:!1}}}};const W={title:"Security/ReadOnlyModeWrapper",component:d,tags:["autodocs"],parameters:{status:{type:"experimental"},governance:{maturity:"experimental",a11yLevel:"AA"}},argTypes:{isReadOnly:{control:"boolean"},showBanner:{control:"boolean"},message:{control:"text"}}},t=()=>e.jsxs("div",{className:"space-y-4 p-4 border rounded-lg",children:[e.jsxs("div",{className:"grid gap-1.5",children:[e.jsx(i,{htmlFor:"naam",children:"Naam"}),e.jsx(l,{id:"naam",defaultValue:"Jan de Vries"})]}),e.jsxs("div",{className:"grid gap-1.5",children:[e.jsx(i,{htmlFor:"email",children:"E-mail"}),e.jsx(l,{id:"email",type:"email",defaultValue:"jan@voorbeeld.nl"})]}),e.jsx(j,{children:"Opslaan"})]}),a={args:{isReadOnly:!1,children:e.jsx(t,{})}},r={args:{isReadOnly:!0,children:e.jsx(t,{})}},s={args:{isReadOnly:!0,showBanner:!1,children:e.jsx(t,{})}},n={args:{isReadOnly:!0,message:"U bent ingelogd als erfgenaam — alleen bekijken mogelijk.",children:e.jsx(t,{})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    isReadOnly: false,
    children: <SampleForm />
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    isReadOnly: true,
    children: <SampleForm />
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    isReadOnly: true,
    showBanner: false,
    children: <SampleForm />
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    isReadOnly: true,
    message: "U bent ingelogd als erfgenaam — alleen bekijken mogelijk.",
    children: <SampleForm />
  }
}`,...n.parameters?.docs?.source}}};const q=["Editable","ReadOnly","ReadOnlyNoBanner","CustomMessage"];export{n as CustomMessage,a as Editable,r as ReadOnly,s as ReadOnlyNoBanner,q as __namedExportsOrder,W as default};
