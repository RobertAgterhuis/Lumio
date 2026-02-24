import{j as r}from"./jsx-runtime-D4KrBPkj.js";import{c as n}from"./utils-BQHNewu7.js";import{r as t}from"./iframe-BmexDAhZ.js";const o=t.forwardRef(({className:e,...a},d)=>r.jsx("div",{ref:d,className:n("rounded-lg border border-border bg-card text-card-foreground shadow-sm",e),...a}));o.displayName="Card";const s=t.forwardRef(({className:e,...a},d)=>r.jsx("div",{ref:d,className:n("flex flex-col space-y-1.5 p-6",e),...a}));s.displayName="CardHeader";const i=t.forwardRef(({className:e,...a},d)=>r.jsx("h3",{ref:d,className:n("text-2xl font-semibold leading-none tracking-tight",e),...a}));i.displayName="CardTitle";const c=t.forwardRef(({className:e,...a},d)=>r.jsx("p",{ref:d,className:n("text-sm text-muted-foreground",e),...a}));c.displayName="CardDescription";const p=t.forwardRef(({className:e,...a},d)=>r.jsx("div",{ref:d,className:n("p-6 pt-0",e),...a}));p.displayName="CardContent";o.__docgenInfo={description:`Card container component with rounded borders and shadow.

@example
<Card>
  <CardHeader>
    <CardTitle>Account Settings</CardTitle>
    <CardDescription>Manage your account preferences.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>`,methods:[],displayName:"Card"};s.__docgenInfo={description:"Header section of a Card. Contains title and description.",methods:[],displayName:"CardHeader"};i.__docgenInfo={description:"Title element within CardHeader. Renders as an h3.",methods:[],displayName:"CardTitle"};c.__docgenInfo={description:"Muted description text within CardHeader.",methods:[],displayName:"CardDescription"};p.__docgenInfo={description:"Main content area of a Card with padding.",methods:[],displayName:"CardContent"};export{o as C,s as a,i as b,c,p as d};
