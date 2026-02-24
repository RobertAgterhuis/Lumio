import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{c as v}from"./utils-BQHNewu7.js";import{c as f}from"./index-LHNt3CwB.js";const h=f("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground",secondary:"border-transparent bg-secondary text-secondary-foreground",destructive:"border-transparent bg-destructive text-destructive-foreground",outline:"text-foreground",success:"border-transparent bg-success text-white",warning:"border-transparent bg-warning text-white",security:"border-transparent bg-secure text-white",info:"border-transparent bg-info text-white",danger:"border-transparent bg-danger text-white"}},defaultVariants:{variant:"default"}});function r({className:l,variant:p,...m}){return e.jsx("div",{className:v(h({variant:p}),l),...m})}r.__docgenInfo={description:`Small status indicator badge with semantic color variants.

@example
// Default badge
<Badge>New</Badge>

@example
// Semantic variants
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Failed</Badge>

@example
// Outline variant
<Badge variant="outline">Draft</Badge>`,methods:[],displayName:"Badge",composes:["HTMLAttributes","VariantProps"]};const B={title:"Primitives/Badge",component:r,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}},argTypes:{variant:{control:"select",options:["default","secondary","destructive","outline","success","warning","security","info","danger"]}}},a={args:{children:"Badge"}},n={args:{variant:"secondary",children:"Secundair"}},t={args:{variant:"destructive",children:"Destructief"}},s={args:{variant:"outline",children:"Outline"}},i={args:{variant:"success",children:"Voltooid"}},c={args:{variant:"warning",children:"Aandacht"}},o={args:{variant:"security",children:"Beveiligd"}},d={args:{variant:"info",children:"Informatie"}},g={args:{variant:"danger",children:"Gevaar"}},u={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(r,{children:"Default"}),e.jsx(r,{variant:"secondary",children:"Secondary"}),e.jsx(r,{variant:"destructive",children:"Destructive"}),e.jsx(r,{variant:"outline",children:"Outline"}),e.jsx(r,{variant:"success",children:"Success"}),e.jsx(r,{variant:"warning",children:"Warning"}),e.jsx(r,{variant:"security",children:"Security"}),e.jsx(r,{variant:"info",children:"Info"}),e.jsx(r,{variant:"danger",children:"Danger"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Badge"
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "secondary",
    children: "Secundair"
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive",
    children: "Destructief"
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    children: "Outline"
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "danger",
    children: "Gevaar"
  }
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};const x=["Default","Secondary","Destructive","Outline","Success","Warning","Security","Info","Danger","AllVariants"],w=Object.freeze(Object.defineProperty({__proto__:null,AllVariants:u,Danger:g,Default:a,Destructive:t,Info:d,Outline:s,Secondary:n,Security:o,Success:i,Warning:c,__namedExportsOrder:x,default:B},Symbol.toStringTag,{value:"Module"}));export{u as A,w as B,a as D};
