import{j as d}from"./jsx-runtime-D4KrBPkj.js";import{c as p}from"./utils-BQHNewu7.js";import{c as v}from"./index-LHNt3CwB.js";import{r as a,e as C}from"./iframe-BmexDAhZ.js";import{c as j}from"./createLucideIcon-B_yB00Wp.js";const B=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],E=j("loader-circle",B);function y(e,n){if(typeof e=="function")return e(n);e!=null&&(e.current=n)}function S(...e){return n=>{let r=!1;const o=e.map(t=>{const i=y(t,n);return!r&&typeof i=="function"&&(r=!0),i});if(r)return()=>{for(let t=0;t<o.length;t++){const i=o[t];typeof i=="function"?i():y(e[t],null)}}}}var _=Symbol.for("react.lazy"),f=C[" use ".trim().toString()];function L(e){return typeof e=="object"&&e!==null&&"then"in e}function b(e){return e!=null&&typeof e=="object"&&"$$typeof"in e&&e.$$typeof===_&&"_payload"in e&&L(e._payload)}function R(e){const n=N(e),r=a.forwardRef((o,t)=>{let{children:i,...l}=o;b(i)&&typeof f=="function"&&(i=f(i._payload));const s=a.Children.toArray(i),u=s.find(V);if(u){const c=u.props.children,x=s.map(m=>m===u?a.Children.count(c)>1?a.Children.only(null):a.isValidElement(c)?c.props.children:null:m);return d.jsx(n,{...l,ref:t,children:a.isValidElement(c)?a.cloneElement(c,void 0,x):null})}return d.jsx(n,{...l,ref:t,children:i})});return r.displayName=`${e}.Slot`,r}var w=R("Slot");function N(e){const n=a.forwardRef((r,o)=>{let{children:t,...i}=r;if(b(t)&&typeof f=="function"&&(t=f(t._payload)),a.isValidElement(t)){const l=P(t),s=T(i,t.props);return t.type!==a.Fragment&&(s.ref=o?S(o,l):l),a.cloneElement(t,s)}return a.Children.count(t)>1?a.Children.only(null):null});return n.displayName=`${e}.SlotClone`,n}var k=Symbol("radix.slottable");function V(e){return a.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===k}function T(e,n){const r={...n};for(const o in n){const t=e[o],i=n[o];/^on[A-Z]/.test(o)?t&&i?r[o]=(...s)=>{const u=i(...s);return t(...s),u}:t&&(r[o]=t):o==="style"?r[o]={...t,...i}:o==="className"&&(r[o]=[t,i].filter(Boolean).join(" "))}return{...e,...r}}function P(e){let n=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,r=n&&"isReactWarning"in n&&n.isReactWarning;return r?e.ref:(n=Object.getOwnPropertyDescriptor(e,"ref")?.get,r=n&&"isReactWarning"in n&&n.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}const h=v("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),g=a.forwardRef(({className:e,variant:n,size:r,loading:o,disabled:t,asChild:i=!1,children:l,...s},u)=>{const c=i?w:"button";return i?d.jsx(c,{className:p(h({variant:n,size:r,className:e})),ref:u,...s,children:l}):d.jsxs(c,{className:p(h({variant:n,size:r,className:e}),"relative"),ref:u,disabled:t||o,...s,children:[d.jsx("span",{className:p("inline-flex items-center gap-2",o&&"invisible"),children:l}),o&&d.jsx("span",{className:"absolute inset-0 flex items-center justify-center",children:d.jsx(E,{className:"h-4 w-4 animate-spin"})})]})});g.displayName="Button";g.__docgenInfo={description:`Button component with variant styles, loading state, and polymorphic rendering.

@example
// Default button
<Button>Click me</Button>

@example
// Destructive variant with loading
<Button variant="destructive" loading>Deleting...</Button>

@example
// Link styled as a button (polymorphic)
<Button asChild variant="outline">
  <a href="/external">External Link</a>
</Button>`,methods:[],displayName:"Button",props:{loading:{required:!1,tsType:{name:"boolean"},description:`Show a loading spinner and disable the button.
The button content is hidden but preserved to maintain width.`},asChild:{required:!1,tsType:{name:"boolean"},description:`When true, renders the child element directly with button styles applied
instead of wrapping in a \`<button>\`. Useful for rendering links styled as buttons.

@example
// Render a Next.js Link styled as a button
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

@default false`,defaultValue:{value:"false",computed:!1}}},composes:["ButtonHTMLAttributes","VariantProps"]};export{g as B,E as L};
