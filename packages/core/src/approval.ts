import type { ApprovalConfig, ApprovalPolicy, ToolRisk } from "./types.js";

export interface ApprovalDecision {
  required: boolean;
  reason: string;
}

export function matchesToolName(pattern: string, name: string): boolean {
  if (pattern === name || pattern === "*") return true;
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(name);
}

export function decideApproval(params: {
  name: string;
  risk: ToolRisk;
  toolApproval?: boolean;
  config?: ApprovalConfig;
}): ApprovalDecision {
  if (params.toolApproval !== undefined) {
    return {
      required: params.toolApproval,
      reason: params.toolApproval
        ? "Tool definition requires approval."
        : "Tool definition disables approval."
    };
  }

  const rule = params.config?.rules?.find((candidate) =>
    matchesToolName(candidate.match, params.name)
  );
  if (rule) {
    return {
      required: rule.requireApproval,
      reason: rule.reason ?? `Matched approval rule "${rule.match}".`
    };
  }

  return defaultApprovalDecision(params.config?.policy ?? "risk-based", params.risk);
}

function defaultApprovalDecision(policy: ApprovalPolicy, risk: ToolRisk): ApprovalDecision {
  if (policy === "require-all") {
    return { required: true, reason: "Approval policy requires approval for every tool." };
  }

  if (policy === "allow-all") {
    return { required: false, reason: "Approval policy allows tools without approval." };
  }

  if (risk === "high" || risk === "critical") {
    return { required: true, reason: `${risk} risk tools require approval by default.` };
  }

  return { required: false, reason: `${risk} risk tools do not require approval by default.` };
}
