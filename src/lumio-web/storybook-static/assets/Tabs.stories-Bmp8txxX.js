import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{r as i}from"./iframe-BZkGcvi5.js";import{c as m}from"./utils-BQHNewu7.js";import"./preload-helper-PPVm8Dsz.js";function g({value:n,onValueChange:r,children:s,className:t}){return e.jsx("div",{className:t,"data-value":n,"data-onvaluechange":void 0,children:i.Children.map(s,a=>i.isValidElement(a)?i.cloneElement(a,{_activeValue:n,_onValueChange:r}):a)})}function p({className:n,children:r,_activeValue:s,_onValueChange:t,...a}){return e.jsx("div",{className:m("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",n),...a,children:i.Children.map(r,l=>i.isValidElement(l)?i.cloneElement(l,{_activeValue:s,_onValueChange:t}):l)})}function o({className:n,value:r,_activeValue:s,_onValueChange:t,...a}){const l=s===r;return e.jsx("button",{className:m("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",l&&"bg-background text-foreground shadow-sm",n),onClick:()=>t?.(r),...a})}function u({className:n,value:r,_activeValue:s,...t}){return s!==r?null:e.jsx("div",{className:m("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",n),...t})}g.__docgenInfo={description:"",methods:[],displayName:"Tabs",props:{value:{required:!0,tsType:{name:"string"},description:""},onValueChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};p.__docgenInfo={description:"",methods:[],displayName:"TabsList",props:{_activeValue:{required:!1,tsType:{name:"string"},description:""},_onValueChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""}}};o.__docgenInfo={description:"",methods:[],displayName:"TabsTrigger",props:{value:{required:!0,tsType:{name:"string"},description:""},_activeValue:{required:!1,tsType:{name:"string"},description:""},_onValueChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""}}};u.__docgenInfo={description:"",methods:[],displayName:"TabsContent",props:{value:{required:!0,tsType:{name:"string"},description:""},_activeValue:{required:!1,tsType:{name:"string"},description:""}}};const f={title:"Primitives/Tabs",component:g,tags:["autodocs"]},d={args:{value:"overzicht",onValueChange:()=>{},children:null},render:()=>e.jsxs(g,{value:"overzicht",onValueChange:()=>{},children:[e.jsxs(p,{children:[e.jsx(o,{value:"overzicht",children:"Overzicht"}),e.jsx(o,{value:"details",children:"Details"}),e.jsx(o,{value:"geschiedenis",children:"Geschiedenis"})]}),e.jsx(u,{value:"overzicht",children:e.jsx("p",{className:"p-4 text-sm text-muted-foreground",children:"Overzicht inhoud wordt hier getoond."})}),e.jsx(u,{value:"details",children:e.jsx("p",{className:"p-4 text-sm text-muted-foreground",children:"Details inhoud hier."})}),e.jsx(u,{value:"geschiedenis",children:e.jsx("p",{className:"p-4 text-sm text-muted-foreground",children:"Geschiedenis inhoud hier."})})]})},c={args:{value:"tab1",onValueChange:()=>{},children:null},render:()=>e.jsxs(g,{value:"tab1",onValueChange:()=>{},children:[e.jsxs(p,{children:[e.jsx(o,{value:"tab1",children:"Tab 1"}),e.jsx(o,{value:"tab2",children:"Tab 2"})]}),e.jsx(u,{value:"tab1",children:e.jsx("p",{className:"p-4 text-sm",children:"Eerste tab."})}),e.jsx(u,{value:"tab2",children:e.jsx("p",{className:"p-4 text-sm",children:"Tweede tab."})})]})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: "overzicht",
    onValueChange: () => {},
    children: null
  },
  render: () => <Tabs value="overzicht" onValueChange={() => {}}>\r
      <TabsList>\r
        <TabsTrigger value="overzicht">Overzicht</TabsTrigger>\r
        <TabsTrigger value="details">Details</TabsTrigger>\r
        <TabsTrigger value="geschiedenis">Geschiedenis</TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="overzicht">\r
        <p className="p-4 text-sm text-muted-foreground">\r
          Overzicht inhoud wordt hier getoond.\r
        </p>\r
      </TabsContent>\r
      <TabsContent value="details">\r
        <p className="p-4 text-sm text-muted-foreground">\r
          Details inhoud hier.\r
        </p>\r
      </TabsContent>\r
      <TabsContent value="geschiedenis">\r
        <p className="p-4 text-sm text-muted-foreground">\r
          Geschiedenis inhoud hier.\r
        </p>\r
      </TabsContent>\r
    </Tabs>
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: "tab1",
    onValueChange: () => {},
    children: null
  },
  render: () => <Tabs value="tab1" onValueChange={() => {}}>\r
      <TabsList>\r
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>\r
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>\r
      </TabsList>\r
      <TabsContent value="tab1">\r
        <p className="p-4 text-sm">Eerste tab.</p>\r
      </TabsContent>\r
      <TabsContent value="tab2">\r
        <p className="p-4 text-sm">Tweede tab.</p>\r
      </TabsContent>\r
    </Tabs>
}`,...c.parameters?.docs?.source}}};const x=["Default","TwoTabs"];export{d as Default,c as TwoTabs,x as __namedExportsOrder,f as default};
