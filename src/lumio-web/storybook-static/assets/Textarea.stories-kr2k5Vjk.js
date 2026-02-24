import{j as t}from"./jsx-runtime-D4KrBPkj.js";import{r as l}from"./iframe-BmexDAhZ.js";import{c}from"./utils-BQHNewu7.js";import{L as d}from"./label-DmNWg_6T.js";import"./preload-helper-PPVm8Dsz.js";const o=l.forwardRef(({className:s,...n},i)=>t.jsx("textarea",{className:c("flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",s),ref:i,...n}));o.displayName="Textarea";o.__docgenInfo={description:`Multi-line text input component with consistent styling.

@example
// Basic usage
<Textarea placeholder="Enter your message..." />

@example
// Controlled with custom rows
<Textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={6}
/>

@example
// Disabled state
<Textarea disabled value="Cannot edit this content" />`,methods:[],displayName:"Textarea"};const b={title:"Primitives/Textarea",component:o,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}},argTypes:{disabled:{control:"boolean"},placeholder:{control:"text"},rows:{control:"number"}}},e={args:{placeholder:"Schrijf hier uw notitie..."}},r={render:()=>t.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[t.jsx(d,{htmlFor:"notitie",children:"Notitie"}),t.jsx(o,{id:"notitie",placeholder:"Voeg een notitie toe...",rows:4})]})},a={args:{disabled:!0,placeholder:"Uitgeschakeld",value:"Kan niet bewerken"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Schrijf hier uw notitie..."
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
      <Label htmlFor="notitie">Notitie</Label>\r
      <Textarea id="notitie" placeholder="Voeg een notitie toe..." rows={4} />\r
    </div>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Uitgeschakeld",
    value: "Kan niet bewerken"
  }
}`,...a.parameters?.docs?.source}}};const h=["Default","WithLabel","Disabled"];export{e as Default,a as Disabled,r as WithLabel,h as __namedExportsOrder,b as default};
