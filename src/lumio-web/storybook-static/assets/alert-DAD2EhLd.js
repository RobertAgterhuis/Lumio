import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{c as a}from"./utils-BQHNewu7.js";import{c as u}from"./index-LHNt3CwB.js";import{r as i}from"./iframe-BmexDAhZ.js";import{S as x}from"./shield-C13dSADR.js";import{c as s}from"./createLucideIcon-B_yB00Wp.js";import{T as h}from"./triangle-alert-BVH98Qf5.js";const A=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],b=s("circle-check-big",A);const y=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],k=s("circle-x",y);const v=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],w=s("info",v),N=u("relative flex items-start gap-3 rounded-lg border p-4 text-sm transition-colors [&>svg]:shrink-0 [&>svg]:mt-0.5",{variants:{variant:{info:"border-info-100 bg-info-100/40 text-info [&>svg]:text-info dark:border-info-100 dark:bg-info-100/40 dark:text-info",success:"border-success-100 bg-success-100/40 text-success [&>svg]:text-success dark:border-success-100 dark:bg-success-100/40 dark:text-success",warning:"border-warning-100 bg-warning-100/40 text-warning [&>svg]:text-warning dark:border-warning-100 dark:bg-warning-100/40 dark:text-warning",danger:"border-danger-100 bg-danger-100/40 text-danger [&>svg]:text-danger dark:border-danger-100 dark:bg-danger-100/40 dark:text-danger",security:"border-secure-100 bg-secure-100/40 text-secure [&>svg]:text-secure dark:border-secure-100 dark:bg-secure-100/40 dark:text-secure"}},defaultVariants:{variant:"info"}}),T={info:w,success:b,warning:h,danger:k,security:x},o=i.forwardRef(({className:r,variant:e="info",icon:t,hideIcon:d,children:p,...g},m)=>{const f=T[e??"info"];return n.jsxs("div",{ref:m,role:"alert",className:a(N({variant:e}),r),...g,children:[!d&&(t??n.jsx(f,{className:"h-4 w-4","aria-hidden":"true"})),n.jsx("div",{className:"flex-1",children:p})]})});o.displayName="Alert";const c=i.forwardRef(({className:r,...e},t)=>n.jsx("p",{ref:t,className:a("font-semibold leading-tight",r),...e}));c.displayName="AlertTitle";const l=i.forwardRef(({className:r,...e},t)=>n.jsx("p",{ref:t,className:a("text-sm leading-relaxed opacity-90",r),...e}));l.displayName="AlertDescription";o.__docgenInfo={description:`Alert component for displaying contextual messages with semantic variants.
Automatically includes an appropriate icon based on the variant.

@example
// Info alert (default)
<Alert>
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

@example
// Success alert
<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>

@example
// Warning alert without icon
<Alert variant="warning" hideIcon>
  <AlertDescription>Please review before continuing.</AlertDescription>
</Alert>`,methods:[],displayName:"Alert",props:{icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Override the default icon for the variant"},hideIcon:{required:!1,tsType:{name:"boolean"},description:"Hide the icon entirely"},variant:{defaultValue:{value:'"info"',computed:!1},required:!1}},composes:["HTMLAttributes","VariantProps"]};c.__docgenInfo={description:"Bold title text for an Alert.",methods:[],displayName:"AlertTitle"};l.__docgenInfo={description:"Description text for an Alert with relaxed line height.",methods:[],displayName:"AlertDescription"};export{o as A,l as a,c as b};
