const infoContainer = {};
let currentSymbol = null;
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
  function noSupport(feature) {
    console.warn(`No support for ${feature}, please add /** @jsx hooks */`);
  }