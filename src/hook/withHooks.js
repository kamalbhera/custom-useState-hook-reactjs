import React from "react";

const wrapped = new Map();

export default function hooks(element, props, ...children) {
  const e =
    typeof element === "function"
      ? (wrapped.has(element)
          ? wrapped
          : wrapped.set(element, withHooks(element))
        ).get(element)
      : element;
  return React.createElement(e, props, ...children);
}

let currentSymbol = null;
const infoContainer = {};
function noSupport(feature) {
  console.warn(`No support for ${feature}, please add /** @jsx hooks */`);
}

export function useContext(context) {
  return context._currentValue;
}

export function useRef(initialValue) {
  return useMemo(() => {
    const ref = React.createRef();
    ref.current = initialValue;
    return ref;
  }, []);
}

export function useCallback(callback, inputs) {
  return useMemo(() => callback, inputs);
}

export function useMemo(createValue, inputs) {
  const info = infoContainer[currentSymbol];
  if (!info) return noSupport("useMemo") || createValue();

  const { memos } = info;

  const hookIndex = info.useMemoCounter++;
  const previous = memos[hookIndex];
  if (previous && equalArrays(inputs, previous.inputs)) {
    return previous.value;
  } else {
    const value = createValue();
    memos[hookIndex] = { value, inputs };
    return value;
  }
}

export function useReducer(reducer, initialState, initialAction) {
  const [state, setState] = useState(
    initialAction ? reducer(initialState, initialAction) : initialState
  );
  return [state, a => setState(reducer(state, a))];
}

export function useState(initialValue, name) {
  const info = infoContainer[currentSymbol];
  if (!info) return noSupport("useState") || [initialValue, () => {}];

  const { values, forceUpdate } = info;

  const hookIndex = info.useStateCounter++;
  const value = hookIndex in values ? values[hookIndex] : initialValue;

  return [
    value,
    value => {
      values[hookIndex] = value;
      forceUpdate();
    }
  ];
}

export const useLayoutEffect = useEffect;
export const useMutationEffect = useEffect;
// useEffect in this implementation is actually useLayoutEffect
export function useEffect(doEffect, inputs) {
  const info = infoContainer[currentSymbol];
  if (!info) return noSupport("useEffect");

  const { effects, effectsQueue } = info;
  const hookIndex = info.useEffectCounter++;
  const effect = effects[hookIndex];
  const inputChanged =
    effect && (!inputs || !equalArrays(inputs, effect.inputs));

  if (!effect || inputChanged) {
    effectsQueue.push(() => {
      effect && effect.cleanup && effect.cleanup();
      effects[hookIndex] = {
        inputs,
        cleanup: doEffect()
      };
    });
  }
}

export function withHooks(Wrapped) {
  class WithHooks extends React.Component {
    symbol = Symbol(Wrapped.name);
    info = (infoContainer[this.symbol] = {
      values: {},
      forceUpdate: this.forceUpdate.bind(this),
      useStateCounter: 0,
      useEffectCounter: 0,
      useMemoCounter: 0,
      effectsQueue: [],
      effects: [],
      memos: {}
    });

    render() {
      currentSymbol = this.symbol;
      this.info.useStateCounter = 0;
      this.info.useEffectCounter = 0;
      this.info.useMemoCounter = 0;

      return <Wrapped {...this.props} useEffect={useEffect} />;
    }

    componentWillUnmount() {
      this.mounted = false;
      this.info.effects.forEach(x => x.cleanup && x.cleanup());
    }

    componentDidMount() {
      this.mounted = true;
      this.runEffects();
    }

    componentDidUpdate() {
      this.runEffects();
    }

    runEffects() {
      this.info.effectsQueue.forEach(x => x());
      this.info.effectsQueue = [];
    }
  }

  return WithHooks;
}

function equalArrays(arr1 = [], arr2 = []) {
  return (
    arr1 === arr2 ||
    (arr1.length === arr2.length && !arr1.find((x, i) => x !== arr2[i]))
  );
}
