# Chameleon API

Throughout this section, we will use `<C>` or `C` to refer to the type of the context, and `<A>` or `A` to refer to the type of the action. If you're not familiar with generics, you can ignore those annotations.

## `chameleon.makeContextComponents`

```js
import { makeContextComponents } from 'chameleon';
```

`makeContextComponents` is a function which takes a reducer and an initial context, and returns `{ UpdateContext, ContextProvider, updateContextGenerator, propertyComponentGenerator }`.

Signature: 
```js
(Reducer<C, A>, C) => {
  UpdateContext: UpdateContext<A>,
  ContextProvider: ContextProvider<C>,
  updateContextGenerator: UpdateContextGenerator<A>,
  propertyComponentGenerator: PropertyComponentGenerator<C>,
}
```

Example:

```js
const {
  UpdateContext,
  ContextProvider,
  updateContextGenerator,
  propertyComponentGenerator,
} = makeContextComponents(contextReducer, initialContext);
```

### type `Reducer<C, A>`

This is a function that takes the previous context and the action, and returns a new context. It's signature is:
```js
(C, A) => C
```

**Important**: If you are mutating the context, you must return a new object! Never mutate `previousContext`!

Example:

```js
const contextReducer = (previousContext, { type }) => {
  if (type === 'INCREMENT_SECTION_DEPTH') {
    return {
      ...previousContext,
      sectionDepth: previousContext.sectionDepth + 1,
    };
  }
  return previousContext;
}
```

### type `UpdateContext<A>`

A component whose props are of type `<A>` and which renders its children.

For example, `<UpdateContext foo="bar">` will cause the reducer to be called with a second parameter of `{foo: 'bar'}`.

### type `ContextProvider<C>`

A render-prop component which passes the current context, of type `C`, to its children.

Example:

```js
<ContextProvider>{ context => ... }</ContextProvider>
```

### type `UpdateContextGenerator<A>`

A function that takes an action, and which returns a component that always passes the same action to the reducer.

Example:

```js
const IncrementSectionDepth = updateContextGenerator({ type: 'INCREMENT_SECTION_DEPTH' });
```

### type `PropertyComponentGenerator<C>`

An example can help illustrate this. The following are equivalent:

```js
const Header = (props) => (<ContextProvider>{ context =>
  <context.Header { ...props } />
}</ContextProvider>);
const Header = propertyComponentGenerator(context => context.Header);
```

A function of type `PropertyComponentGenerator<C>` has the signature:

```js
(C => Component) => Component
```

## `chameleon.simpleReducer`

```js
import { simpleReducer } from 'chameleon/lib/reducers';
// or
import { reducers } from 'chameleon';
const { simpleReducer } = reducers;
```

A reducer that returns a new context object with values assigned from the props.

If `UpdateContext` was created with `simpleReducer` and we write `<UpdateContext foo="bar">{ innerContext => ... }</UpdateContext>`, then `innerContext.foo` will equal `"bar"`.

## `chameleon.functionReducer`

```js
import { functionReducer } from 'chameleon/lib/reducers';
// or
import { reducers } from 'chameleon';
const { functionReducer } = reducers;
```

A reducer that applies the prop `call` to the context.

If `UpdateContext` was created with `functionReducer` and we write:

```js
const callFn = (outerContext) => { ...innerContext, foo: 'bar' };
<UpdateContext call={callFn}>{ innerContext => ... }</UpdateContext>
```

In this case, `innerContext.foo` will equal `"bar"`, as long as `outerContext` is not a primitive (`string`, `boolean`, `undefined`, `null` or `number`).

Be careful! You must remember to not mutate `outerContext` yourself. Always return a new object if you are mutating the context.
