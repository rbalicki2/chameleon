# Chameleon JS

> Never worry about styling again

## What is Chameleon JS?

Chameleons JS is a library that facilitates the separation of style from content through the use context. The goal of the library is to allow you to write components that are automatically styled correctly, even they are moved to a different part of the app.

For example, you should be able to move a `Title` component unchanged from a jumbotron and into a panel, and have it style itself correctly in both situations. The following should also work:

```jsx
<Heading>This title will be rendered as an h1</Heading>
<Section>
  <Heading>This title will be rendered as an h2</Heading>
</Section>
```

## Why Chameleon JS?



## Quick overview of how to use Chameleon JS

In this quick overview, we'll use Chameleon JS to make a `Section` and `Header` components. By default, the `Header` component will render as an `h1`. However, within a `Section`, it will render as an `h2`. Within two nested sections, it will render as an `h3`, and so on.

* You create your `ContextChanger` by initializing it with a reducer. This package comes with several, out-of-the-box reducers for you to use. However, we're going to make our own:

```js
import { ContextChangerFactory } from 'chameleon';

const initialState = {
  headingLevel: 1,
};
const reducer = (state = initialState, { type }) => {
  if (type === "INCREASE_HEADING") {
    return {
      ...state,
      headingLevel: state.headingLevel + 1,
    };
  }
  return state;
}
```

* You (optionally) make components that "subclass" `ContextChanger` to make it easier to work with. For example,

```js
const IncreaseHeadingLevel = ({ children }) => <ContextChanger message="INCREASE_HEADING">
  { children }
</ContextChanger>
```

## Basi