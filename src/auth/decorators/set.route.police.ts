import { SetMetadata } from "@nestjs/common";
import { ROUTE_POLICY_KEY } from "../auth.constants";
import { RoutePolicyEnum } from "../enum/route.policy.enum";

export const SetRoutePolicy = (policy: RoutePolicyEnum) => {
  return SetMetadata(ROUTE_POLICY_KEY, policy);
}