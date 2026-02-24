import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{C as s,a as d,b as o,c as i,d as t}from"./card-Bh23J6St.js";import{B as c}from"./button-Fj27Zx3k.js";const l={title:"Primitives/Card",component:s,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}}},r={render:()=>e.jsxs(s,{className:"w-[350px]",children:[e.jsxs(d,{children:[e.jsx(o,{children:"Kaart titel"}),e.jsx(i,{children:"Beschrijving van de kaart."})]}),e.jsx(t,{children:e.jsx("p",{children:"Kaart inhoud hier."})})]})},a={render:()=>e.jsxs(s,{className:"w-[350px]",children:[e.jsxs(d,{children:[e.jsx(o,{children:"Instellingen"}),e.jsx(i,{children:"Pas uw voorkeuren aan."})]}),e.jsxs(t,{className:"flex flex-col gap-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Uw huidige instellingen worden automatisch opgeslagen."}),e.jsx(c,{className:"w-fit",children:"Opslaan"})]})]})},n={render:()=>e.jsx(s,{className:"w-[350px]",children:e.jsx(t,{className:"pt-6",children:e.jsx("p",{className:"text-sm",children:"Een eenvoudige kaart zonder header."})})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardHeader>\r
        <CardTitle>Kaart titel</CardTitle>\r
        <CardDescription>Beschrijving van de kaart.</CardDescription>\r
      </CardHeader>\r
      <CardContent>\r
        <p>Kaart inhoud hier.</p>\r
      </CardContent>\r
    </Card>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardHeader>\r
        <CardTitle>Instellingen</CardTitle>\r
        <CardDescription>Pas uw voorkeuren aan.</CardDescription>\r
      </CardHeader>\r
      <CardContent className="flex flex-col gap-4">\r
        <p className="text-sm text-muted-foreground">\r
          Uw huidige instellingen worden automatisch opgeslagen.\r
        </p>\r
        <Button className="w-fit">Opslaan</Button>\r
      </CardContent>\r
    </Card>
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardContent className="pt-6">\r
        <p className="text-sm">Een eenvoudige kaart zonder header.</p>\r
      </CardContent>\r
    </Card>
}`,...n.parameters?.docs?.source}}};const m=["Default","WithAction","Minimal"],x=Object.freeze(Object.defineProperty({__proto__:null,Default:r,Minimal:n,WithAction:a,__namedExportsOrder:m,default:l},Symbol.toStringTag,{value:"Module"}));export{x as C,r as D,a as W};
