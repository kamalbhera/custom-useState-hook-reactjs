export const useState = (initialState) => {
    let state = initialState;
    function setState(newState) {
      //we can also add few conditions to validate the data.
      state = newState;
    //   render(); //your custom method to trigger page refresh on state change
    }
    return [state, setState];
}