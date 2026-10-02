import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';
function TooltipProvider({delayDuration=0,...props}){return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props}/>}
function Tooltip({...props}){return <TooltipPrimitive.Root {...props}/>}
function TooltipTrigger({...props}){return <TooltipPrimitive.Trigger {...props}/>}
function TooltipContent({className,children,...props}){return <TooltipPrimitive.Portal><TooltipPrimitive.Content className={cn('z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background',className)} {...props}>{children}</TooltipPrimitive.Content></TooltipPrimitive.Portal>}
export {Tooltip,TooltipTrigger,TooltipContent,TooltipProvider};
