import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{c as p}from"./utils-BQHNewu7.js";import{c as m}from"./index-LHNt3CwB.js";import{S as g}from"./shield-DL8sdY7P.js";import{c as i}from"./createLucideIcon-sem_sh0Z.js";import{S}from"./shield-alert-DpzB0IX5.js";import"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";const b=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],w=i("shield-check",b);const k=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m14.5 9.5-5 5",key:"17q4r4"}],["path",{d:"m9.5 9.5 5 5",key:"18nt4w"}]],x=i("shield-x",k),h=m("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",{variants:{status:{secure:"bg-success-100 text-success",warning:"bg-warning-100 text-warning",critical:"bg-danger-100 text-danger",unknown:"bg-muted text-muted-foreground"}},defaultVariants:{status:"unknown"}}),f={secure:w,warning:S,critical:x,unknown:g};function a({status:o="unknown",label:l,className:u}){const d=f[o??"unknown"];return e.jsxs("span",{className:p(h({status:o}),u),children:[e.jsx(d,{className:"h-3.5 w-3.5","aria-hidden":"true"}),l]})}a.__docgenInfo={description:"",methods:[],displayName:"SecurityStatusIndicator",props:{label:{required:!0,tsType:{name:"string"},description:"Text label to display"},className:{required:!1,tsType:{name:"string"},description:"Additional className"},status:{defaultValue:{value:'"unknown"',computed:!1},required:!1}},composes:["VariantProps"]};const A={title:"Security/SecurityStatusIndicator",component:a,tags:["autodocs"],argTypes:{status:{control:"select",options:["secure","warning","critical","unknown"]},label:{control:"text"}}},s={args:{status:"secure",label:"Database versleuteld"}},t={args:{status:"warning",label:"Zwak wachtwoord"}},r={args:{status:"critical",label:"Sessie verlopen"}},n={args:{status:"unknown",label:"Status onbekend"}},c={args:{status:"secure",label:"Overzicht"},render:()=>e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsx(a,{status:"secure",label:"Versleuteld"}),e.jsx(a,{status:"warning",label:"Aandacht nodig"}),e.jsx(a,{status:"critical",label:"Kritiek"}),e.jsx(a,{status:"unknown",label:"Onbekend"})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: "secure",
    label: "Database versleuteld"
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: "warning",
    label: "Zwak wachtwoord"
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    status: "critical",
    label: "Sessie verlopen"
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    status: "unknown",
    label: "Status onbekend"
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    status: "secure",
    label: "Overzicht"
  },
  render: () => <div className="flex flex-wrap gap-3">\r
      <SecurityStatusIndicator status="secure" label="Versleuteld" />\r
      <SecurityStatusIndicator status="warning" label="Aandacht nodig" />\r
      <SecurityStatusIndicator status="critical" label="Kritiek" />\r
      <SecurityStatusIndicator status="unknown" label="Onbekend" />\r
    </div>
}`,...c.parameters?.docs?.source}}};const z=["Secure","Warning","Critical","Unknown","AllStatuses"];export{c as AllStatuses,r as Critical,s as Secure,n as Unknown,t as Warning,z as __namedExportsOrder,A as default};
