import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{I as t}from"./input-BXBGUmDW.js";import{L as d}from"./label-Bz9iGEJ6.js";import"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";const h={title:"Primitives/Input",component:t,tags:["autodocs"],argTypes:{type:{control:"select",options:["text","email","password","number","search","tel","url"]},disabled:{control:"boolean"},placeholder:{control:"text"}}},r={args:{placeholder:"Typ hier..."}},a={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[e.jsx(d,{htmlFor:"email",children:"E-mail"}),e.jsx(t,{type:"email",id:"email",placeholder:"naam@voorbeeld.nl"})]})},s={args:{type:"password",placeholder:"Wachtwoord"}},l={args:{disabled:!0,placeholder:"Uitgeschakeld",value:"Kan niet bewerken"}},o={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[e.jsx(d,{htmlFor:"error-input",children:"Verplicht veld"}),e.jsx(t,{id:"error-input",className:"border-danger",placeholder:"Dit veld is verplicht"}),e.jsx("p",{className:"text-sm text-danger",children:"Dit veld is verplicht."})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Uitgeschakeld",
    value: "Kan niet bewerken"
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
      <Label htmlFor="error-input">Verplicht veld</Label>\r
      <Input id="error-input" className="border-danger" placeholder="Dit veld is verplicht" />\r
      <p className="text-sm text-danger">Dit veld is verplicht.</p>\r
    </div>
}`,...o.parameters?.docs?.source}}};const g=["Default","WithLabel","Password","Disabled","WithError"];export{r as Default,l as Disabled,s as Password,o as WithError,a as WithLabel,g as __namedExportsOrder,h as default};
