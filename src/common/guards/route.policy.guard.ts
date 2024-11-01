import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROUTE_POLICY_KEY } from "src/auth/auth.constants";
import { RoutePolicyEnum } from "src/auth/enum/route.policy.enum";

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    
   const routePolicyRequired = this.reflector
    .get<RoutePolicyEnum | undefined>(
      ROUTE_POLICY_KEY, context.getHandler()
    );
   console.log(routePolicyRequired)
   
    return true;
    
  }
}