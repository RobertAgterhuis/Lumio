import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{r as d}from"./iframe-BmexDAhZ.js";import{c as p}from"./utils-BQHNewu7.js";import{L as c}from"./label-DmNWg_6T.js";import"./preload-helper-PPVm8Dsz.js";const n=d.forwardRef(({className:l,children:r,...i},s)=>e.jsx("select",{className:p("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",l),ref:s,...i,children:r}));n.displayName="Select";n.__docgenInfo={description:`Native select dropdown component with consistent styling.

@example
// Basic usage
<Select value={country} onChange={(e) => setCountry(e.target.value)}>
  <option value="">Select a country</option>
  <option value="nl">Netherlands</option>
  <option value="be">Belgium</option>
</Select>

@example
// Disabled state
<Select disabled>
  <option>Cannot change</option>
</Select>`,methods:[],displayName:"Select"};const g={title:"Primitives/Select",component:n,tags:["autodocs"],parameters:{status:{type:"stable"},governance:{maturity:"stable",a11yLevel:"AA"}},argTypes:{disabled:{control:"boolean"}}},t={render:()=>e.jsxs(n,{defaultValue:"",children:[e.jsx("option",{value:"",disabled:!0,children:"Kies een optie..."}),e.jsx("option",{value:"optie1",children:"Optie 1"}),e.jsx("option",{value:"optie2",children:"Optie 2"}),e.jsx("option",{value:"optie3",children:"Optie 3"})]})},o={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[e.jsx(c,{htmlFor:"taal",children:"Taal"}),e.jsxs(n,{id:"taal",defaultValue:"nl",children:[e.jsx("option",{value:"nl",children:"Nederlands"}),e.jsx("option",{value:"en",children:"English"}),e.jsx("option",{value:"de",children:"Deutsch"})]})]})},a={render:()=>e.jsx(n,{disabled:!0,defaultValue:"nl",children:e.jsx("option",{value:"nl",children:"Nederlands"})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Select defaultValue="">\r
      <option value="" disabled>\r
        Kies een optie...\r
      </option>\r
      <option value="optie1">Optie 1</option>\r
      <option value="optie2">Optie 2</option>\r
      <option value="optie3">Optie 3</option>\r
    </Select>
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
      <Label htmlFor="taal">Taal</Label>\r
      <Select id="taal" defaultValue="nl">\r
        <option value="nl">Nederlands</option>\r
        <option value="en">English</option>\r
        <option value="de">Deutsch</option>\r
      </Select>\r
    </div>
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Select disabled defaultValue="nl">\r
      <option value="nl">Nederlands</option>\r
    </Select>
}`,...a.parameters?.docs?.source}}};const h=["Default","WithLabel","Disabled"];export{t as Default,a as Disabled,o as WithLabel,h as __namedExportsOrder,g as default};
