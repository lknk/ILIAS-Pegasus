import {checkLocation} from "./diagnostics.util";

export function RequireLocation(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>>
): TypedPropertyDescriptor<any> {

  const method: Function = descriptor.value;

  descriptor.value = function (...args: Array<any>): Promise<any> {

    return checkLocation()
      .then(function(): Promise<any> {return Promise.resolve(method.apply(this, args))}.bind(this))
      .catch(err => Promise.reject(err));

  }.bind(this);

  return descriptor;
}
