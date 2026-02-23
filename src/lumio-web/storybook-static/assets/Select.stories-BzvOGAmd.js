import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{r as d}from"./iframe-BZkGcvi5.js";import{c as p}from"./utils-BQHNewu7.js";import{L as c}from"./label-Bz9iGEJ6.js";import"./preload-helper-PPVm8Dsz.js";const o=d.forwardRef(({className:l,children:n,...i},s)=>e.jsx("select",{className:p("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",l),ref:s,...i,children:n}));o.displayName="Select";o.__docgenInfo={description:"",methods:[],displayName:"Select"};const x={title:"Primitives/Select",component:o,tags:["autodocs"],argTypes:{disabled:{control:"boolean"}}},r={render:()=>e.jsxs(o,{defaultValue:"",children:[e.jsx("option",{value:"",disabled:!0,children:"Kies een optie..."}),e.jsx("option",{value:"optie1",children:"Optie 1"}),e.jsx("option",{value:"optie2",children:"Optie 2"}),e.jsx("option",{value:"optie3",children:"Optie 3"})]})},a={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[e.jsx(c,{htmlFor:"taal",children:"Taal"}),e.jsxs(o,{id:"taal",defaultValue:"nl",children:[e.jsx("option",{value:"nl",children:"Nederlands"}),e.jsx("option",{value:"en",children:"English"}),e.jsx("option",{value:"de",children:"Deutsch"})]})]})},t={render:()=>e.jsx(o,{disabled:!0,defaultValue:"nl",children:e.jsx("option",{value:"nl",children:"Nederlands"})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Select defaultValue="">\r
      <option value="" disabled>\r
        Kies een optie...\r
      </option>\r
      <option value="optie1">Optie 1</option>\r
      <option value="optie2">Optie 2</option>\r
      <option value="optie3">Optie 3</option>\r
    </Select>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
      <Label htmlFor="taal">Taal</Label>\r
      <Select id="taal" defaultValue="nl">\r
        <option value="nl">Nederlands</option>\r
        <option value="en">English</option>\r
        <option value="de">Deutsch</option>\r
      </Select>\r
    </div>
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Select disabled defaultValue="nl">\r
      <option value="nl">Nederlands</option>\r
    </Select>
}`,...t.parameters?.docs?.source}}};const h=["Default","WithLabel","Disabled"];export{r as Default,t as Disabled,a as WithLabel,h as __namedExportsOrder,x as default};
