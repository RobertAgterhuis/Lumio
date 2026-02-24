import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{r as d}from"./iframe-BmexDAhZ.js";import{c as C}from"./utils-BQHNewu7.js";function y({value:r,onValueChange:t,children:a,className:n}){const c=d.useId();return e.jsx("div",{className:n,"data-value":r,"data-onvaluechange":void 0,children:d.Children.map(a,g=>d.isValidElement(g)?d.cloneElement(g,{_activeValue:r,_onValueChange:t,_idPrefix:c}):g)})}function w({className:r,children:t,_activeValue:a,_onValueChange:n,_idPrefix:c,...g}){const v=d.useRef(null),k=l=>{const j=v.current;if(!j)return;const m=Array.from(j.querySelectorAll('[role="tab"]:not([disabled])')),B=m.findIndex(I=>I===document.activeElement);if(B===-1)return;let T=null;if(l.key==="ArrowRight"?T=(B+1)%m.length:l.key==="ArrowLeft"?T=(B-1+m.length)%m.length:l.key==="Home"?T=0:l.key==="End"&&(T=m.length-1),T!==null){l.preventDefault(),m[T].focus();const I=m[T].dataset.value;I&&n?.(I)}};return e.jsx("div",{ref:v,role:"tablist",className:C("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",r),onKeyDown:k,...g,children:d.Children.map(t,l=>d.isValidElement(l)?d.cloneElement(l,{_activeValue:a,_onValueChange:n,_idPrefix:c}):l)})}function i({className:r,value:t,_activeValue:a,_onValueChange:n,_idPrefix:c,...g}){const v=a===t;return e.jsx("button",{role:"tab",id:c?`${c}-tab-${t}`:void 0,"aria-selected":v,"aria-controls":c?`${c}-panel-${t}`:void 0,tabIndex:v?0:-1,"data-value":t,className:C("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",v&&"bg-background text-foreground shadow-sm",r),onClick:()=>n?.(t),...g})}function o({className:r,value:t,_activeValue:a,_idPrefix:n,...c}){return a!==t?null:e.jsx("div",{role:"tabpanel",id:n?`${n}-panel-${t}`:void 0,"aria-labelledby":n?`${n}-tab-${t}`:void 0,tabIndex:0,className:C("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",r),...c})}y.__docgenInfo={description:`Accessible tabs component with keyboard navigation.
Supports arrow keys, Home, and End for tab navigation.

@example
const [tab, setTab] = useState("account");

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content...</TabsContent>
  <TabsContent value="settings">Settings content...</TabsContent>
</Tabs>`,methods:[],displayName:"Tabs",props:{value:{required:!0,tsType:{name:"string"},description:"Currently active tab value"},onValueChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:"Callback when active tab changes"},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};w.__docgenInfo={description:"",methods:[],displayName:"TabsList",props:{_activeValue:{required:!1,tsType:{name:"string"},description:""},_onValueChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},_idPrefix:{required:!1,tsType:{name:"string"},description:""}}};i.__docgenInfo={description:"",methods:[],displayName:"TabsTrigger",props:{value:{required:!0,tsType:{name:"string"},description:""},_activeValue:{required:!1,tsType:{name:"string"},description:""},_onValueChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},_idPrefix:{required:!1,tsType:{name:"string"},description:""}}};o.__docgenInfo={description:"",methods:[],displayName:"TabsContent",props:{value:{required:!0,tsType:{name:"string"},description:""},_activeValue:{required:!1,tsType:{name:"string"},description:""},_idPrefix:{required:!1,tsType:{name:"string"},description:""}}};const{expect:s,fn:E,userEvent:u,within:D,waitFor:b}=__STORYBOOK_MODULE_TEST__,N={title:"Primitives/Tabs",component:y,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}}},x={args:{value:"overzicht",onValueChange:()=>{},children:null},render:()=>e.jsxs(y,{value:"overzicht",onValueChange:()=>{},children:[e.jsxs(w,{children:[e.jsx(i,{value:"overzicht",children:"Overzicht"}),e.jsx(i,{value:"details",children:"Details"}),e.jsx(i,{value:"geschiedenis",children:"Geschiedenis"})]}),e.jsx(o,{value:"overzicht",children:e.jsx("p",{className:"p-4 text-sm text-muted-foreground",children:"Overzicht inhoud wordt hier getoond."})}),e.jsx(o,{value:"details",children:e.jsx("p",{className:"p-4 text-sm text-muted-foreground",children:"Details inhoud hier."})}),e.jsx(o,{value:"geschiedenis",children:e.jsx("p",{className:"p-4 text-sm text-muted-foreground",children:"Geschiedenis inhoud hier."})})]})},f={args:{value:"tab1",onValueChange:()=>{},children:null},render:()=>e.jsxs(y,{value:"tab1",onValueChange:()=>{},children:[e.jsxs(w,{children:[e.jsx(i,{value:"tab1",children:"Tab 1"}),e.jsx(i,{value:"tab2",children:"Tab 2"})]}),e.jsx(o,{value:"tab1",children:e.jsx("p",{className:"p-4 text-sm",children:"Eerste tab."})}),e.jsx(o,{value:"tab2",children:e.jsx("p",{className:"p-4 text-sm",children:"Tweede tab."})})]})},h={args:{value:"tab1",onValueChange:E(),children:null},render:function(){const[t,a]=d.useState("tab1");return e.jsxs(y,{value:t,onValueChange:a,children:[e.jsxs(w,{children:[e.jsx(i,{value:"tab1","data-testid":"tab1-trigger",children:"Overzicht"}),e.jsx(i,{value:"tab2","data-testid":"tab2-trigger",children:"Details"}),e.jsx(i,{value:"tab3","data-testid":"tab3-trigger",children:"Instellingen"})]}),e.jsx(o,{value:"tab1","data-testid":"tab1-content",children:e.jsx("p",{className:"p-4 text-sm",children:"Overzicht inhoud is zichtbaar."})}),e.jsx(o,{value:"tab2","data-testid":"tab2-content",children:e.jsx("p",{className:"p-4 text-sm",children:"Details inhoud is zichtbaar."})}),e.jsx(o,{value:"tab3","data-testid":"tab3-content",children:e.jsx("p",{className:"p-4 text-sm",children:"Instellingen inhoud is zichtbaar."})})]})},play:async({canvasElement:r})=>{const t=D(r);s(t.getByTestId("tab1-content")).toBeInTheDocument(),await u.click(t.getByTestId("tab2-trigger")),await b(()=>{s(t.getByTestId("tab2-content")).toBeInTheDocument()}),s(t.queryByTestId("tab1-content")).not.toBeInTheDocument(),await u.click(t.getByTestId("tab3-trigger")),await b(()=>{s(t.getByTestId("tab3-content")).toBeInTheDocument()}),s(t.queryByTestId("tab2-content")).not.toBeInTheDocument(),await u.click(t.getByTestId("tab1-trigger")),await b(()=>{s(t.getByTestId("tab1-content")).toBeInTheDocument()})}},p={args:{value:"tab1",onValueChange:E(),children:null},render:function(){const[t,a]=d.useState("tab1");return e.jsxs(y,{value:t,onValueChange:a,children:[e.jsxs(w,{children:[e.jsx(i,{value:"tab1","data-testid":"tab1-trigger",children:"Eerste"}),e.jsx(i,{value:"tab2","data-testid":"tab2-trigger",children:"Tweede"}),e.jsx(i,{value:"tab3","data-testid":"tab3-trigger",children:"Derde"})]}),e.jsx(o,{value:"tab1","data-testid":"tab1-content",children:e.jsx("p",{className:"p-4 text-sm",children:"Eerste tab content."})}),e.jsx(o,{value:"tab2","data-testid":"tab2-content",children:e.jsx("p",{className:"p-4 text-sm",children:"Tweede tab content."})}),e.jsx(o,{value:"tab3","data-testid":"tab3-content",children:e.jsx("p",{className:"p-4 text-sm",children:"Derde tab content."})})]})},play:async({canvasElement:r})=>{const t=D(r),a=t.getByTestId("tab1-trigger");a.focus(),s(document.activeElement).toBe(a),await u.keyboard("{ArrowRight}"),await b(()=>{const n=t.getByTestId("tab2-trigger");s(document.activeElement).toBe(n),s(t.getByTestId("tab2-content")).toBeInTheDocument()}),await u.keyboard("{ArrowRight}"),await b(()=>{const n=t.getByTestId("tab3-trigger");s(document.activeElement).toBe(n),s(t.getByTestId("tab3-content")).toBeInTheDocument()}),await u.keyboard("{ArrowRight}"),await b(()=>{s(document.activeElement).toBe(a),s(t.getByTestId("tab1-content")).toBeInTheDocument()}),await u.keyboard("{ArrowLeft}"),await b(()=>{const n=t.getByTestId("tab3-trigger");s(document.activeElement).toBe(n)}),await u.keyboard("{Home}"),await b(()=>{s(document.activeElement).toBe(a)}),await u.keyboard("{End}"),await b(()=>{const n=t.getByTestId("tab3-trigger");s(document.activeElement).toBe(n)})}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: "tab1",
    onValueChange: fn(),
    children: null
  },
  render: function Render() {
    const [value, setValue] = useState("tab1");
    return <Tabs value={value} onValueChange={setValue}>\r
        <TabsList>\r
          <TabsTrigger value="tab1" data-testid="tab1-trigger">\r
            Overzicht\r
          </TabsTrigger>\r
          <TabsTrigger value="tab2" data-testid="tab2-trigger">\r
            Details\r
          </TabsTrigger>\r
          <TabsTrigger value="tab3" data-testid="tab3-trigger">\r
            Instellingen\r
          </TabsTrigger>\r
        </TabsList>\r
        <TabsContent value="tab1" data-testid="tab1-content">\r
          <p className="p-4 text-sm">Overzicht inhoud is zichtbaar.</p>\r
        </TabsContent>\r
        <TabsContent value="tab2" data-testid="tab2-content">\r
          <p className="p-4 text-sm">Details inhoud is zichtbaar.</p>\r
        </TabsContent>\r
        <TabsContent value="tab3" data-testid="tab3-content">\r
          <p className="p-4 text-sm">Instellingen inhoud is zichtbaar.</p>\r
        </TabsContent>\r
      </Tabs>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Initially tab1 should be active
    expect(canvas.getByTestId("tab1-content")).toBeInTheDocument();

    // Click on tab2
    await userEvent.click(canvas.getByTestId("tab2-trigger"));

    // tab2 content should be visible
    await waitFor(() => {
      expect(canvas.getByTestId("tab2-content")).toBeInTheDocument();
    });

    // tab1 content should be hidden
    expect(canvas.queryByTestId("tab1-content")).not.toBeInTheDocument();

    // Click on tab3
    await userEvent.click(canvas.getByTestId("tab3-trigger"));

    // tab3 content should be visible
    await waitFor(() => {
      expect(canvas.getByTestId("tab3-content")).toBeInTheDocument();
    });

    // Previous tabs content should be hidden
    expect(canvas.queryByTestId("tab2-content")).not.toBeInTheDocument();

    // Click back to tab1
    await userEvent.click(canvas.getByTestId("tab1-trigger"));
    await waitFor(() => {
      expect(canvas.getByTestId("tab1-content")).toBeInTheDocument();
    });
  }
}`,...h.parameters?.docs?.source},description:{story:"Interactive tabs with play function test",...h.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: "tab1",
    onValueChange: fn(),
    children: null
  },
  render: function Render() {
    const [value, setValue] = useState("tab1");
    return <Tabs value={value} onValueChange={setValue}>\r
        <TabsList>\r
          <TabsTrigger value="tab1" data-testid="tab1-trigger">\r
            Eerste\r
          </TabsTrigger>\r
          <TabsTrigger value="tab2" data-testid="tab2-trigger">\r
            Tweede\r
          </TabsTrigger>\r
          <TabsTrigger value="tab3" data-testid="tab3-trigger">\r
            Derde\r
          </TabsTrigger>\r
        </TabsList>\r
        <TabsContent value="tab1" data-testid="tab1-content">\r
          <p className="p-4 text-sm">Eerste tab content.</p>\r
        </TabsContent>\r
        <TabsContent value="tab2" data-testid="tab2-content">\r
          <p className="p-4 text-sm">Tweede tab content.</p>\r
        </TabsContent>\r
        <TabsContent value="tab3" data-testid="tab3-content">\r
          <p className="p-4 text-sm">Derde tab content.</p>\r
        </TabsContent>\r
      </Tabs>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Focus the first tab
    const tab1 = canvas.getByTestId("tab1-trigger");
    tab1.focus();
    expect(document.activeElement).toBe(tab1);

    // Press ArrowRight to move to tab2
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      const tab2 = canvas.getByTestId("tab2-trigger");
      expect(document.activeElement).toBe(tab2);
      expect(canvas.getByTestId("tab2-content")).toBeInTheDocument();
    });

    // Press ArrowRight again to move to tab3
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      const tab3 = canvas.getByTestId("tab3-trigger");
      expect(document.activeElement).toBe(tab3);
      expect(canvas.getByTestId("tab3-content")).toBeInTheDocument();
    });

    // Press ArrowRight again - should wrap to tab1
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(document.activeElement).toBe(tab1);
      expect(canvas.getByTestId("tab1-content")).toBeInTheDocument();
    });

    // Press ArrowLeft - should go to tab3
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => {
      const tab3 = canvas.getByTestId("tab3-trigger");
      expect(document.activeElement).toBe(tab3);
    });

    // Press Home - should go to tab1
    await userEvent.keyboard("{Home}");
    await waitFor(() => {
      expect(document.activeElement).toBe(tab1);
    });

    // Press End - should go to tab3
    await userEvent.keyboard("{End}");
    await waitFor(() => {
      const tab3 = canvas.getByTestId("tab3-trigger");
      expect(document.activeElement).toBe(tab3);
    });
  }
}`,...p.parameters?.docs?.source},description:{story:"Keyboard navigation test - Arrow keys should navigate between tabs",...p.parameters?.docs?.description}}};const V=["Default","TwoTabs","Interactive","WithKeyboardNav"],R=Object.freeze(Object.defineProperty({__proto__:null,Default:x,Interactive:h,TwoTabs:f,WithKeyboardNav:p,__namedExportsOrder:V,default:N},Symbol.toStringTag,{value:"Module"}));export{x as D,R as T,p as W};
