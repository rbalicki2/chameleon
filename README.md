# Chameleon

> Never mix business logic and styles again!

<img src="https://www.stickers-factory.com/media/catalog/product/cache/1/image/1000x/040ec09b1e35df139433887a97daa66f/0/9/09361_00.png" height="100px" width="auto" />

## What is Chameleon?

Chameleon is a library that allows you write components that are styled differently depending on where they are in your app. A `Header` component might render at 40px by default, or at 35px within a `Panel`. It might be colored blue by default, or yellow in night mode.

The goal of Chameleon is to allow you to completely separate styles from business logic.

## Quick overview of how to use Chameleon

In this quick overview, we'll use Chameleon to make `Section` and `Header` components. By default, a `Header` component will render at 40px. However, within a `Section`, it ·will render at 35px. Within two nested sections, it will render at 30px, and so on.

* **Step 1**: Create your `UpdateContext` and `ContextProvider` components. To do this, you need to use a reducer. Chameleon comes with several, out-of-the-box reducers. However, we're going to write our own:

```js
// StyleContext.js
import { makeContextComponents } from 'chameleon';

const initialContext = {
  sectionDepth: 0,
};
const contextReducer = (previousContext, { type }) => {
  if (type === 'INCREMENT_SECTION_DEPTH') {
    return {
      ...previousContext,
      sectionDepth: previousContext.sectionDepth + 1,
    };
  }
  return previousContext;
};

const { UpdateContext, ContextProvider } = makeContextComponents(contextReducer, initialContext);
export {
  UpdateContext,
  ContextProvider,
};
```

* **Step 2**: Make a `Section` component that wraps `UpdateContext`.

```js
// Section.js
import { UpdateContext } from './StyleContext';

export default ({ children }) => (<UpdateContext type="INCREMENT_SECTION_DEPTH">
  { children }
</UpdateContext>);
```

* Now, let's make a heading component which reads the `sectionDepth` from the context. 

```js
// Header.js
import styled from 'styled-components';
import { ContextProvider } from './StyleContext';

export default const ({ children }) => (<ContextProvider>{context => {
  const Header = styled.span`
    fontSize: ${40 - context.sectionDepth * 5}px; 
  `;
  return <Header>{ children }</Header>;
}}</ContextProvider>);
```

* Use them!

```js
const MyArticle = () => (<div>
  <Header>How To Use Chameleon</Header>
  <Section>
    <Header>This subheader has a font size of 35 pixels!</Header>
    <Section>
      <Header>This sub-sub-header has a font size of 30 pixels! Neat!</Header>
    </Section>
  </Section>
</div>);
```

## That was a silly, contrived example... what else should one use Chameleon for?

Chameleon is for managing all aspects of style. For example:

* It can manage the color palette or theme (e.g. having separate night and day modes, or varying color schemes across sections of a marketing site). Whitelabel your site and use Chameleon to match a vendor's style. Pair this with CSS transitions and watch your whole site effortlessly transition!
* It can modify the font size, color, etc. of elements when they are placed within a modal, panel or section, or when nested within two panels!
* Turn off `pointer-events` and modify the `cursor` for a section of the site that is disabled, or which is behind a modal.
* Control flex, css grid or regular layout of children. For an example, a `<FormGroup>` can render differently within an `<InlineForm>` or within a `<Form>`.
* Padding: use Chameleon to control the left-padding of nested comments.
* Manage heading levels, as in the previous example.

## Recommended patterns

For the sake of brevity, the minimal example omits several patterns and advanced features.

* Create components that wrap `<UpdateContext>`. In the minimal example, there's no reason to simplify the API. But once you start passing more parameters to `<UpdateContext>`, you will benefit from components like the following:

```js
// Nightmode.js
import React from 'react';
import { UpdateContext } from './StyleContext';
const NightMode = ({ children }) => <UpdateContext
  type="CHANGE_MODE"
  bgColor="black"
  color="white"
  {/* etc */}
>
  { children }
</UpdateContext>
```

Note: You can also consider simplifying your action's API. `type="CHANGE_MODE" mode="NIGHT"` might be sufficient, and not require a wrapping component.

* Wrap the context in a class, and have derived setters and getters. Make the class immutable by having all setters return a new instance of the class. **Both of these are very important for larger projects.** Example:

```js
// StyleContext.js
import styled from 'styled-components';

class StyleContext {
  constructor(context) {
    this.context = context;
  }

  get foregroundStyleFromMode() {
    return ({
      NIGHT: `
        color: yellow;
        &:hover {
          color: gold; 
        }
      `,
      DAY: `
        color: blue;
        &:hover {
          color: cyan;
        }
      `,
    })[this.context.mode];
  }

  get headingStyleFromSectionDepth() {
    return `
      font-size: ${40 - 5 * this.context.sectionDepth}px;
      line-height: 1em;
      font-weight: ${800 - 100 * this.context.sectionDepth};
      margin-bottom: ${20 - 2 * this.context.sectionDepth}px;
    `;
  }

  get Header() {
    return styled.span`
      ${this.foregroundStyleFromMode}
      ${this.headingStyleFromSectionDepth}
    `;
  }

  incrementSectionDepth() {
    return new StyleContext({
      ...this.context,
      sectionDepth: this.context.sectionDepth + 1,
    });
  }
}

const contextReducer = (previousContext, action) => {
  switch (action.type) {
    case "INCREMENT_SECTION_DEPTH":
      return previousContext.incrementSectionDepth();
    // ... case "CHANGE_MODE": ...
  }
  return previousContext;
}

// Header.js
export default (props) => (<ContextProvider>{ context =>
  <context.Header { ...props } />
}</ContextProvider>);
```

Let's take a minute to appreciate what we've achieved here. We have a `<Header>` component that is styled correctly in night and day modes, and which gets progressively smaller as it is wrapped in more sections. It even has correct hover behavior, thanks to the magic of styled components!

Furthermore, we have a clean API (`contextReducer`) for making multiple updates to the context! This means that, whenever we use a component that updates the context (a `<Panel>`, or a component that indicates a modal has been overlaid), we don't need to worry about knowing the whole context. We just need to know how *this one component modifies it*.

Lastly, we have set ourselves up for maximal code reuse. Many components (buttons, headings, emphasized text, etc.) might re-use the same colors, allowing us to reuse `get foregroundStyleFromMode`.

* Use the `updateContextGenerator`. `makeContextComponents` also returns `updateContextGenerator`, which is a convenient wrapper around `<UpdateContext>`. Example:

```js
const { UpdateContext, updateContextGenerator } = makeContextComponents(contextReducer, initialContext);

// the following are equivalent:
const IncrementSectionDepth = updateContextGenerator({ type: 'INCREMENT_SECTION_DEPTH' });
const IncrementSectionDepth = ({ children }) => (<UpdateContext type="INCREMENT_SECTION_DEPTH">
  { children }
</UpdateContext>);
```

* Use the `propertyComponentGenerator`. `makeContextComponents` also returns `propertyComponentGenerator`, which is a convenient wrapper for very simple components. For example, the following are equivalent:

```js
const Header = ({ ...props }) => (<ContextProvider>{ context =>
  <context.Header { ...props } />
}</ContextProvider>);
const Header = propertyComponentGenerator(context => context.Header);
```

* Combine `<ContextProvider>` and `<UpdateContext>` to make components (such as `<Panel>`s, `<Section>`s and `<Modal>`s) which are styled in a specific way and which also update their context.

* For simple projects, you can use the `defaultReducer`, which just updates fields on the context object. It is effectively:

```js
const defaultReducer = (previousContext, action) => {
  ...previousContext,
  ...action,
};
```
* Conform to redux best practices! Create a `Types` enum, etc.

## Chameleon doesn't need to be for only styles

* You're right. Any props that are passed purely downward through the component heirarchy can be passed through context in this way. Do what's right for your project!

## Full API

Throughout this section, we will use `<C>` or `C` to refer to the type of the context, and `<A>` or `A` to refer to the type of the action. If you're not familiar with generics, you can safely ignore those annotations.

### function `makeContextComponents`

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

### type `Reducer<C, A>`

This is a function that takes the oldContext and the action, and returns a new context. It's signature is:
```js
(C, A) => C
```

### type `UpdateContext<A>`

A component whose props are of type `<A>` and which renders its children.

### type `ContextProvider<C>`

A render-prop component which passes the current context, of type `C` to its children.

### type `UpdateContextGenerator<A>`

A function that takes an action, and which returns a component that always passes the same action to the reducer.

### type `PropertyComponentGenerator<C>`

A function whose signature is:

```js
(C => component) => component
```

An example can illustrate this better. The following are equivalent:

```js
const Header = (props) => (<ContextProvider>{ context =>
  <context.Header { ...props } />
}</ContextProvider>);
const Header = propertyComponentGenerator(context => context.Header);
```

## FAQ

### Why update context with reducers?

* Reducers are a great way to handle multiple updates to a single model (the context), without knowing everything about the context up until that point. For example, in the following component tree:

```js
<UpdateContext type="INCREMENT_SECTION_DEPTH">
  <UpdateContext type="INVERT_COLORS">
    1
  </UpdateContext>
</UpdateContext>
```

Both calls to the component reducer only need to know how to do their specific update, rather than having knowledge of all of the context.

* In addition, reducers allow us to cache intermediate results, resulting in efficiency gains. In the following component tree:

```js
<UpdateContext type="INCREMENT_SECTION_DEPTH">
  <UpdateContext type="INVERT_COLORS">
    1
  </UpdateContext>
  <UpdateContext type="MAKE_EVERYTHING_BACKWARDS">
    2
  </UpdateContext>
</UpdateContext>
```

The context at 1 is:

```js
contextReducer(
  contextReducer(initialContext, { type: 'INCREMENT_SECTION_DEPTH'}),
  { type: 'INVERT_COLORS' }
)
```

and the context at 2 is:

```js
contextReducer(
  contextReducer(initialContext, { type: 'INCREMENT_SECTION_DEPTH'}),
  { type: 'MAKE_EVERYTHING_BACKWARDS' }
)
```

`contextReducer(initialContext, { type: 'INCREMENT_SECTION_DEPTH'})` is reused in both cases, and Chameleon makes sure to reuse that intermediate result!
