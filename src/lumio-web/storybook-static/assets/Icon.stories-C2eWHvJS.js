import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{c as z}from"./utils-BQHNewu7.js";import{c as t}from"./createLucideIcon-B_yB00Wp.js";import{T as p}from"./triangle-alert-BVH98Qf5.js";import{X as x,S as b}from"./x-BO3TY1gv.js";const y=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],g=t("bell",y);const j=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],u=t("check",j);const I=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],s=t("house",I);const w=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],f=t("settings",w);const S=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],k=t("user",S),H={sm:"h-4 w-4",md:"h-5 w-5",lg:"h-6 w-6",xl:"h-8 w-8"};function n({icon:m,size:l="md",label:d,className:h,...v}){const N=!d;return e.jsx(m,{className:z(H[l],h),"aria-hidden":N,"aria-label":d,role:d?"img":void 0,...v})}n.__docgenInfo={description:`Icon wrapper component with accessibility and size presets.

By default, icons are decorative (aria-hidden). Provide a \`label\`
prop to make the icon accessible to screen readers.

@example
// Decorative icon (hidden from screen readers)
import { Home } from "lucide-react";
<Icon icon={Home} size="md" />

@example
// Accessible icon with label
import { AlertTriangle } from "lucide-react";
<Icon icon={AlertTriangle} label="Warning" className="text-warning" />

@example
// Custom size via className
import { Search } from "lucide-react";
<Icon icon={Search} className="h-10 w-10" />`,methods:[],displayName:"Icon",props:{icon:{required:!0,tsType:{name:"LucideIcon"},description:`The Lucide icon component to render.
@example
import { Home } from "lucide-react";
<Icon icon={Home} />`},size:{required:!1,tsType:{name:"union",raw:"keyof typeof sizes",elements:[{name:"literal",value:"sm"},{name:"literal",value:"md"},{name:"literal",value:"lg"},{name:"literal",value:"xl"}]},description:'Size preset for the icon.\n- `sm`: 16px - For inline text, badges, dense UI\n- `md`: 20px - Default, balanced for most contexts\n- `lg`: 24px - For prominent actions, headers\n- `xl`: 32px - For empty states, feature highlights\n@default "md"',defaultValue:{value:'"md"',computed:!1}},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the icon. When provided, the icon becomes
visible to screen readers with this label.
If omitted, the icon is hidden from assistive technology (aria-hidden).`},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes to apply to the icon."}},composes:["Omit"]};const A={title:"Primitives/Icon",component:n,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"},docs:{description:{component:"Icon wrapper with accessibility and size presets. Icons are decorative (aria-hidden) by default. Provide a `label` prop for screen reader visibility."}}},argTypes:{icon:{control:!1,description:"Lucide icon component to render"},size:{control:"select",options:["sm","md","lg","xl"],description:"Size preset"},label:{control:"text",description:"Accessible label (makes icon visible to screen readers)"}}},a={args:{icon:s,size:"md"}},r={args:{icon:s},render:()=>e.jsxs("div",{className:"flex items-end gap-4",children:[e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(n,{icon:s,size:"sm"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"sm (16px)"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(n,{icon:s,size:"md"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"md (20px)"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(n,{icon:s,size:"lg"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"lg (24px)"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(n,{icon:s,size:"xl"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"xl (32px)"})]})]})},o={args:{icon:p,size:"lg",label:"Waarschuwing",className:"text-warning"},parameters:{docs:{description:{story:"When a `label` is provided, the icon becomes accessible to screen readers with role='img' and aria-label."}}}},c={args:{icon:s},render:()=>e.jsx("div",{className:"flex flex-wrap gap-6",children:[{icon:s,name:"Home"},{icon:f,name:"Settings"},{icon:k,name:"User"},{icon:g,name:"Bell"},{icon:b,name:"Search"},{icon:u,name:"Check"},{icon:x,name:"X"},{icon:p,name:"AlertTriangle"}].map(({icon:m,name:l})=>e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx("div",{className:"p-3 border rounded-md",children:e.jsx(n,{icon:m,size:"lg"})}),e.jsx("span",{className:"text-xs text-muted-foreground",children:l})]},l))})},i={args:{icon:s},render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(n,{icon:u,size:"lg",className:"text-success"}),e.jsx(n,{icon:p,size:"lg",className:"text-warning"}),e.jsx(n,{icon:x,size:"lg",className:"text-danger"}),e.jsx(n,{icon:g,size:"lg",className:"text-info"}),e.jsx(n,{icon:s,size:"lg",className:"text-primary"}),e.jsx(n,{icon:f,size:"lg",className:"text-muted-foreground"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Home,
    size: "md"
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Home
  },
  render: () => <div className="flex items-end gap-4">\r
      <div className="flex flex-col items-center gap-2">\r
        <Icon icon={Home} size="sm" />\r
        <span className="text-xs text-muted-foreground">sm (16px)</span>\r
      </div>\r
      <div className="flex flex-col items-center gap-2">\r
        <Icon icon={Home} size="md" />\r
        <span className="text-xs text-muted-foreground">md (20px)</span>\r
      </div>\r
      <div className="flex flex-col items-center gap-2">\r
        <Icon icon={Home} size="lg" />\r
        <span className="text-xs text-muted-foreground">lg (24px)</span>\r
      </div>\r
      <div className="flex flex-col items-center gap-2">\r
        <Icon icon={Home} size="xl" />\r
        <span className="text-xs text-muted-foreground">xl (32px)</span>\r
      </div>\r
    </div>
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    icon: AlertTriangle,
    size: "lg",
    label: "Waarschuwing",
    className: "text-warning"
  },
  parameters: {
    docs: {
      description: {
        story: "When a \`label\` is provided, the icon becomes accessible to screen readers with role='img' and aria-label."
      }
    }
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Home
  },
  render: () => <div className="flex flex-wrap gap-6">\r
      {[{
      icon: Home,
      name: "Home"
    }, {
      icon: Settings,
      name: "Settings"
    }, {
      icon: User,
      name: "User"
    }, {
      icon: Bell,
      name: "Bell"
    }, {
      icon: Search,
      name: "Search"
    }, {
      icon: Check,
      name: "Check"
    }, {
      icon: X,
      name: "X"
    }, {
      icon: AlertTriangle,
      name: "AlertTriangle"
    }].map(({
      icon,
      name
    }) => <div key={name} className="flex flex-col items-center gap-2">\r
          <div className="p-3 border rounded-md">\r
            <Icon icon={icon} size="lg" />\r
          </div>\r
          <span className="text-xs text-muted-foreground">{name}</span>\r
        </div>)}\r
    </div>
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Home
  },
  render: () => <div className="flex items-center gap-4">\r
      <Icon icon={Check} size="lg" className="text-success" />\r
      <Icon icon={AlertTriangle} size="lg" className="text-warning" />\r
      <Icon icon={X} size="lg" className="text-danger" />\r
      <Icon icon={Bell} size="lg" className="text-info" />\r
      <Icon icon={Home} size="lg" className="text-primary" />\r
      <Icon icon={Settings} size="lg" className="text-muted-foreground" />\r
    </div>
}`,...i.parameters?.docs?.source}}};const _=["Default","Sizes","WithLabel","CommonIcons","ColorVariants"],B=Object.freeze(Object.defineProperty({__proto__:null,ColorVariants:i,CommonIcons:c,Default:a,Sizes:r,WithLabel:o,__namedExportsOrder:_,default:A},Symbol.toStringTag,{value:"Module"}));export{c as C,a as D,B as I,o as W};
