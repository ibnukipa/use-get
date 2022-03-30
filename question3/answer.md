####When should you use higher order components and pure components?

HOC and Pure Component is a different thing. HOC is an approach to make a generic component wrapper, usually adding a reusable calculated props data or component functionalities. Pure Component is an implementation for how the component re-render. Pure Component will swallow comparison the props changing and will re-render if there is a changing of the props.
But these day HOC and Pure Component is an old school implementation because of react or react native is already support for Hooks. Which means, we can use custom hook to replace HOC and memo to replace Pure Component.
