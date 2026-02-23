import{j as r}from"./jsx-runtime-Cfjfh6m4.js";import{c as v}from"./utils-BQHNewu7.js";import{c as f}from"./index-LHNt3CwB.js";import"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";const h=f("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground",secondary:"border-transparent bg-secondary text-secondary-foreground",destructive:"border-transparent bg-destructive text-destructive-foreground",outline:"text-foreground",success:"border-transparent bg-success text-white",warning:"border-transparent bg-warning text-white",security:"border-transparent bg-secure text-white",info:"border-transparent bg-info text-white",danger:"border-transparent bg-danger text-white"}},defaultVariants:{variant:"default"}});function e({className:l,variant:p,...m}){return r.jsx("div",{className:v(h({variant:p}),l),...m})}e.__docgenInfo={description:"",methods:[],displayName:"Badge",composes:["HTMLAttributes","VariantProps"]};const w={title:"Primitives/Badge",component:e,tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","secondary","destructive","outline","success","warning","security","info","danger"]}}},a={args:{children:"Badge"}},n={args:{variant:"secondary",children:"Secundair"}},s={args:{variant:"destructive",children:"Destructief"}},t={args:{variant:"outline",children:"Outline"}},i={args:{variant:"success",children:"Voltooid"}},c={args:{variant:"warning",children:"Aandacht"}},o={args:{variant:"security",children:"Beveiligd"}},d={args:{variant:"info",children:"Informatie"}},u={args:{variant:"danger",children:"Gevaar"}},g={render:()=>r.jsxs("div",{className:"flex flex-wrap gap-2",children:[r.jsx(e,{children:"Default"}),r.jsx(e,{variant:"secondary",children:"Secondary"}),r.jsx(e,{variant:"destructive",children:"Destructive"}),r.jsx(e,{variant:"outline",children:"Outline"}),r.jsx(e,{variant:"success",children:"Success"}),r.jsx(e,{variant:"warning",children:"Warning"}),r.jsx(e,{variant:"security",children:"Security"}),r.jsx(e,{variant:"info",children:"Info"}),r.jsx(e,{variant:"danger",children:"Danger"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Badge"
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "secondary",
    children: "Secundair"
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive",
    children: "Destructief"
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    children: "Outline"
  }
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "success",
    children: "Voltooid"
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    children: "Aandacht"
  }
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "security",
    children: "Beveiligd"
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "info",
    children: "Informatie"
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "danger",
    children: "Gevaar"
  }
}`,...u.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">\r
      <Badge>Default</Badge>\r
      <Badge variant="secondary">Secondary</Badge>\r
      <Badge variant="destructive">Destructive</Badge>\r
      <Badge variant="outline">Outline</Badge>\r
      <Badge variant="success">Success</Badge>\r
      <Badge variant="warning">Warning</Badge>\r
      <Badge variant="security">Security</Badge>\r
      <Badge variant="info">Info</Badge>\r
      <Badge variant="danger">Danger</Badge>\r
    </div>
}`,...g.parameters?.docs?.source}}};const D=["Default","Secondary","Destructive","Outline","Success","Warning","Security","Info","Danger","AllVariants"];export{g as AllVariants,u as Danger,a as Default,s as Destructive,d as Info,t as Outline,n as Secondary,o as Security,i as Success,c as Warning,D as __namedExportsOrder,w as default};
