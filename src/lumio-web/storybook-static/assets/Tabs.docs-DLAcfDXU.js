import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as a}from"./index-FZkeZIx-.js";import{M as r,C as t}from"./blocks-BnPCfxAb.js";import{T as o,D as l,W as c}from"./Tabs.stories-CmddO8Gk.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";function i(s){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...a(),...s.components};return n.jsxs(n.Fragment,{children:[`
`,`
`,n.jsx(r,{of:o}),`
`,n.jsx(e.h1,{id:"tabs",children:"Tabs"}),`
`,n.jsx(e.p,{children:"Tabs organize content into separate views where only one view is visible at a time."}),`
`,n.jsx(t,{of:l}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"anatomy",children:"Anatomy"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`const [tab, setTab] = useState("account");

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Account content...
  </TabsContent>
  <TabsContent value="settings">
    Settings content...
  </TabsContent>
</Tabs>
`})}),`
`,n.jsxs(e.p,{children:[`| Part | Purpose |
|------|---------|
| `,n.jsx(e.code,{children:"Tabs"}),` | Root container, manages state |
| `,n.jsx(e.code,{children:"TabsList"}),` | Container for tab buttons |
| `,n.jsx(e.code,{children:"TabsTrigger"}),` | Individual tab button |
| `,n.jsx(e.code,{children:"TabsContent"})," | Panel content for each tab |"]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"accessibility",children:"Accessibility"}),`
`,n.jsx(e.p,{children:"The Tabs component provides full keyboard navigation:"}),`
`,n.jsxs(e.p,{children:[`| Key | Action |
|-----|--------|
| `,n.jsx(e.code,{children:"→"})," / ",n.jsx(e.code,{children:"←"}),` | Navigate between tabs |
| `,n.jsx(e.code,{children:"Home"}),` | Go to first tab |
| `,n.jsx(e.code,{children:"End"}),` | Go to last tab |
| `,n.jsx(e.code,{children:"Tab"})," | Move focus to tab panel |"]}),`
`,n.jsx(e.p,{children:"ARIA attributes are handled automatically:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:'role="tablist"'})," on TabsList"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:'role="tab"'})," on TabsTrigger"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:'role="tabpanel"'})," on TabsContent"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"aria-selected"})," and ",n.jsx(e.code,{children:"aria-controls"})," linkage"]}),`
`]}),`
`,n.jsx(t,{of:c}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"common-patterns",children:"Common Patterns"}),`
`,n.jsx(e.h3,{id:"settings-page",children:"Settings Page"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Tabs value={section} onValueChange={setSection}>
  <TabsList>
    <TabsTrigger value="profile">Profiel</TabsTrigger>
    <TabsTrigger value="security">Beveiliging</TabsTrigger>
    <TabsTrigger value="notifications">Notificaties</TabsTrigger>
  </TabsList>
  {/* Tab contents */}
</Tabs>
`})}),`
`,n.jsx(e.h3,{id:"disabled-tab",children:"Disabled Tab"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<TabsTrigger value="premium" disabled>
  Premium
</TabsTrigger>
`})}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,n.jsx(e.h3,{id:"do-",children:"Do ✓"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Use tabs for related content at the same hierarchy level"}),`
`,n.jsx(e.li,{children:"Keep tab labels short (1-2 words)"}),`
`,n.jsx(e.li,{children:"Maintain tab state in URL for deep linking when appropriate"}),`
`,n.jsx(e.li,{children:"Show the most important/common tab first"}),`
`]}),`
`,n.jsx(e.h3,{id:"dont-",children:"Don't ✗"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Don't use tabs for sequential workflows (use stepper/wizard)"}),`
`,n.jsx(e.li,{children:"Don't put more than 5-6 tabs in one TabsList"}),`
`,n.jsx(e.li,{children:"Don't use tabs for navigation between different pages"}),`
`,n.jsx(e.li,{children:"Don't nest tabs inside tabs"}),`
`]})]})}function u(s={}){const{wrapper:e}={...a(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(i,{...s})}):i(s)}export{u as default};
