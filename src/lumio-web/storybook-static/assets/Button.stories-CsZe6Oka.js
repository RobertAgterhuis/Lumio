import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{B as r}from"./button-6i_qtU0N.js";import{c as v}from"./createLucideIcon-sem_sh0Z.js";import"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";import"./index-LHNt3CwB.js";const x=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],B=v("arrow-right",x);const S=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],j=v("download",S);const k=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],w=v("loader-circle",k);const f=[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]],y=v("mail",f),O={title:"Primitives/Button",component:r,tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{control:"select",options:["default","sm","lg","icon"]},disabled:{control:"boolean"}}},a={args:{children:"Button"}},s={args:{variant:"destructive",children:"Verwijderen"}},n={args:{variant:"outline",children:"Outline"}},t={args:{variant:"secondary",children:"Secundair"}},o={args:{variant:"ghost",children:"Ghost"}},c={args:{variant:"link",children:"Link"}},i={args:{size:"sm",children:"Klein"}},d={args:{size:"lg",children:"Groot"}},l={args:{size:"icon",children:e.jsx(y,{className:"h-4 w-4"})}},m={args:{children:e.jsxs(e.Fragment,{children:[e.jsx(j,{className:"mr-2 h-4 w-4"}),"Download"]})}},u={args:{disabled:!0,children:e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"mr-2 h-4 w-4 animate-spin"}),"Laden..."]})}},p={args:{disabled:!0,children:"Uitgeschakeld"}},h={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-4",children:[e.jsx(r,{children:"Default"}),e.jsx(r,{variant:"secondary",children:"Secondary"}),e.jsx(r,{variant:"destructive",children:"Destructive"}),e.jsx(r,{variant:"outline",children:"Outline"}),e.jsx(r,{variant:"ghost",children:"Ghost"}),e.jsx(r,{variant:"link",children:"Link"})]})},g={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(r,{size:"sm",children:"Klein"}),e.jsx(r,{size:"default",children:"Default"}),e.jsx(r,{size:"lg",children:"Groot"}),e.jsx(r,{size:"icon",children:e.jsx(B,{className:"h-4 w-4"})})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Button"
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive",
    children: "Verwijderen"
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    children: "Outline"
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "secondary",
    children: "Secundair"
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "ghost",
    children: "Ghost"
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "link",
    children: "Link"
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm",
    children: "Klein"
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg",
    children: "Groot"
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: "icon",
    children: <Mail className="h-4 w-4" />
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>\r
        <Download className="mr-2 h-4 w-4" />\r
        Download\r
      </>
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: <>\r
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />\r
        Laden...\r
      </>
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: "Uitgeschakeld"
  }
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-4">\r
      <Button>Default</Button>\r
      <Button variant="secondary">Secondary</Button>\r
      <Button variant="destructive">Destructive</Button>\r
      <Button variant="outline">Outline</Button>\r
      <Button variant="ghost">Ghost</Button>\r
      <Button variant="link">Link</Button>\r
    </div>
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">\r
      <Button size="sm">Klein</Button>\r
      <Button size="default">Default</Button>\r
      <Button size="lg">Groot</Button>\r
      <Button size="icon"><ArrowRight className="h-4 w-4" /></Button>\r
    </div>
}`,...g.parameters?.docs?.source}}};const A=["Default","Destructive","Outline","Secondary","Ghost","Link","Small","Large","Icon","WithIcon","Loading","Disabled","AllVariants","AllSizes"];export{g as AllSizes,h as AllVariants,a as Default,s as Destructive,p as Disabled,o as Ghost,l as Icon,d as Large,c as Link,u as Loading,n as Outline,t as Secondary,i as Small,m as WithIcon,A as __namedExportsOrder,O as default};
