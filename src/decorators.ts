import { createDecorator } from 'vue-class-component/lib/util';

export const NoCache = createDecorator((options, key) => {
  // component options should be passed to the callback
  // and update for the options object affect the component
  const prop = <any>(<any>options.computed)[key];
  prop.cache = false;
})
