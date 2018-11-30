import { Order } from "./order";
import { Mutation } from "./misc";

/**
 * 
 */
export interface OrderGatewayBase {
  readonly id: string;
  claim(order: Order): Promise<string>;
  perform(order: Order, claim: string): Promise<Mutation>;
  cancel(order: Order): Promise<Mutation>;
}
