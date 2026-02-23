import{j as o}from"./jsx-runtime-Cfjfh6m4.js";import{r as l}from"./iframe-BZkGcvi5.js";import{c as d}from"./utils-BQHNewu7.js";import{L as c}from"./label-Bz9iGEJ6.js";import"./preload-helper-PPVm8Dsz.js";const t=l.forwardRef(({className:s,...i},n)=>o.jsx("textarea",{className:d("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",s),ref:n,...i}));t.displayName="Textarea";t.__docgenInfo={description:"",methods:[],displayName:"Textarea"};const f={title:"Primitives/Textarea",component:t,tags:["autodocs"],argTypes:{disabled:{control:"boolean"},placeholder:{control:"text"},rows:{control:"number"}}},e={args:{placeholder:"Schrijf hier uw notitie..."}},r={render:()=>o.jsxs("div",{className:"grid w-full max-w-sm gap-1.5",children:[o.jsx(c,{htmlFor:"notitie",children:"Notitie"}),o.jsx(t,{id:"notitie",placeholder:"Voeg een notitie toe...",rows:4})]})},a={args:{disabled:!0,placeholder:"Uitgeschakeld",value:"Kan niet bewerken"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const x=["Default","WithLabel","Disabled"];export{e as Default,a as Disabled,r as WithLabel,x as __namedExportsOrder,f as default};
