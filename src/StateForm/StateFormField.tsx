import * as React from 'react';
import StateFormContext, { StateFormContextProps } from './StateFormContext';
import { defaultGetValueFromEvent, getNameList, getValue, matchUpdateNamePath } from './util';

export interface StateFormFieldProps {
  name: string | number | Array<string | number>;
}

export interface StateFormFieldState {
  prevValue: any;
}

interface ChildProps {
  value?: any;
  onChange?: (...args: any[]) => void;
}

// We use Class instead of Hooks here since it will cost much code by using Hooks.
class StateFormField extends React.PureComponent<StateFormFieldProps, any> {
  public static contextType = StateFormContext;

  public componentDidMount() {
    const { subscribe }: StateFormContextProps = this.context;
    subscribe(this.onStoreChange);
  }

  public componentWillUnmount() {
    const { unsubscribe }: StateFormContextProps = this.context;
    unsubscribe(this.onStoreChange);
  }

  // Check if need update the component
  public onStoreChange = (store: any, changedNamePath: Array<string | number> | null) => {
    const { name } = this.props;
    const namePath = getNameList(name);
    if (matchUpdateNamePath(namePath, changedNamePath)) {
      this.forceUpdate();
    }
  };

  public render() {
    const { name, children } = this.props;

    const child = React.Children.only(children);
    const namePath = getNameList(name);
    if (!React.isValidElement(child) || !namePath.length) {
      return child as any;
    }

    const { getStore, dispatch }: StateFormContextProps = this.context;
    const store = getStore();
    const value = getValue(store, namePath);

    return React.cloneElement(child, ({
      value,
      onChange(...args: any[]) {
        const newValue = defaultGetValueFromEvent(...args);
        dispatch({
          type: 'updateValue',
          namePath,
          value: newValue,
        });
      },
    } as any) as ChildProps);
  }
}

export default StateFormField;
