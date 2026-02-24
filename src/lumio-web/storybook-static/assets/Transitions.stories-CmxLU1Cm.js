import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{r as o}from"./iframe-BmexDAhZ.js";import{c as y}from"./utils-BQHNewu7.js";import{B as m}from"./button-Fj27Zx3k.js";import{C as w,d as S}from"./card-Bh23J6St.js";import"./preload-helper-PPVm8Dsz.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-B_yB00Wp.js";function I({show:t,children:n,className:i,duration:s=200,keepMounted:r=!1}){const[a,l]=o.useState(!1),[d,c]=o.useState(!1);return o.useEffect(()=>{if(t)l(!0),requestAnimationFrame(()=>c(!0));else if(a&&(c(!1),!r)){const u=setTimeout(()=>l(!1),s);return()=>clearTimeout(u)}},[t,a,s,r]),!a&&!r?null:e.jsx("div",{className:y("transition-opacity",d?"opacity-100":"opacity-0",i),style:{transitionDuration:`${s}ms`},children:n})}const N={up:t=>`translateY(${t}px)`,down:t=>`translateY(-${t}px)`,left:t=>`translateX(${t}px)`,right:t=>`translateX(-${t}px)`};function C({show:t,children:n,className:i,duration:s=200,keepMounted:r=!1,from:a="up",distance:l=16}){const[d,c]=o.useState(!1),[u,p]=o.useState(!1);if(o.useEffect(()=>{if(t)c(!0),requestAnimationFrame(()=>p(!0));else if(d&&(p(!1),!r)){const b=setTimeout(()=>c(!1),s);return()=>clearTimeout(b)}},[t,d,s,r]),!d&&!r)return null;const j=u?"translate(0)":N[a](l);return e.jsx("div",{className:y("transition-all",u?"opacity-100":"opacity-0",i),style:{transitionDuration:`${s}ms`,transitionTimingFunction:"ease-out",transform:j},children:n})}function g({show:t,children:n,className:i,duration:s=200,keepMounted:r=!1,initialScale:a=.95}){const[l,d]=o.useState(!1),[c,u]=o.useState(!1);return o.useEffect(()=>{if(t)d(!0),requestAnimationFrame(()=>u(!0));else if(l&&(u(!1),!r)){const p=setTimeout(()=>d(!1),s);return()=>clearTimeout(p)}},[t,l,s,r]),!l&&!r?null:e.jsx("div",{className:y("transition-all",c?"opacity-100":"opacity-0",i),style:{transitionDuration:`${s}ms`,transitionTimingFunction:"ease-out",transform:c?"scale(1)":`scale(${a})`},children:n})}I.__docgenInfo={description:`FadeIn - Simple opacity transition
Fades content in/out when show prop changes`,methods:[],displayName:"FadeIn",props:{show:{required:!0,tsType:{name:"boolean"},description:"Whether the content should be visible"},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Content to animate"},className:{required:!1,tsType:{name:"string"},description:"Additional class names"},duration:{required:!1,tsType:{name:"number"},description:"Duration of the animation in ms (default: 200)",defaultValue:{value:"200",computed:!1}},keepMounted:{required:!1,tsType:{name:"boolean"},description:"If true, don't unmount when hidden (useful for preserving state)",defaultValue:{value:"false",computed:!1}}}};C.__docgenInfo={description:`SlideIn - Slide + fade transition
Slides and fades content in/out when show prop changes`,methods:[],displayName:"SlideIn",props:{show:{required:!0,tsType:{name:"boolean"},description:"Whether the content should be visible"},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Content to animate"},className:{required:!1,tsType:{name:"string"},description:"Additional class names"},duration:{required:!1,tsType:{name:"number"},description:"Duration of the animation in ms (default: 200)",defaultValue:{value:"200",computed:!1}},keepMounted:{required:!1,tsType:{name:"boolean"},description:"If true, don't unmount when hidden (useful for preserving state)",defaultValue:{value:"false",computed:!1}},from:{required:!1,tsType:{name:"union",raw:'"up" | "down" | "left" | "right"',elements:[{name:"literal",value:'"up"'},{name:"literal",value:'"down"'},{name:"literal",value:'"left"'},{name:"literal",value:'"right"'}]},description:'Direction to slide from (default: "up")',defaultValue:{value:'"up"',computed:!1}},distance:{required:!1,tsType:{name:"number"},description:"Distance to slide in pixels (default: 16)",defaultValue:{value:"16",computed:!1}}}};g.__docgenInfo={description:`ScaleIn - Scale + fade transition
Scales and fades content in/out when show prop changes`,methods:[],displayName:"ScaleIn",props:{show:{required:!0,tsType:{name:"boolean"},description:"Whether the content should be visible"},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Content to animate"},className:{required:!1,tsType:{name:"string"},description:"Additional class names"},duration:{required:!1,tsType:{name:"number"},description:"Duration of the animation in ms (default: 200)",defaultValue:{value:"200",computed:!1}},keepMounted:{required:!1,tsType:{name:"boolean"},description:"If true, don't unmount when hidden (useful for preserving state)",defaultValue:{value:"false",computed:!1}},initialScale:{required:!1,tsType:{name:"number"},description:"Initial scale (default: 0.95)",defaultValue:{value:"0.95",computed:!1}}}};const E={title:"Primitives/Transitions",tags:["autodocs"],parameters:{docs:{description:{component:"Animated transition wrapper components for smooth enter/exit animations."}}}},f={render:function(){const[n,i]=o.useState(!0);return e.jsxs("div",{className:"space-y-4",children:[e.jsx(m,{onClick:()=>i(!n),children:n?"Verbergen":"Tonen"}),e.jsx(I,{show:n,children:e.jsx(w,{children:e.jsx(S,{className:"p-6",children:e.jsx("p",{children:"Dit element fade in en uit."})})})})]})}},h={render:function(){const[n,i]=o.useState(!0),[s,r]=o.useState("up");return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex gap-2 flex-wrap",children:[e.jsx(m,{onClick:()=>i(!n),children:n?"Verbergen":"Tonen"}),e.jsxs("select",{value:s,onChange:a=>r(a.target.value),className:"px-3 py-2 border rounded",children:[e.jsx("option",{value:"up",children:"Van boven"}),e.jsx("option",{value:"down",children:"Van onder"}),e.jsx("option",{value:"left",children:"Van links"}),e.jsx("option",{value:"right",children:"Van rechts"})]})]}),e.jsx(C,{show:n,from:s,children:e.jsx(w,{children:e.jsx(S,{className:"p-6",children:e.jsxs("p",{children:["Dit element schuift van ",s,"."]})})})})]})}},v={render:function(){const[n,i]=o.useState(!0);return e.jsxs("div",{className:"space-y-4",children:[e.jsx(m,{onClick:()=>i(!n),children:n?"Verbergen":"Tonen"}),e.jsx(g,{show:n,children:e.jsx(w,{children:e.jsx(S,{className:"p-6",children:e.jsx("p",{children:"Dit element schaalt in en uit."})})})})]})}},x={render:function(){const[n,i]=o.useState([1,2,3]),s=()=>i([...n,Math.max(...n,0)+1]),r=a=>i(n.filter(l=>l!==a));return e.jsxs("div",{className:"space-y-4",children:[e.jsx(m,{onClick:s,children:"Item toevoegen"}),e.jsx("div",{className:"space-y-2",children:n.map(a=>e.jsx(C,{show:!0,from:"left",children:e.jsx(w,{children:e.jsxs(S,{className:"p-4 flex justify-between items-center",children:[e.jsxs("span",{children:["Item ",a]}),e.jsx(m,{variant:"ghost",size:"sm",onClick:()=>r(a),children:"Verwijderen"})]})})},a))})]})}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [show, setShow] = useState(true);
    return <div className="space-y-4">\r
        <Button onClick={() => setShow(!show)}>\r
          {show ? "Verbergen" : "Tonen"}\r
        </Button>\r
        <FadeIn show={show}>\r
          <Card>\r
            <CardContent className="p-6">\r
              <p>Dit element fade in en uit.</p>\r
            </CardContent>\r
          </Card>\r
        </FadeIn>\r
      </div>;
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [show, setShow] = useState(true);
    const [direction, setDirection] = useState<"up" | "down" | "left" | "right">("up");
    return <div className="space-y-4">\r
        <div className="flex gap-2 flex-wrap">\r
          <Button onClick={() => setShow(!show)}>\r
            {show ? "Verbergen" : "Tonen"}\r
          </Button>\r
          <select value={direction} onChange={e => setDirection(e.target.value as "up" | "down" | "left" | "right")} className="px-3 py-2 border rounded">\r
            <option value="up">Van boven</option>\r
            <option value="down">Van onder</option>\r
            <option value="left">Van links</option>\r
            <option value="right">Van rechts</option>\r
          </select>\r
        </div>\r
        <SlideIn show={show} from={direction}>\r
          <Card>\r
            <CardContent className="p-6">\r
              <p>Dit element schuift van {direction}.</p>\r
            </CardContent>\r
          </Card>\r
        </SlideIn>\r
      </div>;
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [show, setShow] = useState(true);
    return <div className="space-y-4">\r
        <Button onClick={() => setShow(!show)}>\r
          {show ? "Verbergen" : "Tonen"}\r
        </Button>\r
        <ScaleIn show={show}>\r
          <Card>\r
            <CardContent className="p-6">\r
              <p>Dit element schaalt in en uit.</p>\r
            </CardContent>\r
          </Card>\r
        </ScaleIn>\r
      </div>;
  }
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [items, setItems] = useState([1, 2, 3]);
    const addItem = () => setItems([...items, Math.max(...items, 0) + 1]);
    const removeItem = (id: number) => setItems(items.filter(i => i !== id));
    return <div className="space-y-4">\r
        <Button onClick={addItem}>Item toevoegen</Button>\r
        <div className="space-y-2">\r
          {items.map(id => <SlideIn key={id} show={true} from="left">\r
              <Card>\r
                <CardContent className="p-4 flex justify-between items-center">\r
                  <span>Item {id}</span>\r
                  <Button variant="ghost" size="sm" onClick={() => removeItem(id)}>\r
                    Verwijderen\r
                  </Button>\r
                </CardContent>\r
              </Card>\r
            </SlideIn>)}\r
        </div>\r
      </div>;
  }
}`,...x.parameters?.docs?.source}}};const _=["FadeInDemo","SlideInDemo","ScaleInDemo","CombinedExample"];export{x as CombinedExample,f as FadeInDemo,v as ScaleInDemo,h as SlideInDemo,_ as __namedExportsOrder,E as default};
