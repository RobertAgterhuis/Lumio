import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{B as r}from"./button-Fj27Zx3k.js";import{A as j}from"./arrow-right-DRpLBAn6.js";import{c as f}from"./createLucideIcon-B_yB00Wp.js";const S=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],k=f("download",S);const y=[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]],L=f("mail",y),w={title:"Primitives/Button",component:r,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}},argTypes:{variant:{control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{control:"select",options:["default","sm","lg","icon"]},disabled:{control:"boolean"},loading:{control:"boolean"}}},a={args:{children:"Button"}},n={args:{variant:"destructive",children:"Verwijderen"}},s={args:{variant:"outline",children:"Outline"}},t={args:{variant:"secondary",children:"Secundair"}},o={args:{variant:"ghost",children:"Ghost"}},i={args:{variant:"link",children:"Link"}},c={args:{size:"sm",children:"Klein"}},d={args:{size:"lg",children:"Groot"}},l={args:{size:"icon",children:e.jsx(L,{className:"h-4 w-4"})}},u={args:{children:e.jsxs(e.Fragment,{children:[e.jsx(k,{className:"mr-2 h-4 w-4"}),"Download"]})}},m={args:{loading:!0,children:"Opslaan"}},h={args:{disabled:!0,children:"Uitgeschakeld"}},p={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-4",children:[e.jsx(r,{children:"Default"}),e.jsx(r,{variant:"secondary",children:"Secondary"}),e.jsx(r,{variant:"destructive",children:"Destructive"}),e.jsx(r,{variant:"outline",children:"Outline"}),e.jsx(r,{variant:"ghost",children:"Ghost"}),e.jsx(r,{variant:"link",children:"Link"})]})},g={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(r,{size:"sm",children:"Klein"}),e.jsx(r,{size:"default",children:"Default"}),e.jsx(r,{size:"lg",children:"Groot"}),e.jsx(r,{size:"icon",children:e.jsx(j,{className:"h-4 w-4"})})]})},v={render:function(){return e.jsx(r,{asChild:!0,children:e.jsx("a",{href:"https://example.com",children:"Link styled as button"})})},args:{asChild:!0}},x={render:function(){return e.jsxs("div",{className:"flex flex-wrap items-center gap-4",children:[e.jsx(r,{asChild:!0,children:e.jsx("a",{href:"#",children:"Default Link"})}),e.jsx(r,{asChild:!0,variant:"outline",children:e.jsx("a",{href:"#",children:"Outline Link"})}),e.jsx(r,{asChild:!0,variant:"secondary",children:e.jsx("a",{href:"#",children:"Secondary Link"})}),e.jsx(r,{asChild:!0,variant:"ghost",children:e.jsx("a",{href:"#",children:"Ghost Link"})})]})},args:{asChild:!0}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Button"
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive",
    children: "Verwijderen"
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    children: "Outline"
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "secondary",
    children: "Secundair"
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "ghost",
    children: "Ghost"
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "link",
    children: "Link"
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm",
    children: "Klein"
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg",
    children: "Groot"
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: "icon",
    children: <Mail className="h-4 w-4" />
  }
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>\r
        <Download className="mr-2 h-4 w-4" />\r
        Download\r
      </>
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: "Opslaan"
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: "Uitgeschakeld"
  }
}`,...h.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-4">\r
      <Button>Default</Button>\r
      <Button variant="secondary">Secondary</Button>\r
      <Button variant="destructive">Destructive</Button>\r
      <Button variant="outline">Outline</Button>\r
      <Button variant="ghost">Ghost</Button>\r
      <Button variant="link">Link</Button>\r
    </div>
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">\r
      <Button size="sm">Klein</Button>\r
      <Button size="default">Default</Button>\r
      <Button size="lg">Groot</Button>\r
      <Button size="icon"><ArrowRight className="h-4 w-4" /></Button>\r
    </div>
}`,...g.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    return <Button asChild>\r
        <a href="https://example.com">Link styled as button</a>\r
      </Button>;
  },
  args: {
    asChild: true
  }
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    return <div className="flex flex-wrap items-center gap-4">\r
        <Button asChild>\r
          <a href="#">Default Link</a>\r
        </Button>\r
        <Button asChild variant="outline">\r
          <a href="#">Outline Link</a>\r
        </Button>\r
        <Button asChild variant="secondary">\r
          <a href="#">Secondary Link</a>\r
        </Button>\r
        <Button asChild variant="ghost">\r
          <a href="#">Ghost Link</a>\r
        </Button>\r
      </div>;
  },
  args: {
    asChild: true
  }
}`,...x.parameters?.docs?.source}}};const z=["Default","Destructive","Outline","Secondary","Ghost","Link","Small","Large","Icon","WithIcon","Loading","Disabled","AllVariants","AllSizes","AsChildLink","AsChildVariants"],N=Object.freeze(Object.defineProperty({__proto__:null,AllSizes:g,AllVariants:p,AsChildLink:v,AsChildVariants:x,Default:a,Destructive:n,Disabled:h,Ghost:o,Icon:l,Large:d,Link:i,Loading:m,Outline:s,Secondary:t,Small:c,WithIcon:u,__namedExportsOrder:z,default:w},Symbol.toStringTag,{value:"Module"}));export{p as A,N as B,a as D,m as L,u as W,g as a,v as b};
