import { UiNode } from '@ory/client';

export interface OryNodeAttributes {
  name: string;
  type: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
}

export interface OryNode {
  type: string;
  group: string;
  attributes: OryNodeAttributes;
  messages?: Array<{
    id: number;
    text: string;
    type: string;
  }>;
  meta?: Record<string, unknown>;
}

export interface OryErrorResponse {
  response?: {
    status: number;
    data?: {
      redirect_browser_to?: string;
    };
  };
}

export function isOryNode(node: unknown): node is OryNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'attributes' in node &&
    typeof (node as Record<string, unknown>).attributes === 'object' &&
    (node as Record<string, unknown>).attributes !== null &&
    'name' in ((node as Record<string, unknown>).attributes as Record<string, unknown>) &&
    'type' in ((node as Record<string, unknown>).attributes as Record<string, unknown>) &&
    'value' in ((node as Record<string, unknown>).attributes as Record<string, unknown>)
  );
}

export function isUiNode(node: UiNode | OryNode): node is UiNode {
  return 'node_type' in node.attributes;
}
