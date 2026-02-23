import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{c as t}from"./utils-BQHNewu7.js";import{r as d}from"./iframe-BZkGcvi5.js";import{B as C}from"./button-6i_qtU0N.js";import"./preload-helper-PPVm8Dsz.js";import"./index-LHNt3CwB.js";const n=d.forwardRef(({className:r,...a},s)=>e.jsx("div",{ref:s,className:t("rounded-lg border border-border bg-card text-card-foreground shadow-sm",r),...a}));n.displayName="Card";const m=d.forwardRef(({className:r,...a},s)=>e.jsx("div",{ref:s,className:t("flex flex-col space-y-1.5 p-6",r),...a}));m.displayName="CardHeader";const p=d.forwardRef(({className:r,...a},s)=>e.jsx("h3",{ref:s,className:t("text-2xl font-semibold leading-none tracking-tight",r),...a}));p.displayName="CardTitle";const x=d.forwardRef(({className:r,...a},s)=>e.jsx("p",{ref:s,className:t("text-sm text-muted-foreground",r),...a}));x.displayName="CardDescription";const o=d.forwardRef(({className:r,...a},s)=>e.jsx("div",{ref:s,className:t("p-6 pt-0",r),...a}));o.displayName="CardContent";n.__docgenInfo={description:"",methods:[],displayName:"Card"};m.__docgenInfo={description:"",methods:[],displayName:"CardHeader"};p.__docgenInfo={description:"",methods:[],displayName:"CardTitle"};x.__docgenInfo={description:"",methods:[],displayName:"CardDescription"};o.__docgenInfo={description:"",methods:[],displayName:"CardContent"};const w={title:"Primitives/Card",component:n,tags:["autodocs"]},i={render:()=>e.jsxs(n,{className:"w-[350px]",children:[e.jsxs(m,{children:[e.jsx(p,{children:"Kaart titel"}),e.jsx(x,{children:"Beschrijving van de kaart."})]}),e.jsx(o,{children:e.jsx("p",{children:"Kaart inhoud hier."})})]})},c={render:()=>e.jsxs(n,{className:"w-[350px]",children:[e.jsxs(m,{children:[e.jsx(p,{children:"Instellingen"}),e.jsx(x,{children:"Pas uw voorkeuren aan."})]}),e.jsxs(o,{className:"flex flex-col gap-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Uw huidige instellingen worden automatisch opgeslagen."}),e.jsx(C,{className:"w-fit",children:"Opslaan"})]})]})},l={render:()=>e.jsx(n,{className:"w-[350px]",children:e.jsx(o,{className:"pt-6",children:e.jsx("p",{className:"text-sm",children:"Een eenvoudige kaart zonder header."})})})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardHeader>\r
        <CardTitle>Kaart titel</CardTitle>\r
        <CardDescription>Beschrijving van de kaart.</CardDescription>\r
      </CardHeader>\r
      <CardContent>\r
        <p>Kaart inhoud hier.</p>\r
      </CardContent>\r
    </Card>
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">\r
      <CardContent className="pt-6">\r
        <p className="text-sm">Een eenvoudige kaart zonder header.</p>\r
      </CardContent>\r
    </Card>
}`,...l.parameters?.docs?.source}}};const v=["Default","WithAction","Minimal"];export{i as Default,l as Minimal,c as WithAction,v as __namedExportsOrder,w as default};
