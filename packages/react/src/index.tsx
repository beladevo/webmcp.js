import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type PropsWithChildren
} from "react";
import {
  createWebMCP,
  type CreateWebMCPOptions,
  type InferSchemaOutput,
  type ToolDefinition,
  type WebMCPInstance
} from "@webmcp-js/core";

const WebMCPContext = createContext<WebMCPInstance | null>(null);

export type WebMCPProviderProps = PropsWithChildren<CreateWebMCPOptions>;

export function WebMCPProvider({ children, ...options }: WebMCPProviderProps) {
  const instance = useMemo(() => createWebMCP(options), [options.adapter]);
  return createElement(WebMCPContext.Provider, { value: instance }, children);
}

export function useWebMCP(): WebMCPInstance {
  const instance = useContext(WebMCPContext);
  if (!instance) {
    throw new Error("useWebMCP must be used within a WebMCPProvider.");
  }
  return instance;
}

export function useWebMCPTool<TSchema = undefined, TOutput = unknown>(
  name: string,
  definition: ToolDefinition<
    TSchema extends undefined ? unknown : InferSchemaOutput<TSchema>,
    TOutput
  > & {
    input?: TSchema;
  }
): void;
export function useWebMCPTool<TInput, TOutput>(
  name: string,
  definition: ToolDefinition<TInput, TOutput>
): void {
  const mcp = useWebMCP();
  const registeredName = useRef<string | null>(null);

  useEffect(() => {
    if (registeredName.current === name) return;
    if (registeredName.current && registeredName.current !== name) {
      void mcp.unregister(registeredName.current);
    }

    const registerTool = mcp.tool as <I, O>(
      toolName: string,
      toolDefinition: ToolDefinition<I, O>
    ) => { unregister(): Promise<void> };
    const handle = registerTool(name, definition);
    registeredName.current = name;

    return () => {
      if (registeredName.current === name) {
        registeredName.current = null;
        void handle.unregister();
      }
    };
  }, [mcp, name, definition]);
}

export type { CreateWebMCPOptions, ToolDefinition, WebMCPInstance } from "@webmcp-js/core";
