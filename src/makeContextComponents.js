import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default (contextReducer, initialContext, contextKey = 'styleContext') => {
  const contextPropObject = {
    [contextKey]: PropTypes.any,
  };
  const getDefaultContext = context => (
    typeof context === 'undefined'
      ? initialContext
      : context
  );

  class UpdateContext extends Component {
    static childContextTypes = contextPropObject;
    static contextTypes = contextPropObject;

    getChildContext() {
      return {
        [contextKey]: contextReducer(
          getDefaultContext(this.context[contextKey]),
          // TODO exclude props.children
          this.props
        ),
      };
    }

    render() {
      return this.props.children;
    }
  }

  class ContextProvider extends Component {
    static contextTypes = contextPropObject;
    render() {
      return this.props.children(
        getDefaultContext(this.context[contextKey])
      );
    }
  }

  const updateContextGenerator = action => props => <UpdateContext {...action} {...props} />;
  const propertyComponentGenerator = getter => {
    return props => (<ContextProvider>{context => {
      const Component = getter(context);
      return <Component {...props} />;
    }}</ContextProvider>)
  };

  return {
    UpdateContext,
    ContextProvider,
    updateContextGenerator,
    propertyComponentGenerator,
  };
};
