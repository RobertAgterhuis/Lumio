import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{I as l}from"./input-DocKjuCE.js";import{L as d}from"./label-DmNWg_6T.js";const n={title:"Primitives/Input",component:l,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}},argTypes:{type:{control:"select",options:["text","email","password","number","search","tel","url"]},disabled:{control:"boolean"},placeholder:{control:"text"}}},r={args:{placeholder:"Typ hier..."}},a={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[e.jsx(d,{htmlFor:"email",children:"E-mail"}),e.jsx(l,{type:"email",id:"email",placeholder:"naam@voorbeeld.nl"})]})},s={args:{type:"password",placeholder:"Wachtwoord"}},t={args:{disabled:!0,placeholder:"Uitgeschakeld",value:"Kan niet bewerken"}},o={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[e.jsx(d,{htmlFor:"error-input",children:"Verplicht veld"}),e.jsx(l,{id:"error-input",className:"border-danger",placeholder:"Dit veld is verplicht"}),e.jsx("p",{className:"text-sm text-danger",children:"Dit veld is verplicht."})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Typ hier..."
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
      <Label htmlFor="email">E-mail</Label>\r
      <Input type="email" id="email" placeholder="naam@voorbeeld.nl" />\r
    </div>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    type: "password",
    placeholder: "Wachtwoord"
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Uitgeschakeld",
    value: "Kan niet bewerken"
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
      <Label htmlFor="error-input">Verplicht veld</Label>\r
      <Input id="error-input" className="border-danger" placeholder="Dit veld is verplicht" />\r
      <p className="text-sm text-danger">Dit veld is verplicht.</p>\r
    </div>
}`,...o.parameters?.docs?.source}}};const c=["Default","WithLabel","Password","Disabled","WithError"],u=Object.freeze(Object.defineProperty({__proto__:null,Default:r,Disabled:t,Password:s,WithError:o,WithLabel:a,__namedExportsOrder:c,default:n},Symbol.toStringTag,{value:"Module"}));export{r as D,u as I,t as a};
